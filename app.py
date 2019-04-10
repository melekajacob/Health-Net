# =====================
# app.py
# This is main express and node server code
# =====================

# Importing Dependencies
import os
from keras import backend as K
from flask import Flask, jsonify, request, render_template
from keras.models import load_model
from keras.preprocessing import image
from keras.optimizers import SGD
from keras.models import model_from_json
from flask_cors import CORS
import theano as th
import tensorflow as tf
from scipy.misc import imread, imresize, imshow
import importlib
import numpy as np
from PIL import Image
from skimage import transform

# Setting backend to theano due to bugs in tensorflow
def set_keras_backend(backend):
    if K.backend() != backend:
        os.environ['KERAS_BACKEND'] = backend
        importlib.reload(K)
        assert K.backend() == backend

set_keras_backend("theano")

app = Flask(__name__)
CORS(app)

# Loading Malaria model in order to get predictions
def loadMalariaModel():
    json_file = open(
        '/Users/jacobmeleka/Desktop/HealthNet/neuralNetworks/cnn/malaria.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    loaded_model = model_from_json(loaded_model_json)
    # load weights into new model
    loaded_model.load_weights(
        "/Users/jacobmeleka/Desktop/HealthNet/neuralNetworks/cnn/malaria.h5")
    print("Loaded Model from disk")
    # compile and evaluate loaded model
    loaded_model.compile(loss="binary_crossentropy", optimizer=SGD(
        lr=1e-1, momentum=0.9), metrics=["accuracy"])

    return loaded_model

# Loading tuberculosis model in order get predictions
def loadTuberculosisModel():
    json_file = open(
        '/Users/jacobmeleka/Desktop/HealthNet/neuralNetworks2/cnn/tuberculosis.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    loaded_model = model_from_json(loaded_model_json)
    # load woeights into new model
    loaded_model.load_weights(
        "/Users/jacobmeleka/Desktop/HealthNet/neuralNetworks2/cnn/tuberculosis.h5")
    print("Loaded Model from disk")
    # compile and evaluate loaded model
    loaded_model.compile(loss="binary_crossentropy", optimizer=SGD(
        lr=1e-1, momentum=0.9), metrics=["accuracy"])

    return loaded_model

# Formatting images helper function
def loadImage(filename):
    np_image = Image.open(filename)
    np_image = np.array(np_image).astype('float32')/255
    np_image = transform.resize(np_image, (64, 64, 3))
    np_image = np.expand_dims(np_image, axis=0)
    return np_image


# Loading two models upon initializing the server
malariaModel = loadMalariaModel()
tuberculosisModel = loadTuberculosisModel()


# Route which handles malaria prediction requests 
# Future versions will have one route to handle all requests for scalability purposes
@app.route("/predict/malaria", methods=["GET", "POST"])
def predictMalaria():
    
    images = request.args.get("image")
    if "," in images:
        images = images.split(",")
        percentageList = []

        for image in images:
            # Load the image
            img = loadImage(
                "/Users/jacobmeleka/Desktop/HealthNet/uploads/" + image)
            # Make prediction
            prediction = malariaModel.predict(img)

            # Turn the prediction into a percentage
            percentageList.append(prediction[0][0] * 100)

        percentage = round(sum(percentageList) / len(percentageList), 2)

    else:
        # Load the image
        img = loadImage(
            "/Users/jacobmeleka/Desktop/HealthNet/uploads/" + images)
        # Make prediction
        prediction = malariaModel.predict(img)

        # Turn the prediction into a percentage
        percentage = round(prediction[0][0] * 100, 2)

    # Respond with percentage
    return "{}%".format(percentage)

# Route which handles tuberculosis prediction requests
@app.route("/predict/tuberculosis", methods=["GET", "POST"])
def predictTuberculosis(): 
     # Get the full patient file
    images = request.args.get("image")
    if "," in images:
        images = images.split(",")
        percentageList = []

        for image in images:
            # Load the image
            img = loadImage(
                "/Users/jacobmeleka/Desktop/HealthNet/uploads/" + image)
            # Make prediction
            prediction = tuberculosisModel.predict(img)

            # Turn the prediction into a percentage
            percentageList.append(prediction[0][0] * 100)

        percentage = round(sum(percentageList) / len(percentageList), 2)

    else:
        # Load the image
        img = loadImage(
            "/Users/jacobmeleka/Desktop/HealthNet/uploads/" + images)
        # Make prediction
        prediction = tuberculosisModel.predict(img)

        # Turn the prediction into a percentage
        percentage = round(prediction[0][0] * 100, 2)

    # Respond with percentage
    return "{}%".format(percentage)


# Initializing the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', threaded=False)
