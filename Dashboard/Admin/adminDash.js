import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// Function to add a new doctor
window.addDoctor = async function (event) {
    event.preventDefault();
    const name = document.getElementById('doctorName').value;
    const email = document.getElementById('doctorEmail').value;
    const password = document.getElementById('doctorPassword').value;
    const department = document.getElementById('doctorDepartment').value;
    const uniqueId = document.getElementById('doctorUniqueId').value;
    const position = document.getElementById('doctorPosition').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await set(ref(database, `departments/${department}/${uniqueId}`), {
            name: name,
            email: email,
            department: department,
            uniqueId: uniqueId,
            position: position
        });

        alert("Doctor added successfully");
    } catch (error) {
        alert("Error adding doctor: " + error.message);
    }
}

// Function to display the list of doctors
window.displayDoctors = async function () {
    const department = document.getElementById('viewDepartment').value;
    const dbRef = ref(database);
    const doctorsSnapshot = await get(child(dbRef, `departments/${department}`));

    const doctorsList = document.getElementById('doctorsList');
    doctorsList.innerHTML = "";

    if (doctorsSnapshot.exists()) {
        const doctors = doctorsSnapshot.val();
        for (const uniqueId in doctors) {
            const doctor = doctors[uniqueId];
            const listItem = document.createElement('li');
            listItem.textContent = `ID : ${doctor.uniqueId} | Name : ${doctor.name} | Email : ${doctor.email} | Position : ${doctor.position}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Del";
            deleteButton.style = "margin-left: 1.6rem; background-color: #e74c3c;";
            deleteButton.addEventListener('mouseover', function () {
                deleteButton.style.backgroundColor = '#c0392b'; // Slightly darker color on hover
            });

            deleteButton.addEventListener('mouseout', function () {
                deleteButton.style.backgroundColor = '#e74c3c'; // Reverts back to original color
            });
            deleteButton.onclick = async () => {
                await removeDoctor(department, uniqueId);
            };

            listItem.appendChild(deleteButton);
            doctorsList.appendChild(listItem);
        }
    } else {
        doctorsList.innerHTML = "<li>No doctors found in this department.</li>";
    }
}

// Function to delete a doctor
window.removeDoctor = async function (department, uniqueId) {
    try {
        await remove(ref(database, `departments/${department}/${uniqueId}`));
        alert("Doctor deleted successfully.");
        displayDoctors();
    } catch (error) {
        alert("Error deleting doctor: " + error.message);
    }
}

// Function to display users (patients)
window.displayUsers = async function () {
    const dbRef = ref(database);
    const usersSnapshot = await get(child(dbRef, 'patients'));

    const usersList = document.getElementById('usersList');
    usersList.innerHTML = "";

    if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        for (const uid in users) {
            const user = users[uid];
            const listItem = document.createElement('li');
            listItem.textContent = `Name : ${user.name}, Email : ${user.email}, Phone : ${user.phone}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Del";

            deleteButton.style = "margin-left: 1.6rem; background-color: #e74c3c;";
            deleteButton.addEventListener('mouseover', function () {
                deleteButton.style.backgroundColor = '#c0392b'; // Slightly darker color on hover
            });

            deleteButton.addEventListener('mouseout', function () {
                deleteButton.style.backgroundColor = '#e74c3c'; // Reverts back to original color
            });

            deleteButton.onclick = async () => {
                await removeUser(uid);
            };

            listItem.appendChild(deleteButton);
            usersList.appendChild(listItem);
        }
    } else {
        usersList.innerHTML = "<li>No users found.</li>";
    }
}

// Function to delete a user
window.removeUser = async function (uid) {
    try {
        await remove(ref(database, `patients/${uid}`));
        alert("User deleted successfully.");
        displayUsers();
    } catch (error) {
        alert("Error deleting user: " + error.message);
    }
}
