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

// Hide the phone and OTP fields by default
// phoneField.style.display='none';
// otpField.style.display='none';

// Add an event listener to the phone logo button

phoneLogoButton.addEventListener("click", () => {
  // Hide email and password fields
  emailField.classList.add("hidden");
  passwordField.classList.add("hidden");
  phoneLogoButton.classList.add("hidden");
  // Show phone and OTP fields
  phoneField.classList.remove("hidden");
  otpField.classList.remove("hidden");
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
  $.ajax({
    url: "/admin/delete-category",
    type: "POST",
    data: { categoryId: "{{this._id}}" },
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
  const phoneInput = document.getElementById("phone");
  const countryCode = document.getElementById("countryCode");
  const code=countryCode.value.trim();
  const phone=phoneInput.value.trim();
  const phoneNumber = `${code}${phone}`;
  console.log(phoneNumber+'hiii');
  fetch('/verify-otp', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: phoneNumber 
    }),
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
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
      console.error('There was a problem with the updating product operation:', error);
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
  // Add any other logic for sending a new OTP
});
// const resendLink = document.getElementById('resend');

// // Add an event listener to the 'click' event
// resendLink.addEventListener('click', function(event) {
//   event.preventDefault(); 
//   sendOTPToServer();
// });



// const countryCode=document.querySelector('#countryCode')
//  // Update the phone number input placeholder based on the selected country code
//  const phoneNumberInput = document.querySelector("#phone");
//  countryCodeSelect.addEventListener("change", function () {
//    const countryCode = countryCodeSelect.value;
//    phoneNumberInput.placeholder = `Enter your phone number (${countryCode})`;
//  });



//alert modal try
// const New = {
//   status: 'success',
//   title: '',
//   content: '',
//   alert: function ({ status, title, content, confirmbtn = true }) {
//     var title;
//     var status;
//     var content;
//     var modal = document.createElement('section');
//     modal.setAttribute('class', 'alert_modal');
//     document.body.append(modal);
//     var alert = document.createElement('div');
//     alert.setAttribute('class', 'alert_container');
//     modal.appendChild(alert);
//     if (title == '' || title == null) {
//       title = this.title;
//     } else {
//       title = title
//     }
//     if (status == '' || status == null) {
//       status = this.status;
//     } else {
//       status = status;
//     }
//     if (content == '' || content == null) {
//       content = this.content;
//     } else {
//       content = content
//     }
//     alert.innerHTML = `
//              <div class="alert_heading"></div>
//         <div class="alert_details">
//             <h2>
//               ${title}
//             </h2>
//             <p>
//                 ${content}

//             </p>
//         </div>
//         <div class="alert_footer"></div>
//              ` ;



//     var alert_heading = document.querySelector('.alert_heading');
//     var alert_footer = document.querySelector('.alert_footer');
//     if (status == '' || status == 'success') {
//       alert_heading.innerHTML = `
//                 <svg width="80" height="80" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="14" stroke-dashoffset="14" d="M8 12L11 15L16 10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="14;0"/></path></g></svg>
//                 `;
//       alert_footer.innerHTML = `
//              <span class="close" title="Ok">
//               Ok
//             </span>
//              `;
//       alert_heading.style = 'background: linear-gradient(80deg, #67FF86, #1FB397);';
//       document.querySelector('.alert_details > h2').style.color = '#1FB397';
//     } else if (status == 'danger' || status == 'error') {
//       alert_heading.innerHTML = `
//                 <svg width="80" height="80" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="white" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M12 12L16 16M12 12L8 8M12 12L8 16M12 12L16 8"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"/></path></g></svg>
//                 `;
//       alert_footer.innerHTML = `
//              <span class="close" title="Ok">
//               Ok
//             </span>
//              `;
//       alert_heading.style = ' background: linear-gradient(80deg, #FF6767, #B31F1F);';
//       document.querySelector('.alert_details > h2').style.color = '#B31F1F';
//     } else if (status == 'info' || status == 'confirm') {
//       alert_heading.innerHTML = `
//                 <svg width="80" height="80" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="white" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="20" stroke-dashoffset="20" d="M8.99999 10C8.99999 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10C15 10.9814 14.5288 11.8527 13.8003 12.4C13.0718 12.9473 12.5 13 12 14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.4s" values="20;0"/></path></g><circle cx="12" cy="17" r="1" fill="white" fill-opacity="0"><animate fill="freeze" attributeName="fill-opacity" begin="1s" dur="0.2s" values="0;1"/></circle></svg>
//                 `;
//       confirmbtn == true ?
//         alert_footer.innerHTML = `
//              <span class="accept" title="I approve">
//               I approve
//             </span>
//             <span class="close" title="I refuse">
//               I refuse
//             </span>
//              `
//         :
//         alert_footer.innerHTML = `
//             <span class="close" title="Ok">
//            Ok
//             </span>
//              `
//         ;
//       alert_heading.style = 'background: linear-gradient(80deg, #7ED1FF, #484B95);';
//       document.querySelector('.alert_details > h2').style.color = '#484B95';
//     }
//     document.querySelector('.alert_footer .close').addEventListener('click', function () {
//       alert.remove();
//       modal.remove();
//     })
//     document.querySelector('.alert_footer .accept').addEventListener('click', function () {
//       alert.remove();
//       modal.remove();
//     })
//     document.querySelector('.alert_footer .accept').onclick = accept;

//   }
// }

// //end of modal try
// function show_Err_alert() {
//   New.alert({
//     status: 'error',
//     title: 'Server side error',
//     content: 'A server side error, try again later, or contact site support',
//   })
// }