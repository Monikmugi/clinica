const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  patientDocument: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  specialty: String,
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Cita', citaSchema); // Export the model directly

