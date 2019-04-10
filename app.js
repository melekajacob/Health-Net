// =====================
// app.js
// This is main express and node server code
// =====================

// Requiring necessary dependencies
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  fs = require("fs"),
  multer = require("multer"),
  csvBuilder = require("csv-builder"),
  sharp = require("sharp"),
  methodOverride = require("method-override");

// Configuring dependencies
mongoose.connect("mongodb://localhost/health_net");
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Configuring image upload
var upload = multer({ dest: "./uploads/" });
var type = upload.any("imaging");

// Importing Models
var Symptom = require("./models/symptom.js");
var Patient = require("./models/patient.js");
var Image = require("./models/image.js");

// =================
// ROUTES
// =================

// Home page
app.get("/", function(req, res) {
  res.render("landing");
});

// List of all patient
app.get("/patients", function(req, res) {
  // Query for all patients
  Patient.find({}, function(err, patients) {
    if (err) {
      console.log("COULDNT GET LIST OF PATIENTS");
    } else {
      res.render("index", { patients: patients });
    }
  });
});

// Public access database route
app.get("/database", function(req, res) {
  var diseaseList = new Set();
  //Query for all patients
  Patient.find({})
    .populate("symptoms") // Populating references
    .populate("image") // Populating references
    .exec(function(err, patients) {
      if (err) {
        console.log(err);
      } else {
        patients.forEach(function(patient) {
          // Ignoring any empty diagnoses
          if (
            patient.diagnosis.diagnosis != "" &&
            patient.diagnosis.diagnosis != " "
          ) {
            diseaseList.add(patient.diagnosis.diagnosis);
          }
        });
        res.render("database", { patients: patients, diseases: diseaseList });
      }
    });
});

// New patient route
app.get("/patients/new", function(req, res) {
  res.render("new");
});

app.get("/patients/images/:filename", (req, res) => {
  // Using gridfs to display image
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file was found
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists"
      });
    }

    // Piping image as a response
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

// Adding patient to database route
app.post("/patients", type, function(req, res, next) {
  var patient = req.body.patient;

  // CHecking if multiple symptoms
  var isArray = typeof patient.symptoms.symptomName === "object";
  symptomId = [];

  if (isArray) {
    var length = patient.symptoms.symptomName.length;
  } else {
    length = 1;
  }

  // Adding symptoms
  for (var i = 0; i < length; i++) {
    var symptom = new Symptom();
    if (isArray) {
      symptom.symptomName = req.body.patient.symptoms.symptomName[i];
      symptom.symptomSeverity = req.body.patient.symptoms.symptomSeverity[i];
      symptom.symptomNotes = req.body.patient.symptoms.symptomNotes[i];
    } else {
      symptom.symptomName = req.body.patient.symptoms.symptomName;
      symptom.symptomSeverity = req.body.patient.symptoms.symptomSeverity;
      symptom.symptomNotes = req.body.patient.symptoms.symptomNotes;
    }
    if (symptom.symptomName == "" || symptom.symptomName == " ") {
      continue;
    } else {
      // Saving symptoms to database
      symptom.save();
      symptomId.push(symptom._id);
    }
  }

  // Creating reference between patients and symptoms
  patient.symptoms = symptomId;

  // Adding image to patient object
  if (req.files.length == 1) {
    var image = new Image();
    image.image.data = fs.readFileSync(req.files[0].path);
    image.image.filename = req.files[0].filename;
    image.image.imageType = req.body.patient.image.imageType;
    image.image.imagePart = req.body.patient.image.imagePart;
    image.save();
    patient.image = image._id;
  } else if (req.files.length > 1) {
    // Adding each image to database and creating reference
    imageId = [];
    for (var i = 0; i < req.files.length; i++) {
      var image = new Image();
      image.image.data = fs.readFileSync(req.files[i].path);
      image.image.filename = req.files[i].filename;
      image.image.imageType = req.body.patient.image.imageType[i];
      image.image.imagePart = req.body.patient.image.imagePart[i];
      image.save();
      imageId.push(image._id);
    }
    patient.image = imageId;
  } else {
    // If no file present, leave empty list
    patient.image = [];
  }

  // Adding patient to the database
  Patient.create(patient, function(err, patient) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/patients/" + patient._id + "/edit");
    }
  });
});

// Editing Patient route (SHOW ROUTE)
app.get("/patients/:id/edit", function(req, res) {
  Patient.findById(req.params.id)
    .populate("symptoms")
    .populate("image")
    .exec(function(err, patient) {
      if (err) {
        console.log(err);
      } else {
        res.render("edit", { patient: patient });
      }
    });
});

// Updating patient route (PUT route)
app.put("/patients/:id", type, function(req, res) {
  Patient.findById(req.params.id, function(err, pat) {
    pat.personalInfo = req.body.patient.personalInfo;
    pat.diagnosis = req.body.patient.diagnosis;

    if (err) {
      console.log("COULDNT FIND PATIENT");
    } else {
      if (req.files.length == 1) {
        var image = new Image();
        image.image.data = fs.readFileSync(req.files[0].path);
        image.image.filename = req.files[0].filename;
        image.image.imageType = req.body.patient.image.imageType;
        image.image.imagePart = req.body.patient.image.imagePart;

        image.save();
        console.log(pat);
        pat.image.push(image._id);
      } else if (req.files.length > 1) {
        imageId = [];
        for (var i = 0; i < req.files.length; i++) {
          var image = new Image();
          image.image.data = fs.readFileSync(req.files[i].path);
          image.image.filename = req.files[i].filename;
          image.image.imageType = req.body.patient.image.imageType[i];
          image.image.imagePart = req.body.patient.image.imagePart[i];
          image.save();
          //imageId.push(image._id);
          pat.image.push(image._id);
        }
      }
      var isArray = typeof req.body.patient.symptoms.symptomName === "object";
      symptomId = [];
      // Adding symptoms correctly
      if (isArray) {
        var length = req.body.patient.symptoms.symptomName.length;
      } else {
        length = 1;
      }

      for (var i = 0; i < length; i++) {
        var symptom = new Symptom();
        if (isArray) {
          symptom.symptomName = req.body.patient.symptoms.symptomName[i];
          symptom.symptomSeverity =
            req.body.patient.symptoms.symptomSeverity[i];
          symptom.symptomNotes = req.body.patient.symptoms.symptomNotes[i];
        } else {
          symptom.symptomName = req.body.patient.symptoms.symptomName;
          symptom.symptomSeverity = req.body.patient.symptoms.symptomSeverity;
          symptom.symptomNotes = req.body.patient.symptoms.symptomNotes;
        }
        if (symptom.symptomName == "" || symptom.symptomName == " ") {
          continue;
        } else {
          symptom.save();
          symptomId.push(symptom._id);
        }
      }
      pat.symptoms = symptomId;

      // Saving updated patient to database
      pat.save(function(err, Patient) {
        if (err) {
          console.log("PATIENT NOT UPDATED PROPERLY");
        } else {
          res.redirect("/patients/" + Patient._id + "/edit");
        }
      });
    }
  });
});

// Image route
app.get("/images/:id", function(req, res) {
  Image.findById(req.params.id, function(err, image) {
    if (err) {
      console.log("Couldn't find image");
    } else {
      if (image.image.imageType == "Blood Sample") {
        var outputFile = "output.jpg";
        sharp(image.image.data)
          .resize({ width: 600 })
          .toFile(outputFile);

        fs.readFile("/Users/jacobmeleka/Desktop/HealthNet/output.jpg", function(
          err,
          content
        ) {
          if (err) {
            res.writeHead(400, { "Content-type": "text/html" });
            console.log(err);
            res.end("No such image");
          } else {
            //specify the content type in the response will be an image
            res.send(content);
          }
        });
      } else {
        res.send(image.image.data);
      }
    }
  });
});

// Getting images and a csv file for single disease
function exportSingleDisease(disease) {
  // Searching for all patients with disease and turning it into an array
  Patient.find({ "diagnosis.diagnosis": disease })
    .populate("symptoms")
    .populate("image")
    .exec(function(err, patients) {
      console.log(patients);

      // Create csv builder object with only relevant text information and filename
      const builder = new csvBuilder({
        headers: ["Age", "Gender", "Symptom", "Diagnosis"],
        alias: {
          Gender: "personalInfo.gender",
          Symptom: "symptoms[0].symptomName",
          Diagnosis: "diagnosis.diagnosis"
        }
      }).virtual("Age", patient => getAge(patient.personalInfo.dob));

      // Getting similar patient files who don't have the disease but have same imaging
      imageType = patients[0].image[0].image.imageType;
      imagePart = patients[0].image[0].image.imagePart;
      var simPatients = [];
      Patient.find(
        {
          "image[0].image.imageType": imageType,
          "image[0].image.imagePart": imagePart
        },
        function(err, simpatients) {
          simPatients = simpatients;
        }
      );

      // Creating csv file with all patients
      let csv = "";
      var counter = 0;
      patients.forEach(item => {
        counter += 1;
        csv += builder.getRow(item);
        // Putting all images in folder with csv file
        fs.copyFile(
          "uploads/" + item.image[0].image.filename,
          "dualStream/patient-dataset/" + String(counter) + ".jpg",
          function(err, file) {
            if (err) throw err;
          }
        );
      });

      simPatients.forEach(item => {
        csv += builder.getRow(item);
        // Putting all images in folder with csv file
        fs.copyFile(
          "uploads/" + item.image[0].image.filename,
          "dualStream/patient-dataset/" + String(counter) + ".jpg",
          function(err, file) {
            if (err) throw err;
          }
        );
      });

      fs.writeFileSync("dualStream/patient-dataset/output.csv", csv);
    });
}

// Get images and csv files for all diseases with atleast 500 patients
function exportSufficientDiseases() {
  // Getting list of all diseases
  var diseaseList = new Set();
  Patient.find({})
    .populate("symptoms") // Populating references
    .populate("image") // Populating references
    .exec(function(err, patients) {
      if (err) {
        console.log(err);
      } else {
        patients.forEach(function(patient) {
          // Ignoring any empty diagnoses
          if (
            patient.diagnosis.diagnosis != "" &&
            patient.diagnosis.diagnosis != " "
          ) {
            diseaseList.add(patient.diagnosis.diagnosis);
          }
        });
      }
    });

  // Finding which diseases have more than 500 patients
  diseaseList.forEach(function(disease) {
    Patient.find({ "diagnosis.diagnosis": disease }, function(err, patients) {
      if (patients.length > 500) {
        exportSingleDisease(disease);
      }
    });
  });
}

// Convert DOB to age
function getAge(dob) {
  var dob = new Date(dob);
  var today_date = new Date();
  var age = today_date.getFullYear() - dob.getFullYear();
  var m = today_date.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today_date.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port: " + port);
});
