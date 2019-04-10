from skimage import transform
from PIL import Image
import numpy as np
from keras.preprocessing import image
import keras.models
from keras.optimizers import SGD
from keras.models import model_from_json
from scipy.misc import imread, imresize, imshow
import tensorflow as tf

parPath = "/Users/jacobmeleka/Desktop/HealthNet/malaria/validation/Parasitized/C39P4thinF_original_IMG_20150622_105102_cell_94.png"

cleanPath = "/Users/jacobmeleka/Desktop/HealthNet/malaria/validation/Uninfected/C236ThinF_IMG_20151127_102115_cell_210.png"


def loadModel():
    init_lr = 1e-1

    json_file = open('mdm.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    loaded_model = model_from_json(loaded_model_json)
    # load woeights into new model
    loaded_model.load_weights("mdm.h5")
    print("Loaded Model from disk")
    # compile and evaluate loaded model
    loaded_model.compile(loss="binary_crossentropy", optimizer=SGD(
        lr=init_lr, momentum=0.9), metrics=["accuracy"])

    # loss,accuracy = model.evaluate(X_test,y_test)
    # print('loss:', loss)
    # print('accuracy:', accuracy)
    return loaded_model


model = loadModel()

# # Infected
# test_image = image.load_img(parPath, target_size=(64, 64))
# test_image = image.img_to_array(test_image)
# test_image = np.expand_dims(test_image, axis=0)
# result = model.predict(test_image)
# print(result)

# # uninfected
# test_image = image.load_img(cleanPath, target_size=(64, 64))
# test_image = image.img_to_array(test_image)
# test_image = np.expand_dims(test_image, axis=0)
# result = model.predict(test_image)
# print(result)


def loadImage(filename):
    np_image = Image.open(filename)
    np_image = np.array(np_image).astype('float32')/255
    np_image = transform.resize(np_image, (64, 64, 3))
    np_image = np.expand_dims(np_image, axis=0)
    return np_image


image = loadImage(parPath)
result = model.predict(image)
print(result)

image = loadImage(cleanPath)
result = model.predict(image)
print(result)
