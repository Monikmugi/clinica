const mongodburi = 'mongodb+srv://monicasantagarcia:LkFX8Oa8mMyj9FvG@clusterclinica.st8pod8.mongodb.net/?retryWrites=true&w=majority';
const express = require('express');
const mongoose = require('mongoose');
const citaSchema = require('./models/cita');
const bodyParser = require('body-parser');
const path = require('path'); 
const ejs = require('ejs'); 

const app = express();
app.set('view engine', 'ejs'); 
const port = 3000;

//Donde carga los archivos estaticos
app.use(express.static('public'));

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

// Configurar ejs como motor de plantillas
app.set('view engine', 'ejs');

// Configurar el directorio de vistas
app.set('views', path.join(__dirname, 'views'));

// Ruta para buscar pacientes por número de cédula
app.get('/buscar-paciente/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const patient = await Patient.findOne({ cedula });
    res.json(patient);
  } catch (error) {
    console.error('Error al buscar paciente por cédula:', error);
    res.sendStatus(500);
  }
});

// Ruta para mostrar el formulario de creación de citas médicas
app.get('/crear-cita', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'firstName lastName specialty');
    res.render('crear-cita', { doctors }); // Utilizamos el método render para renderizar la vista ejs y pasamos los datos de los doctores
  } catch (error) {
    console.error('Error al cargar doctores:', error);
    res.sendStatus(500);
  }
});

// Ruta para buscar pacientes por número de cédula
app.get('/buscar-paciente/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const patient = await Patient.findOne({ cedula });

    if (patient) {
      res.json(patient);
    } else {
      res.sendStatus(404); // Paciente no encontrado
    }
  } catch (error) {
    console.error('Error al buscar paciente por cédula:', error);
    res.sendStatus(500);
  }
});

// Función para obtener las especialidades del doctor seleccionado
app.get('/doctors/:doctorId/specialties', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      res.json({ specialties: doctor.specialty.split(',') });
    } else {
      res.sendStatus(404); // Doctor no encontrado
    }
  } catch (error) {
    console.error('Error al obtener especialidades del doctor:', error);
    res.sendStatus(500);
  }
});


// Ruta para filtrar la especialidad en la lista desplegable de doctores
app.get('/doctors/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const doctors = await Doctor.find({ specialty }, 'firstName lastName specialty');
    res.json(doctors);
  } catch (error) {
    console.error('Error al filtrar especialidad:', error);
    res.sendStatus(500);
  }
});

// Ruta para procesar el formulario de creación de citas médicas
app.post('/citas', async (req, res) => {
  const { patientDocument, doctor, date } = req.body;

  // Obtener la especialidad del doctor seleccionado
  const selectedDoctor = await Doctor.findById(doctor);
  const specialty = selectedDoctor ? selectedDoctor.specialty : '';

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

// Ruta para mostrar el formulario de edición de pacientes
app.get('/editar-paciente/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).send('Paciente no encontrado.');
    }
    res.render('editar-paciente', { patient });
  } catch (error) {
    console.error('Error al cargar paciente:', error);
    res.sendStatus(500);
  }
});


// Ruta para procesar el formulario de actualización de paciente
app.post('/actualizar-paciente/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lastName, age, phone } = req.body;
    // Buscar el paciente por ID y actualizar sus datos
    const updatedPatient = await Patient.findByIdAndUpdate(id, { name, lastName, age, phone }, { new: true });
    if (!updatedPatient) {
      return res.sendStatus(404);
    }
    console.log('Paciente actualizado:', updatedPatient);
    res.redirect('/consultar-pacientes'); // Redirecciona a la página de consulta de pacientes después de actualizar
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.sendStatus(500);
  }
});



// Ruta para mostrar la tabla de doctores
app.get('/consultar-doctores', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.render('consultar-doctores', { doctors }); // Utilizamos el método render para renderizar la vista ejs
  } catch (error) {
    console.error('Error al cargar doctores:', error);
    res.sendStatus(500);
  }
});


// Ruta para eliminar un doctor por su ID
app.delete('/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar doctor:', error);
    res.sendStatus(500);
  }
});

// Ruta para mostrar el formulario de edición de doctores
app.get('/editar-doctor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).send('Doctor no encontrado.');
    }
    res.render('editar-doctor', { doctor });
  } catch (error) {
    console.error('Error al cargar doctor:', error);
    res.sendStatus(500);
  }
});

// Ruta para procesar el formulario de actualización de doctor
app.post('/actualizar-doctor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, specialty, office, email } = req.body;
    // Buscar el doctor por ID y actualizar sus datos
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, { firstName, lastName, specialty, office, email }, { new: true });
    if (!updatedDoctor) {
      return res.sendStatus(404);
    }
    console.log('Doctor actualizado:', updatedDoctor);
    res.redirect('/consultar-doctores'); // Redirecciona a la página de consulta de doctores después de actualizar
  } catch (error) {
    console.error('Error al actualizar doctor:', error);
    res.sendStatus(500);
  }
});





// Ruta para obtener la lista de citas
app.get('/citas', async (req, res) => {
  try {
    const citas = await Cita.find().populate('doctor', 'firstName lastName specialty');
    res.json(citas);
  } catch (error) {
    console.error('Error al cargar citas:', error);
    res.sendStatus(500);
  }
});


// Ruta para mostrar la tabla de citas
app.get('/consultar-citas', async (req, res) => {
  try {
    // Fetch all citas
    const citas = await Cita.find().populate('doctor', 'firstName lastName'); // Populate the doctor field with their names
    res.render('consultar-citas', { citas });
  } catch (error) {
    console.error('Error al cargar citas:', error);
    res.sendStatus(500);
  }
});

// Ruta para mostrar el formulario de edición de citas
app.get('/editar-cita/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findById(id).populate('doctor', 'firstName lastName specialty');
    const doctors = await Doctor.find({}, 'firstName lastName specialty');
    if (!cita) {
      return res.status(404).send('Cita no encontrada.');
    }
    res.render('editar-cita', { cita, doctors });
  } catch (error) {
    console.error('Error al cargar cita:', error);
    res.sendStatus(500);
  }
});

// Ruta para procesar el formulario de actualización de cita
app.post('/actualizar-cita/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patientDocument, doctor, date } = req.body;
    // Buscar la cita por ID y actualizar sus datos
    const updatedCita = await Cita.findByIdAndUpdate(id, { patientDocument, doctor, date }, { new: true })
      .populate('doctor', 'firstName lastName specialty');
    if (!updatedCita) {
      return res.sendStatus(404);
    }
    console.log('Cita actualizada:', updatedCita);
    res.redirect('/consultar-citas'); // Redirecciona a la página de consulta de citas después de actualizar
  } catch (error) {
    console.error('Error al actualizar cita:', error);
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
