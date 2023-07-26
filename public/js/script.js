function buscarPaciente() {
  const cedula = document.getElementById("patientDocument").value;
  fetch(`/buscar-paciente/${cedula}`)
      .then(response => response.json())
      .then(data => {
          if (data) {
              document.getElementById("nombre-paciente").textContent = data.name;
              document.getElementById("apellido-paciente").textContent = data.lastName;
              document.getElementById("edad-paciente").textContent = data.age;
              document.getElementById("telefono-paciente").textContent = data.phone;
              document.getElementById("paciente-info").style.display = "block";

              // Obtener la especialidad del doctor seleccionado
              const doctorSelect = document.getElementById("doctor");
              const selectedDoctorOption = doctorSelect.options[doctorSelect.selectedIndex];
              const selectedSpecialty = selectedDoctorOption.getAttribute("data-specialty");

              // Mostrar la especialidad en el cuadro de texto de la especialidad
              document.getElementById("specialty").value = selectedSpecialty;
          } else {
              alert("Paciente no encontrado");
              document.getElementById("paciente-info").style.display = "none";
          }
      })
      .catch(error => console.error("Error al buscar paciente:", error));
}


