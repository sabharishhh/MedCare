import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

window.loginUser = async function (event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully: " + userCredential.user.email);

        const dbRef = ref(database);
        const departmentSnapshot = await get(child(dbRef, `departments`));

        let isDoctor = false;
        let doctorUniqueId = '';

        departmentSnapshot.forEach((department) => {
            department.forEach((doctor) => {
                if (doctor.val().email === email) {
                    isDoctor = true;
                    doctorUniqueId = doctor.key;
                }
            });
        });

        if (isDoctor) {
            window.location.href = `/Dashboard/Doctor/doctorDash.html?uniqueId=${doctorUniqueId}`;
        } else {
            const patientSnapshot = await get(child(dbRef, `patients/${userCredential.user.uid}`));

            if (patientSnapshot.exists()) {
                window.location.href = "/Dashboard/Patient/patientDash.html";
            } else {
                alert("No dashboard available for this user. Please contact admin.");
            }
        }
    } catch (error) {
        alert("Error logging in: " + error.message);
    }
}
