# =====================
# datasets.py
# Organizing data for dual-stream neural network
# =====================

# import the necessary packages
from sklearn.preprocessing import LabelBinarizer
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np
import glob
import cv2
import os

def load_disease_attributes(inputPath):
	# initialize the list of column names in the CSV file and then
	# load it using Pandas
	cols = ["Age", "Gender", "Symptom", "Diagnosis"]
	df = pd.read_csv(inputPath, sep=",", header=None, names=cols)

	# return the data frame
	print(df.head())
	return df

def process_disease_attributes(df, train, test):
	# initialize the column names of the continuous data
	continuous = ["Age"]

	# performin min-max scaling each continuous feature column to
	# the range [0, 1]
	cs = MinMaxScaler()
	trainContinuous = cs.fit_transform(train[continuous])
	testContinuous = cs.transform(test[continuous])

	# one-hot encode the categorical data (by definition of
	# one-hot encoing, all output features are now in the range [0, 1])
	categorical = ["Gender", "Symptom"]
	Binarizer = LabelBinarizer().fit(df[categorical])
	trainCategorical = Binarizer.transform(train[categorical])
	testCategorical = Binarizer.transform(test[categorical])

	# construct our training and testing data points by concatenating
	# the categorical features with the continuous features
	trainX = np.hstack([trainCategorical, trainContinuous])
	testX = np.hstack([testCategorical, testContinuous])

	# return the concatenated training and testing data
	return (trainX, testX)

def load_images(df, inputPath):
	# initialize our images list 
	images = []

	# loop over the indexes of the patients
	for i in df.index.values:
		# Getting path of the image
		basePath = os.path.sep.join([inputPath, "{}.jpg".format(i + 1)])

		# Setting numpy array
		outputImage = np.zeros((64, 64, 3), dtype="uint8")
		
		# Reading the image and resizing
		image = cv2.imread(basePath)
		image = cv2.resize(image, (64, 64))

		# Appending the image to the images list
		outputImage = image
		images.append(outputImage)

	# return our set of images
	return np.array(images)
