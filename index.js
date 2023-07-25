const mongodburi = 'mongodb+srv://monicasantagarcia:LkFX8Oa8mMyj9FvG@clusterclinica.st8pod8.mongodb.net/?retryWrites=true&w=majority';
const express = require('express');
const mongoose = require('mongoose');
const citaSchema = require('./models/cita');
const bodyParser = require('body-parser');
const ejs = require('ejs'); 

const app = express();
app.set('view engine', 'ejs'); 
const port = 3000;

// Conexión a MongoDB
mongoose.connect(mongodburi, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB', err));

// Definición del esquema para pacientes
const patientSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  cedula: { type: String, unique: true },
  age: Number,
  phone: String
});

const Patient = mongoose.model('Patient', patientSchema);

// Definición del esquema para doctores
const doctorSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  specialty: String,
  office: String,
  email: String
});

const Doctor = mongoose.model('Doctor', doctorSchema);

// Configuración de body-parser para parsear el cuerpo de las peticiones
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta para mostrar el formulario de creación de pacientes
app.get('/crear-paciente', (req, res) => {
  res.sendFile(__dirname + '/views/crear-paciente.html');
});

// Ruta para procesar el formulario de creación de pacientes
app.post('/patients', (req, res) => {
  const { name, lastName, cedula, age, phone } = req.body;
  const newPatient = new Patient({ name, lastName, cedula, age, phone });

  newPatient.save()
    .then(() => {
      console.log('Paciente creado:', newPatient);
      res.redirect('/crear-paciente'); // Redirecciona al formulario de creación de pacientes después de guardar
    })
    .catch(err => console.error('Error al guardar paciente:', err));
});

// Ruta para obtener la lista de pacientes
app.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    res.sendStatus(500);
  }
});

// Ruta para mostrar el formulario de creación de doctores
app.get('/crear-doctor', (req, res) => {
  res.sendFile(__dirname + '/views/crear-doctor.html');
});

// Ruta para procesar el formulario de creación de doctores
app.post('/doctors', (req, res) => {
  const { firstName, lastName, specialty, office, email } = req.body;
  const newDoctor = new Doctor({ firstName, lastName, specialty, office, email });

  newDoctor.save()
    .then(() => {
      console.log('Doctor creado:', newDoctor);
      res.redirect('/crear-doctor'); // Redirecciona al formulario de creación de doctores después de guardar
    })
    .catch(err => console.error('Error al guardar doctor:', err));
});

// Ruta para obtener la lista de doctores
app.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error('Error al cargar doctores:', error);
    res.sendStatus(500);
  }
});

//Citas
// Import citaSchema from cita.js
const Cita = require('./models/cita'); // Ensure that you have this line once
// Remove this line: const Doctor = require('./models/doctor'); since it's already declared

// Ruta para mostrar el formulario de creación de citas médicas
app.get('/crear-cita', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'firstName lastName');
    res.sendFile(__dirname + '/views/crear-cita.html');
  } catch (error) {
    console.error('Error al cargar doctores:', error);
    res.sendStatus(500);
  }
});

// Ruta para obtener la lista de doctores
app.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'firstName lastName');
    res.json(doctors);
  } catch (error) {
    console.error('Error al cargar doctores:', error);
    res.sendStatus(500);
  }
});


// Ruta para procesar el formulario de creación de citas médicas
app.post('/citas', async (req, res) => {
  const { patientDocument, doctor, specialty, date } = req.body;

  // Verificar si el doctor ya tiene una cita en la misma fecha y hora
  const existingCita = await Cita.findOne({ doctor, date });
  if (existingCita) {
    return res.status(409).send('El doctor ya tiene una cita asignada en la misma fecha y hora.');
  }

  const newCita = new Cita({ patientDocument, doctor, specialty, date });

  newCita.save()
    .then(() => {
      console.log('Cita creada:', newCita);
      res.redirect('/crear-cita'); // Redirecciona al formulario de creación de citas después de guardar
    })
    .catch(err => console.error('Error al guardar cita:', err));
});


// Ruta para mostrar la tabla de pacientes
app.get('/consultar-pacientes', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.render('consultar-pacientes', { patients }); // Utilizamos el método render para renderizar la vista ejs
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    res.sendStatus(500);
  }
});

// Ruta para eliminar un paciente por su ID
app.delete('/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Patient.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.sendStatus(500);
  }
});





// Ruta para la página inicial con los enlaces a los formularios
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Aplicación en ejecución en http://localhost:${port}`);
});
