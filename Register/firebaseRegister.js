import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// Register a new user and store additional details
window.registerUser = async function (event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const age = document.getElementById('regAge').value;
    const sex = document.getElementById('regSex').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("Registered successfully: " + userCredential.user.email);

        await set(ref(database, 'patients/' + userCredential.user.uid), {
            name: name,
            age: age,
            sex: sex,
            phone: phone,
            email: email,
        });

        document.getElementById('regName').value = '';
        document.getElementById('regAge').value = '';
        document.getElementById('regSex').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';

    } catch (error) {
        alert("Error registering: " + error.message);
    }
}
