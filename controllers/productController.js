const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Product = require("../models/product");
const Category = require("../models/category");
const ITEMS_PER_PAGE=6;



exports.getAddProduct = (req, res) => {
    Category.find({ isDeleted: false })
        .then((categories) => {
            const updatedCategories = categories.map((category) => {
                return {
                    ...category,
                    categoryId: category._id,
                    name: category.name.charAt(0).toUpperCase() + category.name.slice(1),
                };
            });
            res.render("admin/edit-product", {
                pageTitle: "Plantso||Admin-Product",
                layout: "main",
                title: "Products",
                categories: updatedCategories,
                oldInput:{
                    title:"",
                    description:"",
                    stock:"",
                    price:""
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postAddProduct = (req, res) => {
    const title = req.body.title;
    const message1 = "Product name is required";
    const message2 = "Product with the same name already exists";
    const message3 = "Attached file is not an image.";
    const successMessage = "Product added successfully.";
    const images = req.files;
    const price = req.body.price;
    const description = req.body.description;
    const stock = req.body.stock;
    const categoryId =new ObjectId(req.body.categoryId);
    const basePath = "/images/product-images/";

    const imageUrls=[];
    images.forEach((item)=>{
        let fileName = item.filename;
        imageUrls.push(`${basePath}${fileName}`);
    });
    // const fileName = req.file.filename;
    // const imageUrl = `${basePath}${fileName}`;

    Category.find({ isDeleted: false })
        .then((categories) => {
            const updatedCategories = categories.map((category) => {
                return {
                    ...category,
                    categoryId: category._id,
                    name: category.name.charAt(0).toUpperCase() + category.name.slice(1),
                };
            });
            if (!title) {
                return res.status(409).render("admin/edit-product", {
                    message: message1,
                    layout: "main",
                    pageTitle: "Plantso||Admin-Category",
                    categories: updatedCategories,
                });
            }
            Product.findOne({ title: title })
                .then((existingProduct) => {
                    if (existingProduct) {
                        return res.status(409).render("admin/edit-product", {
                            message: message2,
                            layout: "main",
                            pageTitle: "Plantso||Admin-Product",
                            categories: updatedCategories,
                            oldInput:{
                                title:title,
                                description:description,
                                stock:stock,
                                price:price,
                            },
                        });
                    }
                    if(stock<=0 || price<=0){
                        return res.status(422).render("admin/edit-product", {
                            layout: "main",
                            pageTitle: "Plantso||Admin-Product",
                            categories: updatedCategories,
                            errorMessage:"Price or stock should be Integer.",
                            oldInput:{
                                title:title,
                                description:description,
                                stock:stock,
                                price:price,
                                category: categoryId,
                            }
                        });
                    }
                    if (!images) {
                        return res.status(422).render("admin/edit-product", {
                            message: message3,
                            layout: "main",
                            pageTitle: "Plantso||Admin-Product",
                            categories: updatedCategories,
                            errorMessage:"Attached file is not an image.",
                            oldInput:{
                                title:title,
                                description:description,
                                stock:stock,
                                price:price,
                                category:categoryId,
                            }
                        });
                    }

                    const product = new Product({
                        title: title,
                        price: price,
                        description: description,
                        imageUrl: imageUrls,
                        category: categoryId,
                        stock: stock,
                        userId: req.user,
                    });
                    product
                        .save()
                        .then(() => {
                            res
                                .status(201)
                                .redirect(
                                    `/admin/products?message=${encodeURIComponent(
                                        successMessage
                                    )}`
                                );
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
};


exports.getProducts = async(req, res) => {
    try {
        const page=+req.query.page||1;
        const message=req.query.message;
        const totalItems=await Product.countDocuments();
        const productsPerPage=ITEMS_PER_PAGE;
        const skip=(page-1)*productsPerPage;
        const products=await Product.find()
            .skip((page-1)*ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .populate("category")
            .lean();
        const startingStringNumber=skip+1;
        products.forEach((product,index) => {
            product.serialNumber = startingStringNumber + index;
        });
        res.render("admin/list-products", {
            prods: products,
            message: message,
            pageTitle: "Admin Products",
            path: "/admin/products",
            hasProducts: products.length > 0,
            layout: "main",
            title: "Products",
            currentPage:page,
            hasNextPage:ITEMS_PER_PAGE*page<totalItems,
            hasPreviousPage:page>1,
            nextPage:page+1,
            previousPage:page-1,
            lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)
        });
    } catch (err) {
        throw new Error("Error:",err);
    }
};


//GET Single Product

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .populate("category")
        .lean()
        .then((product) => {
            res.render("admin/view-detail", {
                pageTitle: "Plantso||Admin-viewProduct",
                layout: "main",
                title: "Products",
                product: product,
            });
        })
        .catch((err) => console.log(err));
};

//Get the edit product page
exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;
    Category.find({ isDeleted: false })
        .lean()
        .then((categories) => {
            if (!editMode) {
                return res.redirect("/admin/products");
            }
            // const category=Category.find();
            Product.findById(prodId)
                .populate("category")
                .lean()
                .then((product) => {
                    if (!product) {
                        return res.redirect("/admin/products");
                    }
                    const selectedCategoryId = product.category._id;
                    const selectedCategory = categories.find(
                        (category) => String(category._id) === String(selectedCategoryId)
                    );
                    const otherCategory = categories.filter(
                        (category) => String(category._id) !== String(selectedCategoryId)
                    );
                    res.render("admin/edit-product", {
                        editing: editMode,
                        product: product,
                        layout: "main",
                        pageTitle: "Plantso||Edit-Product",
                        selectedCategory: selectedCategory,
                        otherCategories: otherCategory,

                        // categories:category
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
};


//Post method to edit product
exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const images = req.files;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const updatedStock = req.body.stock;
    const updatedCategoryId = new ObjectId(req.body.categoryId);
    Product.findById(prodId)
        .then((product) => {
            if(product.userId.toString()!==req.user._id.toString()){
                return res.redirect("/");
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.stock = updatedStock;
            if (images) {
                const basePath="/images/product-images/";
                const imageUrls=[];
                images.forEach((item)=>{
                    let fileName=item.filename;
                    imageUrls.push(`${basePath}${fileName}`);
                });
                product.imageUrl =imageUrls;
            }
            product.description = updatedDescription;
            product.category = updatedCategoryId;
            return product.save() .then(() => {
                console.log("UPDATED PRODUCT!");
                res.redirect("/admin/products");
            });
        })
        .catch((err) => console.log(err));
};

//Deleting the product as soft delete
exports.postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    Product.findByIdAndUpdate({_id:prodId,userId:req.user._id},{isDeleted:true})
        .then((deletedProduct) => {
            if (!deletedProduct) {
                // Product not found
                const message = "Product not found";
                return res.status(404).render("admin/products", {
                    message: message,
                    layout: "main",
                    pageTitle: "Plantso || Admin - Products",
                    title: "Products",
                });
            }
            // Product deletion successful
            // const message = "Product deleted successfully";
            // return res.redirect(
            //   `/admin/products?message=${encodeURIComponent(message)}`
            // )
        }).then(()=>{
            // Product deletion successful
            const message = "Product deleted successfully";
            return res.redirect(
                `/admin/products?message=${encodeURIComponent(message)}`
            );
        })
        .catch((err) => {
            console.error(err);
            // Handle the error
            const message = "An error occurred while deleting the product";
            res.status(500).render("admin/products", {
                message: message,
                layout: "main",
                pageTitle: "Plantso || Admin - Products",
                title: "Products",
            });
        });
};




exports.getProductsByFilter = (req, res) => {
    const category = req.body.category;
    const price = req.body.price;
    const sort = req.body.sort;
    const page= +req.body.page || 1;
    const perPage=10;//Number of products per page
    console.log(category+"hiiiii",price,sort,page);

    //Prepare the filter options based on category and price
    const filterOptions={};
    if(category!=="all"){
        filterOptions["category.name"]=category;
    }
    if(price){
        filterOptions.price={$lte:parseInt(price)};
        console.log(filterOptions);
    }

    //Prepare the sort option based on sort parameter
    const sortOption={};
    switch(sort){
    case "asc":
        sortOption.price=1;
        break;
    case "desc":
        sortOption.price=-1;
        break;
    default:
        //If needed handle it properly
        break;
    }
    const  aggregationStages=[
        {
            $lookup:{
                from:"categories",
                localField:"category",
                foreignField:"_id",
                as:"category"
            }
        },
        {
            $match:filterOptions,
        // 'category.name':category 
        },
    ];
    if(category){
        if(sortOption.price||(price && !category)){
            aggregationStages.push({
                $sort:sortOption,
            });
        }
    }
    aggregationStages.push(
        {
            $skip:(page-1)*perPage,
        },
        {
            $limit:perPage,
        }
    );
    let totalProductsQuery=[];
    if(category ==="all"){
        totalProductsQuery.push(
            {
                $lookup:{
                    from:"categories",
                    localField:"category",
                    foreignField:"_id",
                    as:"category",
                },
            },
            {
                $count:"totalProducts",
            }
        );
    }
    Product.aggregate(aggregationStages)
        .then((products)=>{
            // Calculate the total number of filtered products
            let totalProducts=products.length;

            if(category==="all"){
                Product.aggregate(totalProductsQuery)
                    .then((result)=>{
                        if(result.length>0){
                            totalProducts=result[0].totalProducts;
                        }
                        // Perform pagination on the filtered products
                        const paginatedProducts=products.slice((page-1)*perPage,page*perPage);
                        return res.json({
                            prods:products,
                            totalProducts,
                            filterProducts:paginatedProducts,
                        });
                    })
                    .catch((error)=>{
                        return res.status(500).json({ error: "Failed to fetch products." });
                    });
            }else{
                // Perform pagination on the filtered products
                const paginatedProducts=products.slice((page-1)*perPage,page*perPage);
                return res.json({
                    prods:products,
                    totalProducts,
                    filterProducts:paginatedProducts,
                });
            }   
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: "Failed to fetch products." });
        });
};
