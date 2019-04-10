// =====================
// symptom.js
// Mongoose model for saving symptoms 
// =====================

var mongoose = require("mongoose");

var symptomSchema = new mongoose.Schema({
    symptomName: String,
    symptomSeverity: String, 
    symptomNotes: String
});

module.exports = mongoose.model("Symptom", symptomSchema);

