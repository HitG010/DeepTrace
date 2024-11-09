from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torch.utils.model_zoo import load_url
from torchvision.transforms import ToPILImage
from PIL import Image
import io
import numpy as np
import sys
import os
sys.path.append('..')

from blazeface import FaceExtractor, BlazeFace
from architectures import fornet, weights
from isplutils import utils

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Parameters
net_model = 'EfficientNetAutoAttB4'
train_db = 'DFDC'
device = torch.device('cuda:0') if torch.cuda.is_available() else torch.device('cpu')
face_policy = 'scale'
face_size = 224

# Load model weights
model_url = weights.weight_url['{:s}_{:s}'.format(net_model, train_db)]
net = getattr(fornet, net_model)().eval().to(device)
net.load_state_dict(load_url(model_url, map_location=device, check_hash=True))

# Transformer and Face detector
transf = utils.get_transformer(face_policy, face_size, net.get_normalizer(), train=False)
facedet = BlazeFace().to(device)
facedet.load_weights("../blazeface/blazeface.pth")
facedet.load_anchors("../blazeface/anchors.npy")
face_extractor = FaceExtractor(facedet=facedet)

def get_face(image):
    # Extract face from the image
    face_data = face_extractor.process_image(img=image)
    if 'faces' in face_data and len(face_data['faces']) > 0:
        return face_data['faces'][0]  # Return the face with the highest confidence
    return None

def predict_face(face):
    # Transform the face and make a prediction
    face_t = transf(image=face)['image']
    with torch.no_grad():
        score = torch.sigmoid(net(face_t.unsqueeze(0).to(device))).item()
    return score

@app.route('/predict', methods=['POST'])
def predict():
    print("Received request")
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    print("Received file:", file.filename)
    image = Image.open(io.BytesIO(file.read())).convert('RGB')

    # Extract face
    face = get_face(image)
    print("Face:", face)
    if face is None:
        return jsonify({"error": "No face detected"}), 400

    # Predict score
    score = predict_face(face)
    print("Score:", score)
    result = "FAKE" if score > 0.5 else "REAL"
    print("Result:", result)
    return jsonify({"score": score, "result": result}), 200

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=8080)
