// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your Firebase configuration
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
const database = getDatabase(app);
let departmentName = '';

function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

window.saveWorkingHours = async function (event) {
    event.preventDefault();
    const uniqueId = getQueryVariable('uniqueId');
    const workingHoursData = {
        Monday: document.getElementById('monday').value,
        Tuesday: document.getElementById('tuesday').value,
        Wednesday: document.getElementById('wednesday').value,
        Thursday: document.getElementById('thursday').value,
        Friday: document.getElementById('friday').value,
        Saturday: document.getElementById('saturday').value || "",
        Sunday: document.getElementById('sunday').value || ""
    };

    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'departments'));

        if (snapshot.exists()) {
            snapshot.forEach(departmentSnapshot => {
                const doctors = departmentSnapshot.val();
                if (doctors[uniqueId]) {
                    departmentName = departmentSnapshot.key;
                }
            });

            if (!departmentName) {
                alert("Department not found.");
                return;
            }
        } else {
            alert("No departments available.");
            return;
        }

        const workingHoursRef = ref(database, `departments/${departmentName}/${uniqueId}/workingHours`);
        await set(workingHoursRef, workingHoursData);
        alert("Working hours saved successfully!");

    } catch (error) {
        console.error("Error saving working hours: ", error);
        alert("Error saving working hours: " + error.message);
    }
}

window.loadAppointments = async function () {
    const uniqueId = getQueryVariable('uniqueId');
    const appointmentsList = document.getElementById('appointmentsList');
    const doctorNameElement = document.getElementById('doctorName');
    appointmentsList.innerHTML = '';
    let doctorName = '';

    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'departments'));

        if (snapshot.exists()) {
            let appointmentsFound = false;

            snapshot.forEach(departmentSnapshot => {
                const departmentKey = departmentSnapshot.key;
                const doctors = departmentSnapshot.val();

                if (doctors[uniqueId]) {
                    doctorName = doctors[uniqueId].name;
                    departmentName = departmentKey;

                    const appointmentsRef = ref(database, `departments/${departmentKey}/appointments/${uniqueId}`);
                    get(appointmentsRef).then(appointmentsSnapshot => {
                        if (appointmentsSnapshot.exists()) {
                            appointmentsSnapshot.forEach(appointmentSnapshot => {
                                const appointment = appointmentSnapshot.val();
                                const listItem = document.createElement('li');
                                listItem.innerHTML = `
                                    Patient : ${appointment.patientName || 'Unknown Patient'} | Date : ${appointment.date} |
                                    Time : ${appointment.time} | Reason : ${appointment.reason}
                                    <button onclick="loadPrescriptions('${uniqueId}', '${appointmentSnapshot.key}')">View Prescriptions</button>
                                    <ul id="prescriptionList-${appointmentSnapshot.key}"></ul>
                                    <form onsubmit="savePrescription(event, '${uniqueId}', '${appointmentSnapshot.key}')">
                                        <input type="text" placeholder="Medication Name" id="medicationName-${appointmentSnapshot.key}" required>
                                        <input type="text" placeholder="Dosage" id="dosage-${appointmentSnapshot.key}" required>
                                        <input type="text" placeholder="Frequency" id="frequency-${appointmentSnapshot.key}" required>
                                        <button type="submit">Add Prescription</button>
                                    </form>
                                `;
                                appointmentsList.appendChild(listItem);
                                appointmentsFound = true;
                            });
                        }
                    });
                }
            });

            doctorNameElement.textContent = `Welcome, Dr. ${doctorName || 'Unknown Doctor'} (ID: ${uniqueId})`;

            if (!appointmentsFound) {
                appointmentsList.innerHTML = '<li>Currently you have no pending appointments.</li>';
            }
        } else {
            appointmentsList.innerHTML = '<li>No appointments available.</li>';
        }
    } catch (error) {
        console.error("Error loading appointments: ", error);
        appointmentsList.innerHTML = `<li>Error loading appointments: ${error.message}</li>`;
    }
}

window.savePrescription = async function (event, uniqueId, appointmentId) {
    event.preventDefault();
    const medicationName = document.getElementById(`medicationName-${appointmentId}`).value;
    const dosage = document.getElementById(`dosage-${appointmentId}`).value;
    const frequency = document.getElementById(`frequency-${appointmentId}`).value;

    const prescriptionData = {
        name: medicationName,
        dosage: dosage,
        frequency: frequency
    };

    try {
        const prescriptionsRef = ref(database, `departments/${departmentName}/appointments/${uniqueId}/${appointmentId}/prescription/${Date.now()}`);
        await set(prescriptionsRef, prescriptionData);
        alert("Prescription saved successfully!");
        loadPrescriptions(uniqueId, appointmentId);
    } catch (error) {
        console.error("Error saving prescription: ", error);
        alert("Error saving prescription: " + error.message);
    }
}

window.loadPrescriptions = async function (uniqueId, appointmentId) {
    const prescriptionsList = document.getElementById(`prescriptionList-${appointmentId}`);
    prescriptionsList.innerHTML = '';

    try {
        const prescriptionsRef = ref(database, `departments/${departmentName}/appointments/${uniqueId}/${appointmentId}/prescription`);
        const snapshot = await get(prescriptionsRef);

        if (snapshot.exists()) {
            snapshot.forEach(prescriptionSnapshot => {
                const prescription = prescriptionSnapshot.val();
                const listItem = document.createElement('li');
                listItem.textContent = `Medication : ${prescription.name} | Dosage: ${prescription.dosage} | Frequency: ${prescription.frequency}`;
                prescriptionsList.appendChild(listItem);
            });
        } else {
            prescriptionsList.innerHTML = '<li>No prescriptions found for this appointment.</li>';
        }
    } catch (error) {
        console.error("Error loading prescriptions: ", error);
        prescriptionsList.innerHTML = `<li>Error loading prescriptions: ${error.message}</li>`;
    }
}

// Load the appointments initially
window.addEventListener('load', loadAppointments);
