document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const patientTableBody = document.getElementById('patientTableBody');

  // Función para cargar la tabla de pacientes
  function loadPatients() {
    fetch('/all-patients')
      .then(response => response.json())
      .then(patients => {
        patientTableBody.innerHTML = '';
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.lastName}</td>
            <td>${patient.cedula}</td>
            <td>${patient.age}</td>
            <td>${patient.phone}</td>
            <td>
              <button class="btn btn-sm btn-primary mr-2 editPatient" data-id="${patient._id}">Editar</button>
              <button class="btn btn-sm btn-danger deletePatient" data-id="${patient._id}">Eliminar</button>
            </td>
          `;
          patientTableBody.appendChild(row);
        });
      })
      .catch(err => console.error('Error al cargar pacientes:', err));
  }

  // Cargar la tabla de pacientes al cargar la página
  loadPatients();

  // Evento de búsqueda de pacientes al hacer clic en el botón "Buscar"
  searchButton.addEventListener('click', () => {
    const searchText = searchInput.value.trim();
    fetch(`/patients?search=${searchText}`)
      .then(response => response.json())
      .then(patients => {
        patientTableBody.innerHTML = '';
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.lastName}</td>
            <td>${patient.cedula}</td>
            <td>${patient.age}</td>
            <td>${patient.phone}</td>
            <td>
              <button class="btn btn-sm btn-primary mr-2 editPatient" data-id="${patient._id}">Editar</button>
              <button class="btn btn-sm btn-danger deletePatient" data-id="${patient._id}">Eliminar</button>
            </td>
          `;
          patientTableBody.appendChild(row);
        });
      })
      .catch(err => console.error('Error al buscar pacientes:', err));
  });

  // Evento de búsqueda de pacientes al presionar la tecla "Enter" en el campo de búsqueda
  searchInput.addEventListener('keyup', event => {
    if (event.keyCode === 13) {
      event.preventDefault();
      const searchText = searchInput.value.trim();
      fetch(`/patients?search=${searchText}`)
        .then(response => response.json())
        .then(patients => {
          patientTableBody.innerHTML = '';
          patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${patient.name}</td>
              <td>${patient.lastName}</td>
              <td>${patient.cedula}</td>
              <td>${patient.age}</td>
              <td>${patient.phone}</td>
              <td>
                <button class="btn btn-sm btn-primary mr-2 editPatient" data-id="${patient._id}">Editar</button>
                <button class="btn btn-sm btn-danger deletePatient" data-id="${patient._id}">Eliminar</button>
              </td>
            `;
            patientTableBody.appendChild(row);
          });
        })
        .catch(err => console.error('Error al buscar pacientes:', err));
    }
  });

  // Evento para editar paciente
  patientTableBody.addEventListener('click', event => {
    if (event.target.classList.contains('editPatient')) {
      const patientId = event.target.getAttribute('data-id');
      // Aquí puedes implementar la lógica para editar el paciente usando el ID
      console.log('Editar paciente con ID:', patientId);
    }
  });

  // Evento para eliminar paciente
  patientTableBody.addEventListener('click', event => {
    if (event.target.classList.contains('deletePatient')) {
      const patientId = event.target.getAttribute('data-id');
      // Aquí puedes implementar la lógica para eliminar el paciente usando el ID
      console.log('Eliminar paciente con ID:', patientId);
      // Una vez eliminado, actualizar la tabla de pacientes
      loadPatients();
    }
  });
});
