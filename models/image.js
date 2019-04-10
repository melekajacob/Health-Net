// =====================
// image.js
// Mongoose model for saving images in the database
// =====================
var mongoose = require("mongoose");

var imageSchema = mongoose.Schema({
  image: {
    data: Buffer,
    filename: String,
    imageType: String,
    imagePart: String
  }
});

module.exports = mongoose.model("Image", imageSchema);
