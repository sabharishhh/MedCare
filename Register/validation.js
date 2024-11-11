// Function to perform form validation
function validateForm(event) {
    event.preventDefault(); // Prevent form submission to perform validation

    // Get the values of the form fields
    const name = document.getElementById("regName").value.trim();
    const age = document.getElementById("regAge").value.trim();
    const gender = document.getElementById("regSex").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    let valid = true;

    // Name Validation: Check if the name is not empty
    if (name === "") {
        alert("Name is required.");
        valid = false;
    }

    // Age Validation: Check if the age is a number and above a certain value (e.g., 18)
    if (age === "" || isNaN(age) || age < 18) {
        alert("Please enter a valid age (18 or older).");
        valid = false;
    }

    // Gender Validation: Check if gender is not empty
    if (gender === "") {
        alert("Gender is required.");
        valid = false;
    }

    // Phone Number Validation: Check if phone number is in the correct format
    const phoneRegex = /^[0-9]{10}$/;
    if (phone === "" || !phoneRegex.test(phone)) {
        alert("Please enter a valid phone number (10 digits).");
        valid = false;
    }

    // Email Validation: Check if email format is correct
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email === "" || !emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        valid = false;
    }

    // Password Validation: Check if the password is strong enough (min 6 characters)
    if (password === "" || password.length < 6) {
        alert("Password must be at least 6 characters long.");
        valid = false;
    }

    // If all fields are valid, submit the form
    if (valid) {
        alert("Form submitted successfully!");
        document.getElementById("registrationForm").submit();
    }
}
