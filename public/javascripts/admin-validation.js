//Get the coupon Form and add a submit event listener
const couponForm=document.getElementById('couponForm');
   couponForm.addEventListener('submit',(event)=>{
   event.preventDefault(); //Prevent form submission
   
   
       //Perform form field validations
   
       const couponNameInput=document.getElementById('couponName');
       const couponNameError=document.getElementById('couponNameError');
       const couponDescInput=document.getElementById('couponDesc');
       const couponDescError=document.getElementById('couponDescError');
       const couponMinAmtInput=document.getElementById('couponMinAmt');
       const couponMinAmtError=document.getElementById('couponMinAmtError');
       const couponDiscountInput=document.getElementById('couponDiscount');
       const couponDiscountError=document.getElementById('couponDiscountError');
   
   
    // Validate coupon name length
  couponNameInput.addEventListener('input', () => {
    if (couponNameInput.value.length < 3) {
      couponNameError.classList.remove('hidden');
    } else {
      couponNameError.classList.add('hidden');
    }
  });
       
  // Validate discount as a positive number
  couponDiscountInput.addEventListener('input', () => {
    const discount = parseFloat(couponDiscountInput.value);
    if (isNaN(discount) || discount < 0) {
      couponDiscountError.classList.remove('hidden');
    } else {
      couponDiscountError.classList.add('hidden');
    }
  });
    
   
   // Validate minimum purchase amount as a non-negative number
   couponMinAmtInput.addEventListener('input', () => {
    const minAmt = parseFloat(couponMinAmtInput.value);
    if (isNaN(minAmt) || minAmt < 0) {
      couponMinAmtError.classList.remove('hidden');
    } else {
      couponMinAmtError.classList.add('hidden');
    }
  });

   // Validate description length
   couponDescInput.addEventListener('input', () => {
    const words = couponDescInput.value.trim().split(' ');
    if (words.length < 5) {
      couponDescError.classList.remove('hidden');
    } else {
      couponDescError.classList.add('hidden');
    }
  });
  // If any required fields are empty, focus on the first empty field
  const requiredFields = [
    { input: couponNameInput, error: couponNameError },
    { input: couponMinAmtInput, error: couponMinAmtError },
    { input: couponDiscountInput, error: couponDiscountError },
    { input: couponDescInput, error: couponDescError },
  ];
  for (const { input, error } of requiredFields) {
    if (input.value.trim() === '') {
      input.classList.add('border-red-500');
      error.classList.remove('hidden');
      input.focus();
      return;
    } else {
      input.classList.remove('border-red-500');
      error.classList.add('hidden');
    }
  }
      
      // If all validations pass, you can submit the form here
      if (
        couponNameInput.value.length >= 3 &&
        !isNaN(parseFloat(couponDiscountInput.value)) &&
        parseFloat(couponDiscountInput.value) >= 0 &&
        !isNaN(parseFloat(couponMinAmtInput.value)) &&
        parseFloat(couponMinAmtInput.value) >= 0 &&
        couponDescInput.value.trim().split(' ').length >= 5
      ) {
        couponForm.submit();
      }
  });
