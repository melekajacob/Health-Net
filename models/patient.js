// =====================
// patient.js
// Mongoose model for saving the patient file in the database
// Making references between image, symptoms, and the patient file
// =====================
var mongoose = require("mongoose");

var patientSchema = new mongoose.Schema({
  personalInfo: {
    firstName: String,
    lastName: String,
    gender: String,
    healthCard: String,
    address: String,
    phoneNumber: String,
    email: String,
    dob: String,
    insurance: String,
    groupNumber: String,
    idNumber: String,
    carrier: String
  },

  symptoms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Symptom"
    }
  ],

  image: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image"
    }
  ],

  diagnosis: {
    diagnosis: String,
    diagnosisSeverity: String,
    diagnosisNotes: String
  }
});

module.exports = mongoose.model("Patient", patientSchema);
