

// Get the delete buttons
const deleteButtons = document.querySelectorAll(".deleteButton");

// Function to open the delete modal
function openDeleteModal(event) {
  event.preventDefault();

  const deleteModal = document.getElementById("deleteModal");
  const modalTitle = deleteModal.querySelector(".modal-title");
  const modalBody = deleteModal.querySelector(".modal-body");

  const title = event.target.dataset.title;
  const body = event.target.dataset.body;

  modalTitle.textContent = title;
  modalBody.textContent = body;

  deleteModal.classList.remove("hidden");
  
  // Store the form element in a variable
  const form = event.target.closest("form");

  // Attach the event listener to the form submit event
  form.addEventListener("submit", handleDelete);

  // Attach the event listener to the cancel button
  const cancelButton = deleteModal.querySelector("#cancelButton");
  cancelButton.addEventListener("click", closeDeleteModal);
}

// Function to close the delete modal
function closeDeleteModal() {
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.classList.add("hidden");
}

// Attach event listeners to the delete buttons
deleteButtons.forEach((button) => {
  button.addEventListener("click", openDeleteModal);
});
// const confirmDeleteButton = document.getElementById("confirmDeleteButton");
// confirmDeleteButton.addEventListener("click", handleDelete);

function handleDelete(event) {
    event.preventDefault();
  
    const form = event.target.closest("form");
    const endpoint = form.action;
  
    // Remove the event listener for the confirm delete button
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");
    confirmDeleteButton.removeEventListener("click", handleConfirmDelete);
  
    // Show the confirmation modal
    openDeleteModal(event);
  
    // Attach the event listener to the confirm delete button
    confirmDeleteButton.addEventListener("click", handleConfirmDelete);
  
    function handleConfirmDelete() {
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(new FormData(form)),
      })
        .then((response) => {
          if (response.ok) {
            // Delete operation was successful
            closeDeleteModal(); // Close the delete modal
            let message;
            if(endpoint.includes('delete-product')){
                message="Product deleted successfully";
                window.location.href=`/admin/product?message=${encodeURIComponent(message)}`;
            }else if(endpoint.includes('delete-category')){
                 message="Category deleted successfully";
            // res.redirect(`/admin/category?message=${encodeURIComponent(message)}`);
                window.location.href=`/admin/category?message=${encodeURIComponent(message)}`; // Refresh the page or perform any other necessary action
            }
          } else {
            // Error occurred during the delete operation
            console.error("An error occurred while deleting.");
          }
        })
        .catch((error) => {
          // Network or fetch error occurred
          console.error("An error occurred while deleting.");
        });
    }
  }



// function handleDelete(event,form) {
//     event.preventDefault();
//     // const form = document.getElementById("deleteProductForm");
//     console.log(form)
//     const endpoint = form.action;
//     const formData = new FormData(form);
  
//     fetch(endpoint, {
//       method: "POST",
//       body: formData,
//     })
//       .then((response) => {
//         console.log(response.status);
//         return response.json();
//       }).then((data)=>{
//         console.log(data);
//         if (data.ok) {
//           // Delete operation was successful
//           closeDeleteModal(); // Close the delete modal
//         } else {
//           // Error occurred during the delete operation
//           console.error("An error occurred while deleting.");
//         }
//       })
//       .catch((error) => {
//         // Network or fetch error occurred
//         console.error("An error occurred while deleting.");
//       });
//   }

// Attach event listener to the cancel button
// const cancelButton = document.getElementById("cancelButton");
// cancelButton.addEventListener("click", closeDeleteModal);
// const confirmDeleteButton = document.getElementById("confirmDeleteButton");
// confirmDeleteButton.addEventListener("click", handleDelete);


  


// function handleDelete(event){
//     event.preventDefault();
//     const form=event.target;
//     const endpoint=form.action;
//     const formData = new FormData(form);
//     fetch(endpoint,{
//         method:'POST',
//         body:formData,
//     }) .then((response)=>{
//         if(response.ok){
//         // Delete operation was successful
//         const modal = document.getElementById("deleteModal");
//         const successMessage = modal.querySelector("#successMessage");
//         successMessage.textContent = "Deleted successfully!";
//         successMessage.classList.remove("hidden");
//         closeDeleteModal();
//         }else{
//         // Error occurred during the delete operation
//         const modal = document.getElementById("deleteModal");
//         const errorMessage = modal.querySelector("#errorMessage");
//         errorMessage.textContent = "An error occurred while deleting.";
//         errorMessage.classList.remove("hidden");
//         closeDeleteModal();
//         }
//     })
//     .catch((error)=>{
//         // Network or fetch error occurred
//       const modal = document.getElementById("deleteModal");
//       const errorMessage = modal.querySelector("#errorMessage");
//       errorMessage.textContent = "An error occurred while deleting.";
//       errorMessage.classList.remove("hidden");
//       closeDeleteModal();
//       console.error(error);
//     });
// }

// function handleDelete() {
//   const form = document.querySelector("#deleteProductForm,#deleteCategoryForm");
//   const endpoint = form.action;
//   const formData = new FormData(form);

//   fetch(endpoint, {
//     method: "POST",
//     body: formData,
//   }).then((response) => {
//     if (response.ok) {
//       // Delete operation was successful
//       const modal = document.getElementById("deleteModal");
//       const successMessage = modal.querySelector("#successMessage");
//       successMessage.textContent = "Deleted successfully!";
//       successMessage.classList.remove("hidden");
//       closeDeleteModal();
//     } else {
//       // Error occurred during the delete operation
//       const modal = document.getElementById("deleteModal");
//       const errorMessage = modal.querySelector("#errorMessage");
//       errorMessage.textContent = "An error occurred while deleting.";
//       errorMessage.classList.remove("hidden");
//       closeDeleteModal();
//     }
//   })
//   .catch(error => {
//     // Network or fetch error occurred
//     const modal = document.getElementById('deleteModal');
//     const errorMessage = modal.querySelector('#errorMessage');
//     errorMessage.textContent = 'An error occurred while deleting.';
//     errorMessage.classList.remove('hidden');
//     closeDeleteModal();
//     console.error(error);
//   });
// }




// function handleDelete() {
//     const itemId = document.querySelector('[name="productId"]').value;
//     fetch('/admin/delete-${itemType}', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ itemId: itemId })
//     })
//     .then(response => {
//       if (response.ok) {
//           // Delete operation was successful
//         const modal = document.getElementById('deleteModal');
//         modal.classList.add('hidden');
//         const message = document.getElementById('successMessage');
//          message.textContent = `${itemType} deleted successfully!`;
//          message.classList.remove('hidden');
//         // Perform any additional actions, such as updating the UI
//       } else {
//           // Error occurred during the delete operation
//         const message = document.getElementById('errorMessage');
//         message.textContent = `An error occurred while deleting the ${itemType}.`;
//         message.classList.remove('hidden');
//         // Handle the error as needed
//       }
//     })
//     .catch(error => {
//       // Network or fetch error occurred
//     const message = document.getElementById('errorMessage');
//     message.textContent = `An error occurred while deleting the ${itemType}.`;
//     message.classList.remove('hidden');
//     console.error(error);
//     });
//   }