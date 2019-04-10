# =====================
# config.py
# Configuring malaria database
# =====================
import os

# initializing path to directory that will contain cell imaging
base_path = "/floyd/input/cell_images"

# Creating training, validation, and testing directories
train_path = os.path.sep.join([base_path, "training"])
val_path = os.path.sep.join([base_path, "validation"])
test_path = os.path.sep.join([base_path, "testing"])

# Defining percentage of data that will be used for training
train_split = 0.8

# Defining validation data that will be a percentage of training data
val_split = 0.1
