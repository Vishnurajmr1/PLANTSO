// previous code start

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
    console.log(endpoint);
  
    // Remove the event listener for the confirm delete button
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");
    confirmDeleteButton.removeEventListener("click", handleConfirmDelete);
  
    // Show the confirmation modal
    openDeleteModal(event);
  
    // Attach the event listener to the confirm delete button
    confirmDeleteButton.addEventListener("click",()=> handleConfirmDelete(endpoint));
  
    function handleConfirmDelete(endpoint) {
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type":"application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(new FormData(form)),
      })
        .then((response) => {
          if (response.ok) {
            // Delete operation was successful
            closeDeleteModal(); // Close the delete modal
            
            if(endpoint.includes('delete-product')){
               const  message="Product deleted successfully";
                window.location.href=`/admin/products?message=${encodeURIComponent(message)}`
                // window.location.href=`/admin/category?message=${encodeURIComponent(message)}`; // Refresh the page or perform any other necessary action
                // window.location.href=`/admin/product?message=${encodeURIComponent(message)}`;
            }else if(endpoint.includes('delete-category')){
                const message="Category deleted successfully";
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
        })
    }
  }



//Cart management script

function deleteFromCart(productId,productName){
  console.log(productName);
        Swal.fire({
          title:'Are you Sure?',
          html: `You are about to delete <span class="highlighted-text">${productName}</span> from your cart`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          customClass:{
            title: 'custom-title-class',
            content: 'custom-content-class',
          },
        }).then((result)=>{
          if(result.isConfirmed){
            fetch('/cart-delete-item',{
          method:"POST",
          headers:{
            'Content-Type':'application/json'
          },
          body: JSON.stringify({productId}),
        }).then(async(res)=>{
        const response=await res.json();
          console.log(response);
          console.log(productId);
          if(response.success){
            Swal.fire(
        'Success',
        `<span class="highlighted-text">${productName}</span> deleted from cart successfully`,
        'success'
        )
        const deletedItem=document.getElementById(`product-${productId}`);
        console.log(deletedItem);
        if(deletedItem){
          deletedItem.remove();
        }
        const cartItmesCount=document.getElementsByClassName('cart-item').length;
        if(cartItmesCount===0){

          setTimeout(()=>{
          window.location.reload()
          },2000)
        }
          }else{
          Swal.fire(
        'Error',
        'Oops!Something went wrong.Product not deleted from cart',
        'error'
      )
            console.log('Error:Product not deleted from cart');
          }
        })
        .catch((err)=>{
          console.log(err);
        });
     }
    });
        
}
const minusBtn=document.querySelectorAll(".input-counter__minus");
const plusBtn=document.querySelectorAll(".input-counter__plus");

minusBtn.forEach((button)=>{
  button.addEventListener('click',decrementQuantity);
})

plusBtn.forEach((button)=>{
  button.addEventListener('click',incrementQuantity);
})

//Event handler for decrementing the quantity

function decrementQuantity(productId){
  const quantityElement = document.querySelector(`input[data-product-id="${productId}"]`);
  const quantity=parseInt(quantityElement.value);
  const minQunatity=parseInt(quantityElement.dataset.min);
  if(quantity>minQunatity){
    updateQuantitySpan(productId,quantity-1);
  }
}

function incrementQuantity(productId){
  const quantityElement = document.querySelector(`input[data-product-id="${productId}"]`);

  const quantity=parseInt(quantityElement.value);
  const maxQuantity = parseInt(quantityElement.dataset.max);
  if(quantity<maxQuantity){
    updateQuantitySpan(productId,quantity+1);
  }
}
function updateQuantitySpan(productId,quantity){

  const specificLink=document.querySelector(`#quantity-${productId}`)
  specificLink.textContent=`Quantity:[${quantity}]`;
  const quantitySpans = document.querySelectorAll(`.quantity-${productId}`);
  quantitySpans.forEach((span)=>{
    if(span!==specificLink){
     span.textContent = `${quantity}`;
    }
  });
  updateProductQuantity(productId,quantity);
}

function updateProductQuantity(productId, quantity) {
  fetch('/cart', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity: quantity,
      productId: productId,
    }),
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(function (data) {
      //Update the price in the HTML based on the received data
      const priceElement=document.getElementById(`price-${productId}`);
      const subTotal=document.getElementById('subTotal');
      const grandTotal=document.getElementById('grandTotal');
      if(priceElement){
        priceElement.textContent=`₹${data.updatedPrice}`;
        priceElement.dataset.price=data.updatedPrice;
        subTotal.textContent=`₹${data.cartTotal}`
        grandTotal.textContent=`₹${data.cartTotal}`
      }
    })
    .catch(function (error) {
      console.error('There was a problem with the updating product operation:', error);
    });
}

//Add To Cart

   function addToCart(productId){
    fetch("/cart", {
    method: "POST",
    headers:{
      'Content-Type':'application/json'
    },
    body: JSON.stringify({productId}),
    }).then(async(res)=>{
    const response =  await res.json();
     let productName = document.getElementById(`productName${productId}`).textContent;
     let productPrice = document.getElementById(`productPrice${productId}`).textContent;
     let productImage = document.getElementById(`productImage${productId}`).src;
    // let productQuantity=parseInt(document.getElementById(`productQuantity${productId}`).value);
     if(response.success){
       document.getElementById(`prodName`).textContent = productName;
      document.getElementById(`prodPrice`).textContent = productPrice;
      document.getElementById(`prodImage`).src = productImage;
     // document.getElementById(`prodQuantity`).textContent = `Quantity:${productQuantity}`;

      document.getElementById('modal-view').hidden = false;

      const deletedItem=document.getElementById(`product-${productId}`);
      console.log(deletedItem);
      if(deletedItem){
        deletedItem.remove();
      }
     }else{
      document.getElementById(`prodName`).textContent = "Stock Not Available",
      document.getElementById(`prodPrice`).textContent = "";
       document.getElementById('modal-view-stock').hidden = false;
      // Check if the error message is related to stock availability
       if(response.message==='Currently,the Stock is not available'){
        document.getElementById('stock-not-available').style.display = 'block';
        document.getElementById('stock-not-available').classList.add('show');
        document.body.classList.add('modal-open');
     // document.getElementById('modal-view-stock').hidden = false;
       }
      document.getElementById(`prodName`).textContent = productName;
      document.getElementById(`prodPrice`).textContent = productPrice;
      document.getElementById(`prodImage`).src = productImage;
      document.getElementById('modal-view').hidden = false;
       console.log('Error:Product not added to cart');
     }
    }).catch((err)=>{
      console.log(err)
    });
  }


  function updatePriceRange(){
    const productPrices=Array.from(document.getElementsByClassName('product-m__price'))
    .map((priceElement)=>parseFloat(priceElement.textContent.replace('₹','').trim()));
    console.log(productPrices)

    const minPrice=Math.min(...productPrices);
    const maxPrice=Math.max(...productPrices);
    const rangeInput=document.getElementById('myRange');
    rangeInput.min=minPrice;
    rangeInput.max=maxPrice;
    rangeInput.value=minPrice;
  }

  //Call the function to update  the price range initially

  updatePriceRange();

let slider = document.getElementById("myRange");
let output = document.getElementById("demo");
output.innerHTML =slider.value;

slider.oninput = function() {
  output.innerHTML = `${this.value}`;
}


// Get the close button element
// let closeButton = document.querySelector('#stock-not-available .dismiss-button');

// Add an event listener to the close button
// closeButton.addEventListener('click', function() {
//   // Get the modal element
//   let modal = document.querySelector('#stock-not-available');

//   // Close the modal by removing the 'show' class
//   modal.classList.remove('show');
//   // Hide the modal by setting the 'hidden' attribute
//   modal.setAttribute('hidden', 'true');

//     // Check if the modal is completely hidden
//     let modalHiddenInterval = setInterval(function() {
//       let isModalHidden = window.getComputedStyle(modal).getPropertyValue('display') === 'none';
  
//       // Reload the window if the modal is hidden
//       if (isModalHidden) {
//         clearInterval(modalHiddenInterval);
//         window.location.reload();
//       }
//     }, 100);
// });


