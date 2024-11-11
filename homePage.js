let locationUrl = ""; // Variable to store the selected location URL

window.login = function () {
    console.log("Navigating to login page in 500ms...");
    setTimeout(function () {
      window.location.href = `/Login&SignUp/loginAndSignup.html`;
    }, 700);
};


function setLocation() {
  const dropdown = document.getElementById("locations");
  locationUrl = dropdown.value;
}

function locateUs() {
  if (locationUrl) {
    window.open(locationUrl, "_blank");
  } else {
    alert("Please select a location first.");
  }
}
