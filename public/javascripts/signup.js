// Get references to the form and the phone logo button
const form=document.querySelector('form');
document.getElementById("password").addEventListener('input', validatePassword);
const phoneLogoButton=document.querySelector('#phone-logo-button');
const emailLogoButton=document.querySelector('#email-logo-button');



// Get references to the email and password fields and the phone and OTP fields
const emailField=document.getElementById('email-field');
const passwordField=document.getElementById('password-field');
const showPasswordIcon=document.querySelector("#show-password");
const hidePasswordIcon=document.querySelector("#hide-password");
const passwordInput=document.getElementById('password');
const phoneField=document.getElementById('phone-field');
const otpField=document.getElementById('otp-field');
const emailInput=document.getElementById('email');
const emailError=document.getElementById('email-error');
const passwordError=document.getElementById('passwordError')
const errorMessage=document.getElementById('error-message')
const checkedImg=document.getElementById('checked');


// Hide the phone and OTP fields by default
// phoneField.style.display='none';
// otpField.style.display='none';


// Add an event listener to the phone logo button

phoneLogoButton.addEventListener('click',()=>{
     // Hide email and password fields
  emailField.classList.add("hidden");
  passwordField.classList.add("hidden");
  phoneLogoButton.classList.add("hidden");
  // Show phone and OTP fields
  phoneField.classList.remove("hidden");
  otpField.classList.remove("hidden");
  emailLogoButton.classList.remove("hidden");
})

emailLogoButton.addEventListener('click',()=>{
// Hide phone and otp fields
    phoneField.classList.add("hidden");
    otpField.classList.add("hidden");
    emailLogoButton.classList.add("hidden");
// Show email and password fields
  emailField.classList.remove("hidden");
  passwordField.classList.remove("hidden");
  phoneLogoButton.classList.remove("hidden");
})

//To hide and show the password togglebutton
showPasswordIcon.addEventListener('click',()=>{
    passwordInput.setAttribute('type','text');
    showPasswordIcon.style.display='none';
    hidePasswordIcon.style.display='block';
})
hidePasswordIcon.addEventListener('click',()=>{
    passwordInput.setAttribute('type','password');
    hidePasswordIcon.style.display='none';
    showPasswordIcon.style.display='block';
})
//To validate the email field
// function validateEmail(){
//   if(emailInput.value===''){
//     emailError.classList.add("hidden");
//     emailInput.classList.remove("border-green-500", "border-red-500");
//     checkedImg.classList.add("hidden");
//   } else if(emailInput.validity.valid){
//         emailError.classList.add("hidden");
//         emailInput.classList.remove("border-red-500");
//         emailInput.classList.add("border-green-500");
//         checkedImg.classList.remove("hidden");
//     }else{
//         emailError.classList.remove("hidden");
//         emailInput.classList.remove("border-green-500");
//         emailInput.classList.add("border-red-500");
//         checkedImg.classList.add("hidden");
//     }
// }

function validateEmail(){
  const email=emailInput.value.trim();
  const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(email===''){
    emailError.classList.add("hidden");
    emailError.classList.remove("border-green-500","border-red-500");
    checkedImg.classList.add("hidden");
  }else if(emailRegex.test(email)){
    emailError.classList.add("hidden");
    emailInput.classList.remove("border-red-500");
    emailInput.classList.add("border-green-500");
    checkedImg.classList.remove("hidden");
    emailError.textContent=""; // Clear the error message for valid email
  }else{
    emailError.classList.remove("hidden");
    emailInput.classList.remove("border-green-500");
    emailInput.classList.add("border-red-500");
    checkedImg.classList.add("hidden");
    emailError.textContent="Please enter a valid email address";
  }
}


// Function to validate password
function validatePassword() {
  const password=passwordInput.value.trim();
  // const password = document.getElementById('password').value.trim();
  if (password ===" ") {
    passwordError.textContent = "Please enter a password";
  } else if (password.length < 8) {
    passwordError.textContent = "Password must be longer than 8 characters";
  }else if(!/[A-Z]/.test(password)){
      passwordError.textContent="Password must contain at least one uppercase letter";
  }else if(!/[a-z]/.test(password)){
      passwordError.textContent="Password must contain at least one lowercase letter";
      // return false;
  }else if(!/[0-9]/.test(password)){
      passwordError.textContent="Password must contain at least one numeric digit";
  }else if(!/[!@#$%^&*(),.?":{}|<>]/.test(password)){
      passwordError.textContent="Password must contain at least one special character";
  }else {
    passwordInput.classList.add("border-green-500");
    passwordError.textContent = "";
  }
}

emailInput.addEventListener('input', () => {
  errorMessage.style.display = 'none';
});

passwordInput.addEventListener('input', () => {
  errorMessage.style.display = 'none';
});

usernameInput.addEventListener('input', () => {
  errorMessage.style.display = 'none';
});


form.addEventListener("submit",function(event){
  event.preventDefault();
  validateEmail();
  validatePassword(); 

  // Check if there are any validation errors before submitting the form
  // const emailError = document.getElementById("emailError").textContent;
  // const passwordError = document.getElementById("passwordError").textContent;
  if(emailInput.value.trim()===" "|| passwordInput.value.trim()===" "){
    errorMessage.textContent="Please fill all the required fields.";
    errorMessage.style.display="block";
  }else if(emailError.textContent === " " && passwordError.textContent===""){
    this.sumbit();
  }
}); 


document.getElementById('categoryForm').addEventListener('submit', function(event) {
  let categoryNameInput = document.getElementById('InputCategory');
  let errorContainer = document.getElementById('errorContainer');
  if (categoryNameInput.value.trim === '') {
      event.preventDefault(); // Prevent form submission
      errorContainer.textContent = 'Please enter a category name.'; // Display error message
  } else {
      errorContainer.textContent = ''; // Clear error message if valid input
  }
});


function showConfirmationModal(){
  //Display the bootstrap modal
  $('#confirmationModal').modal('show');
}

function deleteCategory() {
  // Make an AJAX request to delete the category
  $.ajax({
    url: '/admin/delete-category',
    type: 'POST',
    data: { categoryId: '{{this._id}}' },
    success: function(response) {
      // Handle the success response
      console.log('Category deleted successfully');
      
      // Optionally, you can redirect to a different page or update the UI here
    },
    error: function(error) {
      // Handle the error response
      console.error('Error deleting category');
    }
  });
  
  // Close the modal
  $('#confirmationModal').modal('hide');
}



