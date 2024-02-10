
  const countries=document.getElementById('address-country')
  const states=document.getElementById('address-state')
   countries.addEventListener('change',function(){
    const selectedCountry=countries.value;
 // const csrfToken = document.querySelector('[name="_csrf"]').value;
    //console.log(csrfToken);
     fetch(`/getStateList/${selectedCountry}`,{
     method: "GET",
     headers: {
      "Content-Type": "application/json",
    },
      //body:JSON.stringify({country:selectedCountry})
     })
     .then(response=>{
      return response.json();
     })
    .then(data => {
      // Clear the state dropdown
      states.innerHTML = '<option value="">Choose State/Province</option>';
      // Populate the state dropdown with the received data
      data.forEach(state => {
        const option = document.createElement('option');
        option.value =state;
        option.textContent =state;
        states.appendChild(option);
      });
    }).catch(error=>{
      console.log(error);
     });
   });


   
    const getAddressCheckbox=document.getElementById('get-address');
    getAddressCheckbox.addEventListener('change',handleGetAddressChange);
    const addressHide=document.getElementById('addressHide');
    // var selectAddressId=document.querySelector('input[name=select_address]:checked');
    function handleGetAddressChange(){
        if(getAddressCheckbox.checked){
            addressHide.style.display='none';
            retrieveDefaultAddress();
        }else{
            addressHide.style.display='';
            console.log("No address Found");
            clearAddressDetails();
        }
    }
    function retrieveDefaultAddress(){
        fetch('/defaultAddress',{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        }).then((response)=>{
            console.log(response)
            return response.json();
        }).then((data)=>{
            console.log(data);
            if(data=='No default address found'){
                  Swal.fire({
                icon: 'warning',
                 title: 'No default address Found!',
                text: 'Please make any one address default',
            footer: '<a href="/addresses">Make a default address</a>'
            })
            return;
            }
            if(data.error){
                Swal.fire({
                icon: 'warning',
                 title: 'No default address Found!',
                text: 'Please make any one address default',
            footer: '<a href="/addresses">Make a default address</a>'
            })
            }
            displayAddressDetails(data);
        })
        .catch((error)=>{
            console.error('Failed to retrieve default Address',error);
        })
    }

    function displayAddressDetails(address) {
  // Update the DOM elements with the address details
  // Replace the DOM element IDs with the appropriate ones from your page
     document.getElementById('billing-fname').value = address.fname;
    document.getElementById('billing-lname').value  = address.lname;
    document.getElementById('billing-phone').value  = address.phone;
    document.getElementById('billing-town-city').value =address.city;
    document.getElementById('address-country').value  = address.country;
   document.getElementById('address_id').value=address._id;
    const stateSelect=document.getElementById('address-state');
      stateSelect.innerHTML ='<option value="">Choose State/Province</option>';
      if(address.state){
       const option = document.createElement('option');
        option.value =address.state;
        option.textContent =address.state;
        option.selected=true;
        states.appendChild(option);
      }
    document.getElementById('billing-street').value  = address.street_address;
    document.getElementById('billing-zip').value  = address.zipcode;
}
    function clearAddressDetails() {
  // Clear the DOM elements displaying the address details
  // Replace the DOM element IDs with the appropriate ones from your page
  document.getElementById('address-country').value='';
  document.getElementById('address-state').value='';
  document.getElementById('billing-fname').value='';
  document.getElementById('billing-lname').value='';
  document.getElementById('billing-phone').value='';
  document.getElementById('billing-town-city').value='';
  document.getElementById('billing-street').value='';
  document.getElementById('billing-zip').value='';
  document.getElementById('address_id').value='';
    }

    var orderBtn=document.getElementById('order-btn');
    orderBtn.addEventListener('click',function(event){
        event.preventDefault();
        handleOrder();
    });
    function handleOrder(){
        var paymentOption=document.querySelector('input[name=payment]:checked');
        // var selectAddressId=document.querySelector('input[name=select_address]:checked');
        var selectAddressId=document.querySelector('input[name=select_address]:checked');
        var isCheckboxChecked = getAddressCheckbox.checked;
          const checkbox = document.getElementById('term-and-condition');
          const errorMessage = document.getElementById('error-message');
        if(!paymentOption){
           Swal.fire({
             icon: 'error',
                title: 'PLEASE CHOOSE',
             text: 'Select any payment method to continue!',
        })
            return;
        }
    var paymentMethodId=paymentOption.value;
    console.log(paymentMethodId);
    if(paymentMethodId==='COD'){
      if (!selectAddressId && !isCheckboxChecked){
        Swal.fire({
          title: 'Please select the default address details or select an address',
          text: "You won't be able to continue this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'OK'
          }).then((result) => {
          if (!result.isConfirmed) {
          Swal.fire(
           'Cancel!',
          'Checkout operation failed!',
          'error'
           )
        }
      })
      return;
    }else if(!checkbox.checked){
      errorMessage.style.display = 'block';
      return ;
    }else if(selectAddressId){
      console.log(selectAddressId)
      var selectAddressIdValue = selectAddressId.value;
      console.log(selectAddressIdValue)
      var selectAddressFname = selectAddressId.getAttribute('data-fname');
      console.log(selectAddressFname)
      var selectAddressLname = selectAddressId.getAttribute('data-lname');
      var selectAddressPhone = selectAddressId.getAttribute('data-phone');
      var selectAddressCity = selectAddressId.getAttribute('data-city');
      var selectAddressCountry = selectAddressId.getAttribute('data-country');
      var selectAddressState = selectAddressId.getAttribute('data-state');
      var selectAddressStreet = selectAddressId.getAttribute('data-street');
      var selectAddressZip = selectAddressId.getAttribute('data-zip');   
      var totalPrice=document.getElementById('totalAmtSpn').textContent;   
      const addressDetails = {
        firstName: selectAddressFname,
        lastName: selectAddressLname,
        phoneNumber: selectAddressPhone,
        country: selectAddressCountry,
        state: selectAddressState,
        town: selectAddressCity,
        address: selectAddressStreet,
        zipCode: selectAddressZip,
        addressId: selectAddressIdValue,
         };
       handlePayment(addressDetails,paymentMethodId,totalPrice);
    }else{
           // Create the addressDetails object inside the handleOrder function var phoneNumber = document.getElementById('billing-phone').value;
  var country = document.getElementById('address-country').value;
  var state = document.getElementById('address-state').value;
  var firstName = document.getElementById('billing-fname').value;
  var lastName = document.getElementById('billing-lname').value;
  var phoneNumber = document.getElementById('billing-phone').value;
  var town = document.getElementById('billing-town-city').value;
  var address = document.getElementById('billing-street').value;
  var zipCode = document.getElementById('billing-zip').value;
  var addressId=document.getElementById('address_id').value;
  var totalPrice=document.getElementById('totalAmtSpn').textContent;
  const addressDetails = {
    phoneNumber: phoneNumber,
    country: country,
    state: state,
    firstName: firstName,
    lastName: lastName,
    town: town,
    address: address,
    zipCode: zipCode,
    addressId:addressId
     };
     handlePayment(addressDetails,paymentMethodId,totalPrice);
    }
    }else if(paymentMethodId==='StripePayment'){
    var stripe=Stripe('pk_test_51NM52USGoyjO6bGWzt6sBpPIgATb25DWYwIDfxfWYMKfMHMN4UxOeJj3RJy5Tgz20px7SWSnl4pMlfZr181itejI00yTNJJYdu');
      stripe.redirectToCheckout({
          sessionId:`{{sessionId}}`
         })
         .then(function(result){
              console.log(result);
          })
    }else if(paymentMethodId==='razorPay'){
      if (!selectAddressId && !isCheckboxChecked){
        Swal.fire({
          title: 'Please select the default address details or select an address',
          text: "You won't be able to continue this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'OK'
          }).then((result) => {
          if (!result.isConfirmed) {
          Swal.fire(
           'Cancel!',
          'Checkout operation failed!',
          'error'
           )
        }
      })
      return;
    }else if(!checkbox.checked){
      errorMessage.style.display = 'block';
      return ;
    }else if(selectAddressId){
      console.log(selectAddressId)
      var selectAddressIdValue = selectAddressId.value;
      console.log(selectAddressIdValue)
      var selectAddressFname = selectAddressId.getAttribute('data-fname');
      console.log(selectAddressFname)
      var selectAddressLname = selectAddressId.getAttribute('data-lname');
      var selectAddressPhone = selectAddressId.getAttribute('data-phone');
      var selectAddressCity = selectAddressId.getAttribute('data-city');
      var selectAddressCountry = selectAddressId.getAttribute('data-country');
      var selectAddressState = selectAddressId.getAttribute('data-state');
      var selectAddressStreet = selectAddressId.getAttribute('data-street');
      var selectAddressZip = selectAddressId.getAttribute('data-zip');   
      var totalPrice=document.getElementById('totalAmtSpn').textContent;   
      const addressDetails = {
        firstName: selectAddressFname,
        lastName: selectAddressLname,
        phoneNumber: selectAddressPhone,
        country: selectAddressCountry,
        state: selectAddressState,
        town: selectAddressCity,
        address: selectAddressStreet,
        zipCode: selectAddressZip,
        addressId: selectAddressIdValue,
         };
       handlePayment(addressDetails,paymentMethodId,totalPrice);
    }else{
           // Create the addressDetails object inside the handleOrder function var phoneNumber = document.getElementById('billing-phone').value;
  var country = document.getElementById('address-country').value;
  var state = document.getElementById('address-state').value;
  var firstName = document.getElementById('billing-fname').value;
  var lastName = document.getElementById('billing-lname').value;
  var phoneNumber = document.getElementById('billing-phone').value;
  var town = document.getElementById('billing-town-city').value;
  var address = document.getElementById('billing-street').value;
  var zipCode = document.getElementById('billing-zip').value;
  var addressId=document.getElementById('address_id').value;
  var totalPrice=document.getElementById('totalAmtSpn').textContent;
  const addressDetails = {
    phoneNumber: phoneNumber,
    country: country,
    state: state,
    firstName: firstName,
    lastName: lastName,
    town: town,
    address: address,
    zipCode: zipCode,
    addressId:addressId
     };
     handlePayment(addressDetails,paymentMethodId,totalPrice);
    }
    }
    if(!checkbox.checked){
        errorMessage.style.display = 'block';
        return ;
    }
 
}


function validateAddressDetails() {
  var phoneNumber = document.getElementById('billing-phone').value;
  var country = document.getElementById('address-country').value;
  var state = document.getElementById('address-state').value;
  var firstName = document.getElementById('billing-fname').value;
  var lastName = document.getElementById('billing-lname').value;
  var town = document.getElementById('billing-town-city').value;
  var address = document.getElementById('billing-street').value;
  var zipCode = document.getElementById('billing-zip').value;
  if (
    phoneNumber.trim() === '' ||
    address.trim() === '' ||
    country.trim() === '' ||
    state.trim() === '' ||
    firstName.trim() === '' ||
    lastName.trim() === '' ||
    town.trim() === '' ||
    zipCode.trim() === ''
  ) {
    return false;
  }
  return true;
}


document.addEventListener('DOMContentLoaded',()=>{
    let couponInput=document.getElementById('coupon');
    let errMsg=document.getElementById('error-msg');
    let applyButton=document.getElementById('apply-coupon');
    let subTotalElement=document.getElementById('subTotalSpn')
    let totalElement=document.getElementById('totalAmtSpn');
    let discountElement=document.getElementById('coupon-discount');
    let total=+ totalElement.textContent;
    let discount=+discountElement.textContent;

  const csrfToken = document.querySelector('[name="_csrf"]').value;
    couponInput.addEventListener('change',()=>{
    errMsg.textContent = '';
    couponInput.style.border = '';
    couponInput.style.borderRadius = '';
    couponInput.style.paddingRight = '';

    if (applyButton.style.display == 'none') {
        applyButton.style.display = 'block';
    }
    discountElement.textContent="0.00";
    if(discount>0){
        totalElement.textContent=Math.floor(total+discount);
    }

    fetch('/remove-coupon',{
        method:'PUT',
        headers:{
            'Content-Type':'application/json',
            'X-CSRF-Token':csrfToken,
                             }
                        }).then(async(res)=>{
                            res=await res.json();
                            if(res.status){
                                totalElement.textContent=subTotalElement.textContent; 
                            }
                    }).catch((error)=>{
                        console.log(error);
                })
         });
         applyButton.addEventListener('click',(event)=>{
            event.preventDefault();
            const couponName=document.getElementById('coupon').value;
            console.log(couponName);
            fetch('/apply-coupon',{
                method:'POST',
                headers:{
                    "Content-Type":"application/json",
                    "X-CSRF-TOKEN":csrfToken,
                },
                body:JSON.stringify({couponname:couponName}),
            }).then(async(res)=>{
                res=await res.json();
                console.log(res);
                if(res.success){
                    //apply discount amount
                    discountElement.textContent=res.discountAmount.toFixed(2);
                    console.log(discountElement);
                    let totalAmount= + totalElement.textContent;
                    totalAmount=totalAmount-res.discountAmount;
                    totalElement.textContent=Math.floor(totalAmount).toFixed(2);

                    //show success message
                      // Show success message using SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Discount Applied',
            text: res.message,
            showConfirmButton: false,
            timer: 1500,
          });

                    errMsg.style.color='green';
                    errMsg.textContent=res.message;
                    couponInput.style.border='1px solid green';
                    applyButton.style.display='none';

                    setTimeout(()=>{
                        errMsg.textContent='';
                    },5000);
                }else{
                     errMsg.style.color='red';
                    errMsg.textContent=res.message;
                    couponInput.style.border='1px solid red';
                    applyButton.style.display='block';


                      setTimeout(() => {
                        errMsg.textContent = '';
                        couponInput.style.border = '';
                    }, 5000);
                }
            }).catch((error)=>{
                console.log(error);
            });
         });
    })
