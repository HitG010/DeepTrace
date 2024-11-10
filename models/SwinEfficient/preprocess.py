import cv2
import numpy as np
from mtcnn import MTCNN
import matplotlib.pyplot as plt
import torch

def preprocess_video(video_path, NUM_FRAMES=10):
    # Initialize MTCNN for face detection
    detector = MTCNN()
    
    # Load the video using OpenCV
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Determine which frames to extract based on NUM_FRAMES
    frame_indices = np.linspace(0, total_frames - 1, NUM_FRAMES, dtype=int)

    frames = []
    faces = []
    
    current_frame = 0
    frame_index_set = set(frame_indices)  # For fast lookup of indices
    
    # Iterate over each frame of the video
    while current_frame < total_frames:
        ret, frame = cap.read()
        if not ret:
            break  # Break if video has ended or failed to read

        # Check if the current frame is in the set of target frames
        if current_frame in frame_index_set:
            # Convert the frame to RGB (OpenCV loads in BGR)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Detect faces in the frame using MTCNN
            detections = detector.detect_faces(rgb_frame)

            # If faces are detected, extract the face portion
            for detection in detections:
                x, y, width, height = detection['box']
                x, y = max(0, x), max(0, y)  # Ensure coordinates are within the frame
                
                # Extract the face region from the frame
                face = rgb_frame[y:y+height, x:x+width]
                faces.append(face)

            # Optionally, store the original frame if needed
            frames.append(rgb_frame)
        
        current_frame += 1
    
    # Release the video capture object
    cap.release()
    
    # if length of faces is less than NUM_FRAMES, repeat the last frame
    while len(faces) < NUM_FRAMES:
        faces.append(faces[-1])

    return faces[:NUM_FRAMES], frames  # Return extracted faces and frames (if required)

import os
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

class VideoDataset(Dataset):
    def __init__(self, root_dir, num_frames=10, transform=None):
        """
        Args:
            root_dir (string): Directory with subfolders 'Real' and 'Deepfake'.
            num_frames (int): Number of frames to extract from each video.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.root_dir = root_dir
        self.num_frames = num_frames
        self.transform = transform
        self.data = []
        
        # Load the paths for Real and Deepfake videos and assign labels
        real_dir = os.path.join(root_dir, 'RealVid')
        deepfake_dir = os.path.join(root_dir, 'SyntheticVid')
        
        # Assign label 0 for 'Real' and 1 for 'Deepfake'
        self._load_videos(real_dir, label=0)
        self._load_videos(deepfake_dir, label=1)
        
    def _load_videos(self, dir_path, label):
        """Helper function to load video paths and labels."""
        for video_file in os.listdir(dir_path):
            if video_file.endswith('.mp4'):  # Ensure it's a video file
                video_path = os.path.join(dir_path, video_file)
                self.data.append((video_path, label))
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        video_path, label = self.data[idx]
        
        # Preprocess video (extract frames and face portions)
        faces, _ = preprocess_video(video_path, NUM_FRAMES=self.num_frames)
        
        if self.transform:
            faces = [self.transform(face) for face in faces]
        
        # Convert the list of frames to a tensor (batch of frames)
        faces_tensor = torch.stack(faces)  # Shape: [NUM_FRAMES, C, H, W]
        
        return faces_tensor, label

# Example transforms (can be customized as needed)
transform = transforms.Compose([
    transforms.ToTensor(),  # Convert images to tensors
    transforms.Resize((224, 224)),  # Resize to fit model input size
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),  # Normalize
])

def create_dataloaders(root_dir, batch_size=4, num_frames=10, transform=transform):
    dataset = VideoDataset(root_dir, num_frames=num_frames, transform=transform)
    
    # Split dataset into training and validation sets
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    # Create DataLoader objects for training and validation sets
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=12)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=12)
    
    return train_loader, val_loader


if __name__ == '__main__':
    # Preprocess a sample video
    video_path = 'Celeb-DF-v2/Synthetic/id0_id9_0009.mp4'
    faces, frames = preprocess_video(video_path, NUM_FRAMES=10)
    
    # take the first face and apply different augmentations
    face = faces[3]
    
    # apply horizontal flip
    face_hflip = cv2.flip(face, 1)
    
    face_vlip = cv2.flip(face, 0)   
    
    # Blur the face
    face_blur = cv2.GaussianBlur(face, (15, 15), 0)
    
    # Add noise to the face
    noise = np.random.normal(0, 1, face.shape).astype(np.uint8)
    face_noisy = cv2.add(face, noise)
    
    # Display the original and augmented faces
    fig, axes = plt.subplots(1, 5, figsize=(10, 5))
    axes[0].imshow(face)
    axes[0].axis('off')
    axes[1].imshow(face_hflip)
    axes[1].axis('off')
    axes[2].imshow(face_vlip)
    axes[2].axis('off')
    axes[3].imshow(face_blur)
    axes[3].axis('off')
    axes[4].imshow(face_noisy)
    axes[4].axis('off')
    
    plt.show()
    
    