import os

# initializing the path to dataset
#orig_input_dataset = "/Users/jacobmeleka/Desktop/HealthNet/neuralNetworks2/dataset/imaging"

# initializing path to directory that will contain cell imaging
base_path = "/floyd/input/imaging"

# Creating training, validation, and testing directories
train_path = os.path.sep.join([base_path, "training"])
val_path = os.path.sep.join([base_path, "validation"])
test_path = os.path.sep.join([base_path, "testing"])

# Defining percentage of data that will be used for training
train_split = 0.8

# Defining validation data that will be a percentage of training data
val_split = 0.1
