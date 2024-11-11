import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, child, set, remove, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQv8V-dYQIij65Mw-SHMNAUmH-4fexClM",
    authDomain: "trial001-bdabb.firebaseapp.com",
    databaseURL: "https://trial001-bdabb-default-rtdb.firebaseio.com",
    projectId: "trial001-bdabb",
    storageBucket: "trial001-bdabb.appspot.com",
    messagingSenderId: "513771940125",
    appId: "1:513771940125:web:0a050eb8644a0a949e19f4",
    measurementId: "G-FJYVJ8P68S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let patientDetails = {}; // Variable to hold patient details

// Check if user is authenticated and retrieve patient details
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      patientDetails.id = user.uid;
      patientDetails.email = user.email;

      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `patients/${patientDetails.id}`));

      if (snapshot.exists()) {
        const patientData = snapshot.val();
        patientDetails.name = patientData.name || "Not Available";
        patientDetails.age = patientData.age || "Not Available";
        patientDetails.phone = patientData.phone || "Not Available";
        patientDetails.sex = patientData.sex || "Not Available";
        

        const userDetailsElement = document.querySelector(".user-details");
        if (userDetailsElement) {
          userDetailsElement.innerHTML = `
            <h2>Your Profile</h2>
            <div id="user-info">
            <p>Name : <span id="user-name"><strong>${patientDetails.name}</strong></span></p><br>
            <p>Age : <span id="user-age"><strong>${patientDetails.age} years</strong></span></p><br>
            <p>Gender : <span id="user-gender"><strong>${patientDetails.sex}</strong></span></p><br>
                <p>Email : <span id="user-email"><strong>${patientDetails.email}</strong></span></p><br>
                <p>Phone : <span id="user-phone"><strong>+91 ${patientDetails.phone}</strong></span></p><br>
            </div>`;
        }
        loadAppointments(); // Load appointments on user login
      } else {
        console.error("No patient data found!");
      }
    } catch (error) {
      console.error("Error retrieving patient data:", error);
    }
  } else {
    console.log("No user is signed in.");
  }
});


// Function to load doctors based on department
window.loadDoctors = async function () {
    const department = document.getElementById('doctorDepartment').value;
    const dbRef = ref(database);
    const doctorsSnapshot = await get(child(dbRef, `departments/${department}`));

    const doctorsSelect = document.getElementById('doctorSelect');
    doctorsSelect.innerHTML = ""; // Clear previous options

    if (doctorsSnapshot.exists()) {
        const doctors = doctorsSnapshot.val();
        for (const uniqueId in doctors) {
            const doctor = doctors[uniqueId];
            const option = document.createElement('option');
            option.value = uniqueId; // Set the value to the unique ID
            option.textContent = `${doctor.name} (${doctor.position})`; // Display name and position
            doctorsSelect.appendChild(option);
        }
    } else {
        const option = document.createElement('option');
        option.textContent = "No doctors found in this department.";
        doctorsSelect.appendChild(option);
    }
}

// Function to book an appointment
window.bookAppointment = async function (event) {
    event.preventDefault();

    const doctorId = document.getElementById('doctorSelect').value;
    const appointmentDate = document.getElementById('appointmentDate').value;  // e.g., "2024-10-07"
    const appointmentTime = document.getElementById('appointmentTime').value;  // e.g., "4:00 PM"
    const reason = document.getElementById('reason').value;
    const department = document.getElementById('doctorDepartment').value;

    // Get the day of the week (e.g., "Monday")
    const appointmentDay = new Date(appointmentDate).toLocaleString('en-US', { weekday: 'long' });

    // Reference to doctor's data in the Firebase Realtime Database
    const dbRef = ref(database);
    const doctorSnapshot = await get(child(dbRef, `departments/${department}/${doctorId}`));

    if (doctorSnapshot.exists()) {
        const doctorData = doctorSnapshot.val();
        const workingHours = doctorData.workingHours[appointmentDay];  // e.g., "9AM - 5PM"

        if (!workingHours) {
            alert(`The doctor is not available on ${appointmentDay}. Please select another day.`);
            return;
        }

        // Extract start and end times from working hours (e.g., "9AM", "5PM") and trim spaces
        const [startTimeStr, endTimeStr] = workingHours.split('-').map(time => time.trim());

        console.log(`Working Hours: ${workingHours}`);
        console.log(`Start Time: ${startTimeStr}, End Time: ${endTimeStr}`);
        console.log(`Appointment Time: ${appointmentTime}`);

        // Convert appointment time, start time, and end time to Date objects for comparison
        const appointmentTimeDate = convertToTimeDate(appointmentTime);
        const startTimeDate = convertToTimeDate(startTimeStr);
        const endTimeDate = convertToTimeDate(endTimeStr);

        // Comparison logic to check if the appointment time falls within the working hours
        if (appointmentTimeDate >= startTimeDate && appointmentTimeDate <= endTimeDate) {
            // Proceed with booking if the time is within working hours
            const userId = patientDetails.id;  // Use the patientDetails.id instead of getCurrentUserId()
            const patientSnapshot = await get(child(dbRef, `patients/${userId}`));  // Fetch patient info from Firebase

            if (patientSnapshot.exists()) {
                const patientData = patientSnapshot.val();
                const appointmentKey = push(child(dbRef, `departments/${department}/appointments/${doctorId}`)).key;

                // Save appointment details under the doctor
                await set(ref(database, `departments/${department}/appointments/${doctorId}/${appointmentKey}`), {
                    date: appointmentDate,
                    time: appointmentTime,
                    reason: reason,
                    patientName: patientData.name,
                    phone: patientData.phone,
                    email: patientData.email
                });

                alert('Appointment booked successfully!');
            } else {
                alert('Patient information not found.');
            }
        } else {
            alert(`The selected time is outside the doctor's working hours (${workingHours}). Please choose another time.`);
        }
    } else {
        alert('Doctor not found.');
    }
};

// Helper function to convert time strings (e.g., "4:00 PM", "9AM") to Date objects
function convertToTimeDate(timeStr) {
    const [time, modifier] = timeStr.split(' ');  // Split time and AM/PM
    let [hours, minutes] = time.split(':');  // Split hours and minutes
    minutes = minutes || '00';  // Default minutes to '00' if not provided
    hours = parseInt(hours, 10);

    // Handle AM/PM and 12:00 cases
    if (hours === 12 && modifier === 'AM') {
        hours = 0;  // Midnight case
    } else if (modifier === 'PM' && hours !== 12) {
        hours += 12;  // Add 12 hours for PM (except 12 PM)
    }

    // Create a new Date object and set the hours and minutes
    const now = new Date();
    now.setHours(hours, minutes);
    now.setMilliseconds(0); // Reset milliseconds
    return now;
}
// Function to cancel an appointment
window.cancelAppointment = async function (appointmentKey, doctorId, department) {
    const dbRef = ref(database);
    const appointmentRef = ref(database, `departments/${department}/appointments/${doctorId}/${appointmentKey}`);

    // Remove the appointment from the database
    await remove(appointmentRef);

    alert("Appointment canceled successfully!");
    loadAppointments();  // Reload the appointments after cancellation
};

// Function to load appointments for the patient
// Function to load appointments for the patient
async function loadAppointments() {
    const dbRef = ref(database);
    const appointmentsSnapshot = await get(child(dbRef, `departments`));

    const appointmentsContainer = document.getElementById('appointmentsContainer');
    appointmentsContainer.innerHTML = ""; // Clear previous appointments

    if (appointmentsSnapshot.exists()) {
        const departments = appointmentsSnapshot.val();
        let appointmentsFound = false; // Flag to check if appointments are found

        // Iterate through each department to find appointments
        for (const department in departments) {
            const departmentData = departments[department];
            if (departmentData.appointments) {
                for (const doctorId in departmentData.appointments) {
                    const doctorAppointments = departmentData.appointments[doctorId];
                    // Loop through all appointments of this doctor and check if the patient has any
                    for (const appointmentKey in doctorAppointments) {
                        const appointment = doctorAppointments[appointmentKey];
                        // Check if this appointment belongs to the logged-in patient
                        if (appointment.patientName === patientDetails.name) {
                            appointmentsFound = true;

                            // Get doctor's name from the department's doctor details
                            const doctorDetails = departmentData[doctorId]; // Fetch doctor details
                            const doctorName = doctorDetails ? doctorDetails.name : "Unknown Doctor";

                            // Create a div element for each appointment
                            const appointmentElement = document.createElement('div');
                            appointmentElement.classList.add('appointment');
                            let prescriptionDetails = '';

                            // Loop through prescriptions to gather the details
                            if (appointment.prescription) {
                                for (const prescriptionId in appointment.prescription) {
                                    const prescription = appointment.prescription[prescriptionId];
                                    prescriptionDetails += `<h2 style="font-size: 1.2rem; text-align: left; margin-top: 2rem; margin-bottom: 1.1rem">Prescribed Medicines :</h2>
                                        <p><strong>Medication Name :</strong> ${prescription.name || 'Not Provided'}</p>
                                        <p><strong>Dosage :</strong> ${prescription.dosage || 'Not Provided'}</p>
                                        <p><strong>Frequency :</strong> ${prescription.frequency || 'Not Provided'}</p>
                                    `;
                                }
                            }

                            appointmentElement.innerHTML = `
                                <p><strong>Doctor :</strong> ${doctorName}</p>
                                <p><strong>Appointment Date :</strong> ${appointment.date}</p>
                                <p><strong>Appointment Time :</strong> ${appointment.time}</p>
                                <p><strong>Reason :</strong> ${appointment.reason}</p>
                                ${prescriptionDetails}
                            `;

                            // If prescription details exist, show cancel button
                            if (!prescriptionDetails) {
                                appointmentElement.innerHTML += `<button style="margin-top: 1.4rem" onclick="cancelAppointment('${appointmentKey}', '${doctorId}', '${department}')">Cancel Appointment</button>`;
                            }
                            appointmentElement.style.marginBottom = '2rem'; // Add margin to the appointment div
                            appointmentsContainer.appendChild(appointmentElement);
                        }
                    }
                }
            }
        }

        // If no appointments are found for the patient
        if (!appointmentsFound) {
            const noAppointmentsElement = document.createElement('p');
            noAppointmentsElement.textContent = 'You have no upcoming appointments.';
            appointmentsContainer.appendChild(noAppointmentsElement);
        }
    } else {
        console.log("No appointments found.");
    }
}
