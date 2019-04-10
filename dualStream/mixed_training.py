# =====================
# mixed_training.py
# Training dual stream network
# =====================

# To Train model...
# python mixed_training.py --dataset /Users/jacobmeleka/Desktop/HealthNet/dualStream/patient-dataset

# import the necessary packages
from pyimagesearch import datasets
from pyimagesearch import models
from sklearn.model_selection import train_test_split
from keras.layers.core import Dense
from keras.models import Model
from keras.optimizers import Adam
from keras.layers import concatenate
from keras.models import model_from_json
import numpy as np
import argparse
import locale
import os


# construct the argument parser and parse the arguments (allows for command line arguments)
ap = argparse.ArgumentParser()
ap.add_argument("-d", "--dataset", type=str, required=True,
	help="path to input dataset of house images")
args = vars(ap.parse_args())

# construct the path to the input .csv file that contains text information
# on each patients
print("LOADING PATIENT .CSV FILE")
inputPath = os.path.sep.join([args["dataset"], "output.csv"])
df = datasets.load_disease_attributes(inputPath)

# load the patient imaging and then scale the pixel intensities to the
# range [0, 1]
print("Loading patients imaging")
images = datasets.load_images(df, args["dataset"])
images = images / 255.0

# partition the data into training and testing splits using 80% of
# the data for training and the remaining 20% for testing
print("[INFO] processing data...")
split = train_test_split(df, images, test_size=0.20, random_state=42)
(trainAttrX, testAttrX, trainImagesX, testImagesX) = split


# Performing min-max scaling on continuous features, one-hot encoding on categorical features,
# and then finally concatenating them together
(trainAttrX, testAttrX) = datasets.process_disease_attributes(df,
	trainAttrX, testAttrX)

# create the MLP and CNN models
mlp = models.create_mlp(trainAttrX.shape[1], regress=False)
cnn = models.create_cnn(64, 64, 3, regress=False)

# create the input to our final set of layers as the *output* of both
# the MLP and CNN
combinedInput = concatenate([mlp.output, cnn.output])

# our final FC layer head will have two dense layers, the final one
# being our regression head
x = Dense(4, activation="relu")(combinedInput)
x = Dense(1, activation="linear")(x)

# final model will accept categorical/numerical data on the MLP
# input and images on the CNN input, outputting a single value 
model = Model(inputs=[mlp.input, cnn.input], outputs=x)

# compile the model using binary crossentropy
opt = Adam(lr=1e-3, decay=1e-3 / 200)
model.compile(loss="binary_crossentropy", optimizer=opt, metrics=["accuracy"])

# train the model
print("TRAINING MODEL")
model.fit(
	[trainAttrX, trainImagesX], trainY,
	validation_data=([testAttrX, testImagesX], testY),
	epochs=500, batch_size=8)

# make predictions on the testing data
print("MAKING PREDICTIONS")
preds = model.predict([testAttrX, testImagesX])
print(preds)

# Saving model
model_json = model.to_json()
with open("mdm.json", "w") as json_file:
    json_file.write(model_json)
model.save_weights("mdm.h5")

