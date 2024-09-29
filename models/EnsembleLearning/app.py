import tensorflow as tf
import os
import cv2
import numpy as np
from tensorflow.keras.utils import to_categorical

# Load models
model1 = tf.keras.models.load_model("C:\\ML Resources\\Models\\LRCN_DF_40SL_100ep_2.h5")
model2 = tf.keras.models.load_model("C:\\ML Resources\\Models\\LRCN_DF_40SL_100ep_2.h5")
_ = model1(tf.keras.Input(shape=(40, 64, 64, 3)))
_ = model2(tf.keras.Input(shape=(40, 64, 64, 3)))
# Modify models to extract features by removing the classification heads
model1_features = tf.keras.Model(inputs=model1.input, outputs=model1.layers[-2].output)
model2_features = tf.keras.Model(inputs=model2.input, outputs=model2.layers[-2].output)
print("Model 1 Features Summary:")
model1_features.summary()
print("\nModel 2 Features Summary:")
model2_features.summary()
# Input shape for video frames (assuming 30 frames of size 224x224 with 3 channels)
input_shape = (40, 64, 64, 3)

# Define the input layer
input_layer = tf.keras.layers.Input(shape=input_shape)

# Extract features from both models
features1 = model1_features(input_layer)
features2 = model2_features(input_layer)

print("Model 1 Features Shape:", features1.shape)
print("Model 2 Features Shape:", features2.shape)
# Concatenate extracted features from both models
# Make sure the features have compatible shapes
concatenated_features = tf.keras.layers.Concatenate(axis=-1)([features1, features2])

# Process concatenated features through a small CNN
x = tf.keras.layers.Conv2D(64, kernel_size=(3, 3), activation='relu')(concatenated_features)
x = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(x)
x = tf.keras.layers.Flatten()(x)

# Output layer for binary classification (real/fake)
output_layer = tf.keras.layers.Dense(2, activation='softmax')(x)

# Define and compile the ensemble model
ensemble_model = tf.keras.Model(inputs=input_layer, outputs=output_layer)
ensemble_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])



def extract_frames(video_path, num_frames=30, resize=(224, 224)):
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Extract evenly spaced frames
    step = max(1, frame_count // num_frames)
    for i in range(0, frame_count, step):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, resize)
            frames.append(frame)
        if len(frames) >= num_frames:
            break
    cap.release()
    
    # If there are fewer frames, pad the list with black frames
    while len(frames) < num_frames:
        frames.append(np.zeros_like(frames[0]))
    
    return np.array(frames) / 255.0  # Normalize pixel values

# Function to preprocess a single video
def preprocess_video(video_path, num_frames=30, resize=(224, 224)):
    return extract_frames(video_path, num_frames, resize)

# Data generator for loading batches of video data
def data_generator(video_paths, labels, batch_size=16, num_frames=30, resize=(224, 224)):
    while True:
        for i in range(0, len(video_paths), batch_size):
            batch_videos = video_paths[i:i + batch_size]
            batch_labels = labels[i:i + batch_size]
            
            # Preprocess each video in the batch
            X = np.array([preprocess_video(video, num_frames, resize) for video in batch_videos])
            y = to_categorical(batch_labels, num_classes=2)  # Convert labels to one-hot encoding
            
            yield X, y
            
            
real_videos_dir = "C:\\ML Resources\\Celeb_videos\\celebDataset\\celebDataset\\real"
synthetic_videos_dir = "C:\\ML Resources\\Celeb_videos\\celebDataset\\celebDataset\\synthetic"

# Create list of video paths and labels
real_videos = [(os.path.join(real_videos_dir, file), 0) for file in os.listdir(real_videos_dir)]
fake_videos = [(os.path.join(synthetic_videos_dir, file), 1) for file in os.listdir(synthetic_videos_dir)]

# Combine real and fake video paths and labels
all_videos = real_videos + fake_videos
video_paths, labels = zip(*all_videos)

# Create the training data generator
train_gen = data_generator(video_paths, labels, batch_size=16)

# Train the model
ensemble_model.fit(train_gen, steps_per_epoch=len(video_paths) // 16, epochs=10)

ensemble_model.save("ensemble_model.h5")