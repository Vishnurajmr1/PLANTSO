//Get the coupon Form and add a submit event listener
// const couponForm=document.getElementById('couponForm');
//    couponForm.addEventListener('submit',(event)=>{
//    event.preventDefault(); //Prevent form submission

// const { stat } = require("fs");

   
   
//        //Perform form field validations
   
//        const couponNameInput=document.getElementById('couponName');
//        const couponNameError=document.getElementById('couponNameError');
//        const couponDescInput=document.getElementById('couponDesc');
//        const couponDescError=document.getElementById('couponDescError');
//        const couponMinAmtInput=document.getElementById('couponMinAmt');
//        const couponMinAmtError=document.getElementById('couponMinAmtError');
//        const couponDiscountInput=document.getElementById('couponDiscount');
//        const couponDiscountError=document.getElementById('couponDiscountError');
   
   
//     // Validate coupon name length
//   couponNameInput.addEventListener('input', () => {
//     if (couponNameInput.value.length < 3) {
//       couponNameError.classList.remove('hidden');
//     } else {
//       couponNameError.classList.add('hidden');
//     }
//   });
       
//   // Validate discount as a positive number
//   couponDiscountInput.addEventListener('input', () => {
//     const discount = parseFloat(couponDiscountInput.value);
//     if (isNaN(discount) || discount < 0) {
//       couponDiscountError.classList.remove('hidden');
//     } else {
//       couponDiscountError.classList.add('hidden');
//     }
//   });
    
   
//    // Validate minimum purchase amount as a non-negative number
//    couponMinAmtInput.addEventListener('input', () => {
//     const minAmt = parseFloat(couponMinAmtInput.value);
//     if (isNaN(minAmt) || minAmt < 0) {
//       couponMinAmtError.classList.remove('hidden');
//     } else {
//       couponMinAmtError.classList.add('hidden');
//     }
//   });

//    // Validate description length
//    couponDescInput.addEventListener('input', () => {
//     const words = couponDescInput.value.trim().split(' ');
//     if (words.length < 5) {
//       couponDescError.classList.remove('hidden');
//     } else {
//       couponDescError.classList.add('hidden');
//     }
//   });
//   // If any required fields are empty, focus on the first empty field
//   const requiredFields = [
//     { input: couponNameInput, error: couponNameError },
//     { input: couponMinAmtInput, error: couponMinAmtError },
//     { input: couponDiscountInput, error: couponDiscountError },
//     { input: couponDescInput, error: couponDescError },
//   ];
//   for (const { input, error } of requiredFields) {
//     if (input.value.trim() === '') {
//       input.classList.add('border-red-500');
//       error.classList.remove('hidden');
//       input.focus();
//       return;
//     } else {
//       input.classList.remove('border-red-500');
//       error.classList.add('hidden');
//     }
//   }
      
//       // If all validations pass, you can submit the form here
//       if (
//         couponNameInput.value.length >= 3 &&
//         !isNaN(parseFloat(couponDiscountInput.value)) &&
//         parseFloat(couponDiscountInput.value) >= 0 &&
//         !isNaN(parseFloat(couponMinAmtInput.value)) &&
//         parseFloat(couponMinAmtInput.value) >= 0 &&
//         couponDescInput.value.trim().split(' ').length >= 5
//       ) {
//         couponForm.submit();
//       }
//   });



  // Function to validate the form fields
function validateForm() {
  const couponNameInput = document.getElementById('couponName');
  const couponNameError = document.getElementById('couponNameError');
  const couponDescInput = document.getElementById('couponDesc');
  const couponDescError = document.getElementById('couponDescError');
  const couponMinAmtInput = document.getElementById('couponMinAmt');
  const couponMinAmtError = document.getElementById('couponMinAmtError');
  const couponDiscountInput = document.getElementById('couponDiscount');
  const couponDiscountError = document.getElementById('couponDiscountError');

  // Validate coupon name length
  if (couponNameInput.value.length < 3) {
    couponNameError.classList.remove('hidden');
    return false;
  } else {
    couponNameError.classList.add('hidden');
  }

  // Validate discount as a positive number
  const discount = parseFloat(couponDiscountInput.value);
  if (isNaN(discount) || discount < 0) {
    couponDiscountError.classList.remove('hidden');
    return false;
  } else {
    couponDiscountError.classList.add('hidden');
  }

  // Validate minimum purchase amount as a non-negative number
  const minAmt = parseFloat(couponMinAmtInput.value);
  if (isNaN(minAmt) || minAmt < 0) {
    couponMinAmtError.classList.remove('hidden');
    return false;
  } else {
    couponMinAmtError.classList.add('hidden');
  }

  // Validate description length
  const words = couponDescInput.value.trim().split(' ');
  if (words.length < 5) {
    couponDescError.classList.remove('hidden');
    return false;
  } else {
    couponDescError.classList.add('hidden');
  }

  return true;
}

// Get the coupon Form and add a submit event listener
const form = document.getElementById('couponForm');
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form submission

  // Validate the form fields
  if (validateForm()) {
    const form = event.target;
    const formData = new FormData(form);
    const formDataObject = {};
    for (let [key, value] of formData.entries()) {
      formDataObject[key] = value;
    }
    console.log(formDataObject);
    const csrfToken = document.querySelector('[name="_csrf"]').value;

    fetch('/admin/addCoupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(formDataObject),
    })
      .then(async (res) => {
        res = await res.json();
        console.log(res);
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Coupon added successfully!',
            showConfirmButton: false,
            timer: 2000
          }).then((result)=>{
            console.log(result+'hiiii');
            if(result){
              window.location.reload();
            }
          })
          
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            showConfirmButton: false,
            timer: 2000
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
});



// function updateCoupon(couponId,status) {
//   const csrfToken = document.querySelector('[name="_csrf"]').value;
//       console.log(couponId);
//       console.log(status);
//       swal.fire({
//           title: "Are you sure?",
//           text: status ? 'Hey, Enable me again?' : 'Deleted coupons can be restored!',
//           icon: "warning",
//           buttons: true,
//           dangerMode: true,
//       })
//       .then(async(willDelete) => {
//           if (willDelete) {
//               try {
//                   const response = await fetch('/admin/coupon-status', {
//                       method: 'PUT',
//                       headers: { 'Content-Type': 'application/json',
//                       'X-CSRF-Token': csrfToken,
//                        },
//                       body: JSON.stringify({ id: couponId, status: status })
//                   });

//                   if (!response.ok) {
//                       throw new Error('Failed to update coupon status due to server error');
//                   }

//                   const couponStatusBadge = document.querySelector(`#coupon-status-${couponId}`);
//                   const actionButton = document.querySelector(`#coupon-action-${couponId}`);

//                   if (status) {
//                       couponStatusBadge.textContent = "Active";
//                       couponStatusBadge.classList.remove("bg-danger");
//                       couponStatusBadge.classList.add("bg-success");

//                       actionButton.textContent = "Disable";
//                       actionButton.classList.remove("btn-outline-success");
//                       actionButton.classList.add("btn-outline-danger");
//                       actionButton.onclick = () => updateCoupon(couponId, false);
//                   } else {
//                       couponStatusBadge.textContent = "Disabled";
//                       couponStatusBadge.classList.remove("bg-success");
//                       couponStatusBadge.classList.add("bg-danger");

//                       actionButton.textContent = "Enable";
//                       actionButton.classList.remove("btn-outline-danger");
//                       actionButton.classList.add("btn-outline-success");
//                       actionButton.onclick = () => updateCoupon(couponId, true);
//                   }

//                   if (status) {
//                       Swal.fire({
//                         position: 'top-end',
//                         icon: 'success',
//                         title: 'coupon enabled successfully',
//                         showConfirmButton: false,
//                         timer: 1500,
//                       })
                      
//                   } else {
//                       Swal.fire({
//                         position: 'top-end',
//                         icon: 'warning',
//                         title: 'coupon disabled successfully',
//                         showConfirmButton: false,
//                         timer: 1500,
//                       })
//                   }
//               } catch (error) {
//                   console.log('error', error.message);
//               }
//           }
//       });
//   }


function updateCoupon(couponId, status) {
  const csrfToken = document.querySelector('[name="_csrf"]').value;
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-success ml-2',
        cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
});
swalWithBootstrapButtons.fire({
  title: 'Are you sure?',
  text: status?'Hey, Enable me again?' : 'Disabled coupons can be restored!',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: status?'Yes, enable it!':'Yes,disable it!',
  cancelButtonText: 'No, cancel!',
  reverseButtons: true
  }).then(async (result) => {
      if (result.isConfirmed) {
          try {
              const response = await fetch("/admin/coupon-status", {
                  method: "PUT",
                  headers: {
                      "Content-Type": "application/json",
                      "X-CSRF-Token": csrfToken,
                  },
                  body: JSON.stringify({ id: couponId, status: status }),
              });

              if (!response.ok) {
                  throw new Error(
                      "Failed to update coupon status due to server error"
                  );
              }

              const couponStatusBadge = document.querySelector(
                  `#coupon-status-${couponId}`
              );
              const actionButton = document.querySelector(
                  `#coupon-action-${couponId}`
              );

              if (status) {
                  couponStatusBadge.textContent = "Active";
                  couponStatusBadge.classList.remove("bg-danger");
                  couponStatusBadge.classList.add("bg-success");

                  actionButton.textContent = "Disable";
                  actionButton.classList.remove("btn-outline-success");
                  actionButton.classList.add("btn-outline-danger");
                  actionButton.onclick = () => updateCoupon(couponId, false);
              } else {
                  couponStatusBadge.textContent = "Disabled";
                  couponStatusBadge.classList.remove("bg-success");
                  couponStatusBadge.classList.add("bg-danger");

                  actionButton.textContent = "Enable";
                  actionButton.classList.remove("btn-outline-danger");
                  actionButton.classList.add("btn-outline-success");
                  actionButton.onclick = () => updateCoupon(couponId, true);
              }

              if (status) {
                swalWithBootstrapButtons.fire(
                  'Enabled!',
                  'Coupon enabled successfully.',
                  'success'
                );      
              } else {
                swalWithBootstrapButtons.fire(
                  'Disabled!',
                  'Coupon disabled successfully.',
                  'warning'
                );      
              }
          } catch (error) {
              console.log(error);
          }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          status?'Coupon is not restored🥲':'Coupon is safe🙂',
          'error'
      );
      }
  });
}



