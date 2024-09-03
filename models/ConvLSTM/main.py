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

# from moviepy.editor import *

from sklearn.model_selection import train_test_split

from tensorflow.keras.layers import *
from tensorflow.keras.models import Sequential
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import plot_model

gpus = tf.config.list_physical_devices('GPU')
if gpus:
  details = tf.config.experimental.get_device_details(gpus[0])
  print("GPU details: ", details)



# Preprocess the video frames.

IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64

# Increase to increase accuracy, will also increase memory usage
SEQUENCE_LENGTH = 80

DATASET_DIR = "Celeb-DF-v2"

CLASSES_LIST = ["RealVid", "SyntheticVid"]  


# Frames Extractor Function

def frames_extractor(video_path):
    frames_list = []
    
    video_reader = cv2.VideoCapture(video_path)
    
    # Get the total number of frames in the video.
    video_frames_count = int(video_reader.get(cv2.CAP_PROP_FRAME_COUNT))

    # Calculate the the interval after which frames will be added to the list.
    skip_frames_window = max(int(video_frames_count/SEQUENCE_LENGTH), 1)
    
    for frame_counter in range(SEQUENCE_LENGTH):
         # Set the current frame position of the video.
        video_reader.set(cv2.CAP_PROP_POS_FRAMES, frame_counter * skip_frames_window)

        # Reading the frame from the video. 
        success, frame = video_reader.read() 

        # Check if Video frame is not successfully read then break the loop
        if not success:
            break

        # Resize the Frame to fixed height and width.
        resized_frame = cv2.resize(frame, (IMAGE_HEIGHT, IMAGE_WIDTH))
        
        # Normalize the resized frame by dividing it with 255 so that each pixel value then lies between 0 and 1
        normalized_frame = resized_frame / 255
        
        # Append the normalized frame into the frames list
        frames_list.append(normalized_frame)
    
    video_reader.release()
    
    return frames_list


# Create a function to create the dataset

def create_dataset():
    
    features = []
    labels = []
    video_files_paths = []
    
    # Iterating through all the classes mentioned in the classes list
    for class_index, class_name in enumerate(CLASSES_LIST):
        
        # Display the name of the class whose data is being extracted.
        print(f'Extracting Data of Class: {class_name}')
        
        # Get the list of video files present in the specific class name directory.
        files_list = os.listdir(os.path.join(DATASET_DIR, class_name))
        
        # Iterate through all the files present in the files list.
        for file_name in files_list:
            
            # Get the complete video path.
            video_file_path = os.path.join(DATASET_DIR, class_name, file_name)

            # Extract the frames of the video file.
            frames = frames_extractor(video_file_path)

            # Check if the extracted frames are equal to the SEQUENCE_LENGTH specified above.
            # So ignore the videos having frames less than the SEQUENCE_LENGTH.
            if len(frames) == SEQUENCE_LENGTH:

                # Append the data to their repective lists.
                features.append(frames)
                labels.append(class_index)
                video_files_paths.append(video_file_path)

    # Converting the list to numpy arrays
    features = np.asarray(features)
    labels = np.array(labels)  
    
    # Return the frames, class index, and video file path.
    return features, labels, video_files_paths

features, labels, video_files_paths = create_dataset()

# Hot encoding the labels
# Using Keras's to_categorical method to convert labels into one-hot-encoded vectors
one_hot_encoded_labels = to_categorical(labels)


# Split the dataset into training and testing sets.

features_train, features_test, labels_train, labels_test = train_test_split(features, one_hot_encoded_labels, test_size=0.25, shuffle=True)

# Implement the ConvLSTM Model.
def create_convlstm_model():
    
    model = Sequential()
    model.add(ConvLSTM2D(filters=4, kernel_size=(3, 3), activation = "tanh", return_sequences=True, data_format='channels_last', input_shape=(SEQUENCE_LENGTH, IMAGE_HEIGHT, IMAGE_WIDTH, 3)))
    model.add(MaxPooling3D(pool_size=(1, 2, 2), padding='same', data_format='channels_last'))
    model.add(TimeDistributed(Dropout(0.2)))
    
    model.add(ConvLSTM2D(filters=8, kernel_size=(3, 3), activation = "tanh", return_sequences=True, data_format='channels_last', input_shape=(SEQUENCE_LENGTH, IMAGE_HEIGHT, IMAGE_WIDTH, 3)))
    model.add(MaxPooling3D(pool_size=(1, 2, 2), padding='same', data_format='channels_last'))
    model.add(TimeDistributed(Dropout(0.2)))
    
    model.add(ConvLSTM2D(filters=14, kernel_size=(3, 3), activation = "tanh", return_sequences=True, data_format='channels_last', input_shape=(SEQUENCE_LENGTH, IMAGE_HEIGHT, IMAGE_WIDTH, 3)))
    model.add(MaxPooling3D(pool_size=(1, 2, 2), padding='same', data_format='channels_last'))
    model.add(TimeDistributed(Dropout(0.2)))
    
    model.add(ConvLSTM2D(filters=16, kernel_size=(3, 3), activation = "tanh", return_sequences=True, data_format='channels_last', input_shape=(SEQUENCE_LENGTH, IMAGE_HEIGHT, IMAGE_WIDTH, 3)))
    model.add(MaxPooling3D(pool_size=(1, 2, 2), padding='same', data_format='channels_last'))
    # model.add(TimeDistributed(Dropout(0.2)))
    
    model.add(Flatten())
    model.add(Dense(len(CLASSES_LIST), activation='softmax'))
    
    # Display the model summary
    print(model.summary())
    
    return model

convlstm_model = create_convlstm_model()
print("\nModel Successfully Created!")


# Plot the Model Architecture.
# plot_model(convlstm_model, to_file = "convlst_model_structure.png", show_shapes=True, show_layer_names=True)


# Compile and Train the Model.
# Early Stopping Callback
early_stopping_callback = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True, mode = 'min')
# Compile the model
convlstm_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
# Train the model
convlstm_model_training_history = convlstm_model.fit(features_train, labels_train, shuffle = True, batch_size=4, epochs=50, validation_split=0.2, callbacks=[early_stopping_callback])

# Evaluate the Model.
model_evaluation_history = convlstm_model.evaluate(features_test, labels_test)

# Save the Model.
convlstm_model.save("ConvLSTM/models/ConvLSTM_DF_80SL_50ep.h5")

# Plot the Training History.
plt.plot(convlstm_model_training_history.history['accuracy'])