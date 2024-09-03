# Import the required libraries.
import os
import cv2
import math
import random
import numpy as np
import datetime as dt
import tensorflow as tf
from collections import deque
import matplotlib.pyplot as plt

from moviepy.editor import *

from sklearn.model_selection import train_test_split

from tensorflow.keras.layers import *
from tensorflow.keras.models import Sequential
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import plot_model


# convlstm_model = tf.keras.models.load_model('convlstm_model.h5')
# convlstm_model.summary()

IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64

CLASSES_LIST = ["RealVid", "SyntheticVid"]

SEQUENCE_LENGTH = 40

lrcn_model = tf.keras.models.load_model('LRCN/models/LRCN_DF_40SL_100ep.h5')
lrcn_model.summary()


def download_youtube_video(video_url, output_file_name):
    # Create a Pafy object using the video URL.
    video = pafy.new(video_url)
    title = video.title
    # Retrieve the best available video stream.
    best_video_stream = video.getbest()
    output_file_path = f'{output_file_name}/{title}.mp4'
    # Download the video stream to the specified output file.
    best_video_stream.download(filepath=output_file_path, quiet=True)
    
    return title


# Download a YouTube video using the URL.
# test_videos_directory = 'test_videos'
# os.makedirs(test_videos_directory, exist_ok=True)

# # Download a YouTube video using the URL.
# title = download_youtube_video('https://www.youtube.com/watch?v=8u0qjmHIOcE', test_videos_directory)

input_video_path = "Celeb-DF-v2/Synthetic/id0_id2_0006.mp4"


def predict_on_video(video_file_path, output_file_path, SEQUENCE_LENGTH):
    video_reader = cv2.VideoCapture(video_file_path)

    # Get the width and height of the video.
    original_video_width = int(video_reader.get(cv2.CAP_PROP_FRAME_WIDTH))
    original_video_height = int(video_reader.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Initialize the VideoWriter Object to store the output video in the disk.
    video_writer = cv2.VideoWriter(output_file_path, cv2.VideoWriter_fourcc('M', 'P', '4', 'V'), 
                                   video_reader.get(cv2.CAP_PROP_FPS), (original_video_width, original_video_height))

    # Declare a queue to store video frames.
    frames_queue = deque(maxlen = SEQUENCE_LENGTH)

    # Initialize a variable to store the predicted action being performed in the video.
    predicted_class_name = ''
    
        # Iterate until the video is accessed successfully.
    while video_reader.isOpened():

        # Read the frame.
        ok, frame = video_reader.read() 
        
        # Check if frame is not read properly then break the loop.
        if not ok:
            break

        # Resize the Frame to fixed Dimensions.
        resized_frame = cv2.resize(frame, (IMAGE_HEIGHT, IMAGE_WIDTH))
        
        # Normalize the resized frame by dividing it with 255 so that each pixel value then lies between 0 and 1.
        normalized_frame = resized_frame / 255

        # Appending the pre-processed frame into the frames list.
        frames_queue.append(normalized_frame)

        # Check if the number of frames in the queue are equal to the fixed sequence length.
        if len(frames_queue) == SEQUENCE_LENGTH:

            # Pass the normalized frames to the model and get the predicted probabilities.
            predicted_labels_probabilities = lrcn_model.predict(np.expand_dims(frames_queue, axis = 0))[0]

            # Get the index of class with highest probability.
            predicted_label = np.argmax(predicted_labels_probabilities)

            # Get the class name using the retrieved index.
            predicted_class_name = CLASSES_LIST[predicted_label]

        # Write predicted class name on top of the frame.
        cv2.putText(frame, predicted_class_name, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Write The frame into the disk using the VideoWriter Object.
        video_writer.write(frame)
        
    # Release the VideoCapture and VideoWriter objects.
    video_reader.release()
    video_writer.release()
    
    
output_video_path = 'out1.mp4'
predict_on_video(input_video_path, output_video_path, SEQUENCE_LENGTH)
# Display the output video.
# VideoFileClip(output_video_path, audio=False, target_resolution=(300,None)).ipython_display()