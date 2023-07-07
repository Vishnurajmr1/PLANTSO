// Get references to the form and the phone logo button
const form = document.querySelector("form");
document.getElementById("password").addEventListener("input", validatePassword);
const phoneLogoButton = document.querySelector("#phone-logo-button");
const emailLogoButton = document.querySelector("#email-logo-button");

// Get references to the email and password fields and the phone and OTP fields
const emailField = document.getElementById("email-field");
const passwordField = document.getElementById("password-field");
const showPasswordIcon = document.querySelector("#show-password");
const hidePasswordIcon = document.querySelector("#hide-password");
const phoneField = document.getElementById("phone-field");
const  otpField = document.getElementById("otp-field");
//error field declaration
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("passwordError");
const phoneError = document.getElementById("phoneError");
const errorMessage = document.getElementById("errorMessage");
const checkedImg = document.getElementById("checked");
//input type value declaration
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const phoneInput = document.getElementById("phone");
const usernameInput = document.getElementById("name");

//otp verify variables
const otpInput = document.getElementById("otp");
const otpError = document.getElementById("otpError");
var sendOTPBtn = document.getElementById("sendOTPBtn");
const verifyOTPBtn = document.getElementById("verifyOTPBtn");
const signupBtn = document.getElementById("signupBtn");
const resetpass=document.getElementById('reset');

// Hide the phone and OTP fields by default
// phoneField.style.display='none';
// otpField.style.display='none';

// Add an event listener to the phone logo button

phoneLogoButton.addEventListener("click", () => {
  // Hide email and password fields
  emailField.classList.add("hidden");
  passwordField.classList.add("hidden");
  phoneLogoButton.classList.add("hidden");
  resetpass.classList.add("hidden");
  // Show phone and OTP fields
  phoneField.classList.remove("hidden");
  // otpField.classList.remove("hidden");
  emailLogoButton.classList.remove("hidden");
});

emailLogoButton.addEventListener("click", () => {
  // Hide phone and otp fields
  phoneField.classList.add("hidden");
  otpField.classList.add("hidden");
  emailLogoButton.classList.add("hidden");
  // Show email and password fields
  emailField.classList.remove("hidden");
  passwordField.classList.remove("hidden");
  phoneLogoButton.classList.remove("hidden");
  resetpass.classList.remove("hidden");

});

//To hide and show the password togglebutton
showPasswordIcon.addEventListener("click", () => {
  passwordInput.setAttribute("type", "text");
  showPasswordIcon.style.display = "none";
  hidePasswordIcon.style.display = "block";
});
hidePasswordIcon.addEventListener("click", () => {
  passwordInput.setAttribute("type", "password");
  hidePasswordIcon.style.display = "none";
  showPasswordIcon.style.display = "block";
});

function validateEmail() {
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === "") {
    emailError.classList.add("hidden");
    emailError.classList.remove("border-green-500", "border-red-500");
    checkedImg.classList.add("hidden");
  } else if (emailRegex.test(email)) {
    emailError.classList.add("hidden");
    emailInput.classList.remove("border-red-500");
    emailInput.classList.add("border-green-500");
    checkedImg.classList.remove("hidden");
    emailError.textContent = ""; // Clear the error message for valid email
  } else {
    emailError.classList.remove("hidden");
    emailInput.classList.remove("border-green-500");
    emailInput.classList.add("border-red-500");
    checkedImg.classList.add("hidden");
    emailError.textContent = "Please enter a valid email address";
  }
}

// Function to validate password
function validatePassword() {
  const password = passwordInput.value.trim();
  // const password = document.getElementById('password').value.trim();
  if (password === " ") {
    passwordError.textContent = "Please enter a password";
  } else if (password.length < 8) {
    passwordError.textContent = "Password must be longer than 8 characters";
  } else if (!/[A-Z]/.test(password)) {
    passwordError.textContent =
      "Password must contain at least one uppercase letter";
  } else if (!/[a-z]/.test(password)) {
    passwordError.textContent =
      "Password must contain at least one lowercase letter";
    // return false;
  } else if (!/[0-9]/.test(password)) {
    passwordError.textContent =
      "Password must contain at least one numeric digit";
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    passwordError.textContent =
      "Password must contain at least one special character";
  } else {
    passwordInput.classList.add("border-green-500");
    passwordError.textContent = "";
  }
}

emailInput.addEventListener("input", () => {
  errorMessage.style.display = "none";
});

passwordInput.addEventListener("input", () => {
  errorMessage.style.display = "none";
});

usernameInput.addEventListener("input", () => {
  errorMessage.style.display = "none";
});
phoneInput.addEventListener("input", () => {
  errorMessage.style.display = "none";
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  validateEmail();
  validatePassword();
  validatePhone();

  // Check if there are any validation errors before submitting the form
  // const emailError = document.getElementById("emailError").textContent;
  // const passwordError = document.getElementById("passwordError").textContent;
  if (
    emailInput.value.trim() == " " ||
    passwordInput.value.trim() == " " ||
    phoneInput.value.trim() == " "
  ) {
    errorMessage.textContent = "Please fill all the required fields.";
    errorMessage.style.display = "block";
  } else if (
    emailError.textContent === " " &&
    passwordError.textContent === ""
  ) {
    this.sumbit();
  }
});

document
  .getElementById("categoryForm")
  .addEventListener("submit", function (event) {
    let categoryNameInput = document.getElementById("InputCategory");
    let errorContainer = document.getElementById("errorContainer");
    if (categoryNameInput.value.trim === "") {
      event.preventDefault(); // Prevent form submission
      errorContainer.textContent = "Please enter a category name."; // Display error message
    } else {
      errorContainer.textContent = ""; // Clear error message if valid input
    }
  });

function showConfirmationModal() {
  //Display the bootstrap modal
  $("#confirmationModal").modal("show");
}

function deleteCategory() {
  // Make an AJAX request to delete the category
  const csrfToken = document.querySelector('[name="_csrf"]').value;
  $.ajax({
    url: "/admin/delete-category",
    type: "POST",
    data: { categoryId: "{{this._id}}" },
    headers:{
      'X-CSRF-Token': csrfToken
    },
    success: function (response) {
      // Handle the success response
      console.log("Category deleted successfully");

      // Optionally, you can redirect to a different page or update the UI here
    },
    error: function (error) {
      // Handle the error response
      console.error("Error deleting category");
    },
  });
  // Close the modal
  $("#confirmationModal").modal("hide");
}

// sendOTPBtn.addEventListener('click', function(event) {
//   event.preventDefault();
//   validatePhone();
//   // Assuming the phone number is valid, send OTP to the server
//   // and handle the response to show the OTP input field
//   // Example: sendOTPToServer();
//   if (phoneInput.classList.contains('border-green-500')) {
//     // Assuming the phone number is valid, send OTP to the server
//     sendOTPToServer();
//   }
// });

function sendOTP() {
  validatePhone();
  const phoneInput = document.getElementById("phone");
  if (phoneInput.classList.contains("border-green-500")) {
    //     // Assuming the phone number is valid, send OTP to the server
        sendOTPToServer();
  }
}

// function sendOTPToServer() {
//   const phoneNumber = phoneInput.value.trim();

//   fetch("/verify-otp", {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ phone: phoneNumber }),
//   })
//     .then(async(res) => {
//       const response = await res.json();
//       console.log(response);
//       if (response.success) {
//         console.log(response);
//         // window.location.href = "/signup";
//         otpField.classList.remove("hidden");
//         verifyOTPBtn.classList.remove("hidden");
//       }
//     })
//     .then((data) => {
//       if (data.success) {
//         // OTP sent successfully, show the OTP input field
//         otpField.classList.remove("hidden");
//         verifyOTPBtn.classList.remove("hidden");
//       } else {
//         console.log(data.message);
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }

// Show OTP input field and Verify OTP button
// otpField.classList.remove('hidden');
// verifyOTPBtn.classList.remove('hidden');

verifyOTPBtn.addEventListener("click", function (event) {
  event.preventDefault();
  if(validateOTP()){
    document.getElementById("otpform").submit();
  }
  ;
});

// const otpform = document.getElementById("#otpform");
// otpform.addEventListener("submit", function (event) {
//   event.preventDefault();
//   validatePhone();
//   validateOTP();

// });

// function validatePhone(){
// const phoneInput=document.getElementById('phone');
// const phoneError=document.getElementById('phoneError');
//   console.log(phoneInput);
//   const phone=phoneInput.value.trim();
//   const indianPhoneRegex = /^\d{10}$/; // Indian phone number format: 10 digits
//   const anyCountryPhoneRegex = /^\+\d{1,3}\s?\d{3,}$/; // Any country phone number format: [+][country code][optional space][phone number]
//   // const password = document.getElementById('password').value.trim();
//   if (phone ===" ") {
//     phoneError.textContent = "Please enter a phone number";
//   } else if (!(indianPhoneRegex.test(phone)) && (!anyCountryPhoneRegex.test(phone))){
//     phoneError.textContent = "Invalid phone number";
//   }else {
//     phoneInput.classList.add("border-green-500");
//     phoneError.textContent = "";
//   }
// }

function validatePhone() {
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phoneError");
  const phone = phoneInput.value.trim();
  const indianPhoneRegex = /^\d{10}$/; // Indian phone number format: 10 digits
  const anyCountryPhoneRegex = /^\+\d{1,3}\s?\d{3,}$/; // Any country phone number format: [+][country code][optional space][phone number]

  if (phone === "") {
    phoneError.textContent = "Please enter a phone number";
  } else if (
    !indianPhoneRegex.test(phone) &&
    !anyCountryPhoneRegex.test(phone)
  ) {
    phoneError.textContent = "Invalid phone number";
  } else {
    phoneInput.classList.add("border-green-500");
    phoneError.textContent = "";
  }
}

function validateOTP() {
  const otpInput = document.getElementById("otp");
  const otpError = document.getElementById("otpError");
  const otp=otpInput.value.trim();
  console.log(otp+'hiii')
 
  if (otp ==="") {
    otpError.textContent = "Please enter the otp";
    return false;
  } else {
    otpInput.classList.add("border-green-500");
    otpError.textContent = "";
    return true;
  }
}


function sendOTPToServer() {
  const csrfToken = document.querySelector('[name="_csrf"]').value;
  const phoneInput = document.getElementById("phone");
  const countryCode = document.getElementById("countryCode");
  const code=countryCode.value.trim();
  const phone=phoneInput.value.trim();
  const phoneNumber = `${code}${phone}`;
  console.log(phoneNumber+'hiii');
  console.log(csrfToken);
  fetch('/verify-otp', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken

    },
    body: JSON.stringify({
      phone: phoneNumber 
    }),
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      console.log(response);
      throw new Error('Network response was not ok.');
    })
    .then(data=>{
      if(data.success){
        console.log(data);
        phoneInput.readOnly=true;
        const verifyOTPBtn = document.getElementById("verifyOTPBtn");
        const  otpField = document.getElementById("otp-field");
        const  sendOTPBtn = document.getElementById("sendOTPBtn");
        otpField.classList.remove("hidden");
        verifyOTPBtn.classList.remove("hidden");
        sendOTPBtn.classList.add('hidden');
        timerOut();
      }else{
        Swal.fire({
          icon: 'warning',
          title: 'Phone number is already registered.',
          text: 'Please try to login.',
          footer: '<a href="/login">Please Login</a>',
          showCancelButton: true,
          cancelButtonText: 'Close',
          showConfirmButton: false
        })
        console.log(data.message);
      }
     
    })
    .catch(function (error) {
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong.',
        text: 'Please try again later.',
        footer: '<a href="/">Go Back</a>',
        showCancelButton: true,
        cancelButtonText: 'Close',
        showConfirmButton: false
      })
      console.log(error.message);
    });
}


function timerOut(){
  let timeleft = 30;
  let downloadTimer = setInterval(function(){
  timeleft--;
  document.getElementById("countdowntimer").textContent =timeleft;
  if(timeleft<= 0){
    document.getElementById("resend").textContent 
    ="Resend"
    document.getElementById("otp-msg").textContent 
    =""
      clearInterval(downloadTimer);
  }
  },1000);
}


function clearOTPInput(){
  document.getElementById('otp').value='';
}

document.getElementById("resend").addEventListener("click", function() {
  clearOTPInput();
});


