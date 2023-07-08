const blockUnblockUsers = (userId, currStatus) => {
  const csrfToken = document.querySelector('[name="_csrf"]').value;
  fetch("/admin/blockUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ userId: userId, currStatus: currStatus }),
  })
    .then((res) => {
      // const response = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        throw new Error("An error occured while blocking/unblocking the user.");
      }
    })
    .catch((error) => {
      throw new Error("User blocked operation is on pending");
    });
};

const EditUser = (userId) => {
  document.getElementById('id01').style.display = 'block';
  // const csrfToken = document.querySelector('[name="_csrf"]').value;
  fetch(`/admin/editUser/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // body:JSON.stringify({userId:userId})
  }).then((response)=>{
    if(!response.ok){
      throw new Error('Failed to fetch the user details');
    }
    return response.json();
  })
  .then((data) => {
    // Fill the form with user details
    document.querySelector('#name').value = data.name;
    document.querySelector('#userId').value = data._id;
    document.querySelector('#email').value = data.email;
    document.querySelector('#phone').value = data.phone;
  })
  .catch((error) => {
    console.error('Error fetching user details:', error);
  });
};

const EditUserDetails=(userId)=>{
  document.getElementById('id01').style.display = 'block';
  const csrfToken = document.querySelector('[name="_csrf"]').value;
  fetch(`/admin/editUserDetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRT-Token": csrfToken,
    },
    // body:JSON.stringify({userId:userId}),
  }).then((response)=>{
    if(response.ok){
      console.log(response);
      return response.json();
    }
    throw new Error('Failed to Edit the user details');
  }).then((data)=>{
     // Fill the form with user details
     document.querySelector('#userId').value = data._id;
     document.querySelector('#name').value = data.name;
     document.querySelector('#email').value = data.email;
     document.querySelector('#phone').value = data.phone;
        // Clear previous error styling
      const errorFields = document.querySelectorAll('.error');
        errorFields.forEach((field) => {
          field.classList.remove('error');
        });
         // Clear previous error messages
          // Clear previous error messages
          document.querySelector('#nameError').textContent = '';
          document.querySelector('#emailError').textContent = '';
          document.querySelector('#phoneError').textContent = '';
      if(data.error){
        if(data.error.name){
          document.querySelector('#name').classList.add('error');
          document.querySelector('#nameError').textContent=data.error.name;
        }
        if(data.error.email){
          document.querySelector('#email').classList.add('error');
          document.querySelector('#emailError').textContent=data.error.email;
        }
        if(data.error.phone){
          document.querySelector('#phone').classList.add('error');
          document.querySelector('#phoneError').textContent=data.error.phone;
        }
      }
      if(data.success){
        res.redirect("admin/users").then(()=>{
          Swal.fire({
            icon: 'success',
            title: 'User details updated successfully',
            showConfirmButton: false,
            timer: 2000
          });
        })
      }
  })

}




function updateOrderStatus(orderId,status,callback){
  const csrfToken = document.querySelector('[name="_csrf"]').value;

  fetch(`/admin/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body:JSON.stringify({status}),
  })
  .then((response)=>{
    if(response.ok){
      console.log('Order status updated Successfully');
      return response.json();
    }else{
      console.log('Error updating order status');
    }
  }).then((data)=>{
    console.log(data);
    if(data.success){
      console.log(data)
      callback(data.status,data.orderId);
    }else{
      console.log('Error in upating the fronend data');
    }
  })
  .catch((error)=>{
    console.log('Error updating order Status',error);
  })
}

function updateStatusCallback(status,orderId) {
  console.log(status)
  const spanElement = document.querySelector(`[order-status="${orderId}"]`);
  spanElement.textContent = status
  // Update the badge color based on the status
  if (status === 'Completed') {
    spanElement.classList.remove('bg-warning-faded', 'bg-info-faded', 'bg-primary-faded', 'bg-danger-faded');
    spanElement.classList.add('bg-success-faded');
    spanElement.classList.remove('text-warning', 'text-info', 'text-primary', 'text-danger');
    spanElement.classList.add('text-success');
  } else if (status === 'pending') {
    spanElement.classList.remove('bg-success-faded', 'bg-info-faded', 'bg-primary-faded', 'bg-danger-faded');
    spanElement.classList.add('bg-warning-faded');
    spanElement.classList.remove('text-success', 'text-info', 'text-primary', 'text-danger');
    spanElement.classList.add('text-warning');
  } else if (status === 'Shipped') {
    spanElement.classList.remove('bg-success-faded', 'bg-warning-faded', 'bg-primary-faded', 'bg-danger-faded');
    spanElement.classList.add('bg-info-faded');
    spanElement.classList.remove('text-success', 'text-warning', 'text-primary', 'text-danger');
    spanElement.classList.add('text-info');
  } else if (status === "Out For Delivery") {
    spanElement.classList.remove('bg-success-faded', 'bg-warning-faded', 'bg-info-faded', 'bg-danger-faded');
    spanElement.classList.add('bg-primary-faded');
    spanElement.classList.remove('text-success', 'text-warning', 'text-info', 'text-danger');
    spanElement.classList.add('text-primary');
  } else {
    spanElement.classList.remove('bg-success-faded', 'bg-warning-faded', 'bg-info-faded', 'bg-primary-faded');
    spanElement.classList.add('bg-danger-faded');
    spanElement.classList.remove('text-success', 'text-warning', 'text-info', 'text-primary');
    spanElement.classList.add('text-danger');
  }
}