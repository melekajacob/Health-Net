from cnn import config
from imutils import paths 
import random 
import shutil
import os

# shuffle all the images in the original input directory 
imagePaths = list(paths.list_images(config.orig_input_dataset))
random.seed(42)
random.shuffle(imagePaths)

# split the data into testing and training 
i = int(len(imagePaths) * config.train_split)
trainPaths = imagePaths[:i]
testPaths = imagePaths[i:]

# set aside some of the training data for validation data 
i = int(len(trainPaths) * config.val_split)
valPaths = trainPaths[:i]
trainPaths = trainPaths[i:]

# define the training/validation/testing datasets 
datasets = [
    ("training", trainPaths, config.train_path),
	("validation", valPaths, config.val_path),
	("testing", testPaths, config.test_path)
    ]

# loop over the datasets
for(dType, imagePaths, baseOutput) in datasets:
    # Show which datasplit being created
    print("Building " + dType + " split")

    # If the output directory does not exist, create it
    if not os.path.exists(baseOutput):
        print("Creating " + baseOutput + " directory")
        os.makedirs(baseOutput)
    
    # Looping over input image paths
    for inputPath in imagePaths:
        # Getting filename and class label of input image
        filename = inputPath.split(os.path.sep)[-1]
        label = inputPath.split(os.path.sep)[-2]

        # Building path to label directory 
        labelPath = os.path.sep.join([baseOutput, label])

        # If label output path doesn't exist, create it
        if not os.path.exists(labelPath):
            print("Creating " + labelPath + " directory")
            os.makedirs(labelPath)

        # Construct path to destination image and then copy image itself
        p = os.path.sep.join([labelPath, filename])
        shutil.copy2(inputPath, p)
        

        
