// loginAndSignup.js
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector(".login-btn");
  const createAccountButton = document.querySelector(".create-acc-btn");

  loginButton.addEventListener("click", () => {
     setTimeout(function () {
       window.location.href = "/Login/login.html"; // Replace with actual login page path
     }, 700);
  });

  createAccountButton.addEventListener("click", () => {
     setTimeout(function () {
       window.location.href = "/Register/register.html"; // Replace with actual registration page path
     }, 700);
  });
});
