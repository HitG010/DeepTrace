import numpy as np
import tensorflow as tf
import tensorflow_addons as tfa
import cv2
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
from keras_vit.vit import ViT
from tensorflow.keras.layers import Dense, LSTM, TimeDistributed, Flatten
from tensorflow.keras.models import Sequential
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import cv2
import math
import random
import numpy as np
import datetime as dt
import tensorflow as tf
from collections import deque
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

from tensorflow.keras.layers import *
from tensorflow.keras.models import Sequential
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import plot_model

IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64
SEQUENCE_LENGTH = 80

DATASET_DIR = "/content/drive/MyDrive/celebDataset"

CLASSES_LIST = ["real", "synthetic"]

def frames_extractor(video_path):
    frames_list = []

    video_reader = cv2.VideoCapture(video_path)

    video_frames_count = int(video_reader.get(cv2.CAP_PROP_FRAME_COUNT))

    skip_frames_window = max(int(video_frames_count/SEQUENCE_LENGTH), 1)

    for frame_counter in range(SEQUENCE_LENGTH):
       
        video_reader.set(cv2.CAP_PROP_POS_FRAMES, frame_counter * skip_frames_window)

        
        success, frame = video_reader.read()

        if not success:
            break

        resized_frame = cv2.resize(frame, (IMAGE_HEIGHT, IMAGE_WIDTH))

        normalized_frame = resized_frame / 255
        frames_list.append(normalized_frame)

    video_reader.release()

    return frames_list

def create_dataset():

    features = []
    labels = []
    video_files_paths = []

    for class_index, class_name in enumerate(CLASSES_LIST):
        print(f'Extracting Data of Class: {class_name}')
        files_list = os.listdir(os.path.join(DATASET_DIR, class_name))
        for file_name in files_list:

            video_file_path = os.path.join(DATASET_DIR, class_name, file_name)

            frames = frames_extractor(video_file_path)

            if len(frames) == SEQUENCE_LENGTH:
                features.append(frames)
                labels.append(class_index)
                video_files_paths.append(video_file_path)

    features = np.asarray(features)
    labels = np.array(labels)

    return features, labels, video_files_paths


vit_model = vit.vit_b16(
        image_size = 64,
        activation = 'softmax',
        pretrained = True,
        include_top = False,
        pretrained_top = False,
        classes = 2)
def create_video_classification_model(sequence_length):
    
    inputs = tf.keras.Input(shape=(sequence_length, 64, 64, 3))
    x = tf.keras.layers.TimeDistributed(vit_model)(inputs)
    x = tf.keras.layers.TimeDistributed(tf.keras.layers.Flatten())(x)
    
    x = tf.keras.layers.LSTM(128, return_sequences=False)(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dense(128, activation=tfa.activations.gelu)(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dense(64, activation=tfa.activations.gelu)(x)
    x = tf.keras.layers.Dense(32, activation=tfa.activations.gelu)(x)
    outputs = tf.keras.layers.Dense(2, activation='softmax')(x)

    model = tf.keras.Model(inputs, outputs, name='video_classification_model')
    return model

# Create and summarize the model
model = create_video_classification_model(80)
model.summary()
features, labels, video_files_paths = create_dataset()

# Hot encoding the labels
# Using Keras's to_categorical method to convert labels into one-hot-encoded vectors
one_hot_encoded_labels = to_categorical(labels)

# Split the dataset into training and testing sets.

features_train, features_test, labels_train, labels_test = train_test_split(features, one_hot_encoded_labels, test_size=0.25,shuffle=True)

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.fit(features_train, labels_train, epochs=10, batch_size=32, validation_data=(features_test, labels_test))
model.save('spam_classifier_model.h5')