// =====================
// main.js
// Supplementary javascript file for jQuery events
// =====================

/* global $ */
// =======================
// ADDING NEW SYMPTOM
// =======================

$("#addSymptom").on("click", function() {
  var symptomName = $("#symptomName").val();
  var symptomNotes = $("#symptomNotes").val();
  var symptomSeverity = $("#symptomSeverity").val();

  $("#symptomSection").append(
    '<hr><div class="form-row"> <div class="form-group col-md-4"><input type="text" class="form-control" name="patient[symptoms][symptomName]" placeholder="Add a symptom" value=' +
      symptomName +
      '></div><div class="form-group col-md-2"><select class="form-control symptomSeverity" name="patient[symptoms][symptomSeverity]"><option selected disable hidden value="">Select Severity</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></div><div class="form-group col-md-4"><textarea class="form-control" rows="1" name="patient[symptoms][symptomNotes]" placeholder="Symptom Notes">' +
      symptomNotes +
      "</textarea></div></div>"
  );

  $("#symptomSection select")
    .last()
    .val(symptomSeverity);

  // Clearing original input
  $("#symptomName").val("");
  $("#symptomNotes").val("");
  $("#symptomSeverity").val("");
});

// =======================
// ADDING NEW IMAGE
// =======================
$(".customFile").on("change", function() {
  var index = $(".customFile").index(this);
  $(".customFileLabel:eq(" + index + ")").text(
    document.querySelectorAll(".customFile")[index].files[0].name
  );
});

$("#addImageOrig").on("click", function() {
  $("#imageSection").append(
    '<hr><div class="form-row"><div class="form-group col-md-3"><select class="form-control"id="imageType"name="patient[image][imageType]"><option value="Ultrasound">Ultrasound</option><option value="MRI">MRI</option><option value="CT Scan">CT Scan</option><option value="X-ray">X-ray</option><option value="PET Scan">PET Scan</option><option value="Blood Sample">Blood Sample</option></select></div><div class="form-group col-md-3"><select class="form-control"id="imagePart"name="patient[image][imagePart]"><option>Brain</option><option>Chest</option><option>Eye</option><option>Blood</option></select></div><div class="custom-file col-md-4"><input type="file"class="custom-file-input customFile" name="imaging"/><label class="custom-file-label customFileLabel "for="customFile">Choose file</label></div>'
  );

  $(".customFile").on("change", function() {
    var index = $(".customFile").index(this);
    $(".customFileLabel:eq(" + index + ")").text(
      document.querySelectorAll(".customFile")[index].files[0].name
    );
  });
});
