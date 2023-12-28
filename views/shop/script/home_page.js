let displayProducts = 4;
const allProducts = Array.from(document.querySelectorAll(".filter__item"));
const loadMoreBtn = document.getElementById("loadMoreBtn");
let isLoading = false;

allProducts.forEach((product, index) => {
    if (index >= displayProducts) {
        product.style.display = "none";
    } else {
        product.classList.add(
            "col-xl-3",
            "col-lg-4",
            "col-md-6",
            "col-sm-6",
            "u-s-m-b-30"
        );
    }
});
loadMoreBtn.addEventListener("click", loadMoreProducts);

// Load more products
function loadMoreProducts() {
    // Check if loading is already in progress
    if (isLoading) {
        return;
    }
    isLoading = true; // Set loading state
    const remainingProducts = allProducts.length - displayProducts;
    const loadCount = Math.min(4, remainingProducts);

    for (let i = displayProducts; i < displayProducts + loadCount; i++) {
        allProducts[i].style.display = "block";
    }

    displayProducts += loadCount;

    if (displayProducts >= allProducts.length) {
        loadMoreBtn.style.display = "none";
    }

    isLoading = false; // Reset loading state
}

const categoryButtons = document.querySelectorAll(
    ".filter__btn:not(#allProductsBtn)"
);
console.log(categoryButtons);
categoryButtons.forEach((button) => {
    button.addEventListener("click", filterProducts);
});

function filterProducts(event) {
    const selectedCategory = event.target.getAttribute("data-filter");

    allProducts.forEach((product) => {
        const category = product.classList[6];
        if (selectedCategory === "*" || selectedCategory === `.${category}`) {
            product.style.display = "block";
            product.classList.add(
                "col-xl-3",
                "col-lg-4",
                "col-md-6",
                "col-sm-6",
                "u-s-m-b-30"
            );
        } else {
            product.style.display = "none";
        }
    });

    let displayedProducts = document.querySelectorAll(
        `.filter__item${selectedCategory}`
    ).length;
    console.log(displayedProducts);
    if (displayProducts <= 4) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}
