const Category = require("../models/category");
const Product = require("../models/product");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Order=require('../controllers/orderController');

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const message1 = "Product name is required";
  const message2 = "Product with the same name already exists";
  const message3 = "Attached file is not an image.";
  const successMessage = "Product added successfully.";

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
            });
          }
          const image = req.file;
          const price = req.body.price;
          const description = req.body.description;
          const stock = req.body.stock;
          const categoryId = new ObjectId(req.body.categoryId);
          if (!image) {
            return res.status(409).render("admin/edit-product", {
              message: message3,
              layout: "main",
              pageTitle: "Plantso||Admin-Product",
              categories: updatedCategories,
            });
          }

          const fileName = req.file.filename;
          const basePath = `/images/product-images/`;
          console.log(`${fileName}🙋🙋`);
          const imageUrl = `${basePath}${fileName}`;
          const product = new Product({
            title: title,
            price: price,
            description: description,
            imageUrl: imageUrl,
            category: categoryId,
            stock: stock,
            userId: req.user,
          });
          product
            .save()
            .then((result) => {
              console.log(result);
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

exports.getAddProduct = (req, res, next) => {
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
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getProducts = (req, res, next) => {
  const message = req.query.message;
  Product.find()
    .populate("category")
    // .populate('userId','name')
    .lean()
    .then((products) => {
      products.forEach((product, index) => {
        product.serialNumber = index + 1;
      });
      console.log(products);
      res.render("admin/list-products", {
        prods: products,
        message: message,
        pageTitle: "Admin Products",
        path: "/admin/products",
        hasProducts: products.length > 0,
        layout: "main",
        title: "Products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//GET Single Product

exports.getProduct = (req, res, next) => {
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
exports.getEditProduct = (req, res, next) => {
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
          console.log(product.category._id);
          const otherCategory = categories.filter(
            (category) => String(category._id) !== String(selectedCategoryId)
          );
          console.log(selectedCategoryId);
          console.log(selectedCategory);
          console.log(otherCategory);
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
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const updatedStock = req.body.stock;
  const updatedCategoryId = new ObjectId(req.body.categoryId);
  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.stock = updatedStock;
      if (image) {
        const fileName = req.file.filename;
        const basePath = `/images/product-images/`;
        product.imageUrl = `${basePath}${fileName}`;
      }
      product.description = updatedDescription;
      product.category = updatedCategoryId;
      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

//Deleting the product
// exports.postDeleteProduct=(req,res,next)=>{
//   const prodId=req.body.productId;
//   Product.findByIdAndRemove(prodId)
//   .then(()=>{
//     console.log('DESTROYED PRODUCT');
//     res.redirect('/admin/products');
//   })
//   .catch(err=>console.log(err));
// }
// exports.postDeleteProduct=(req,res,next)=>{
//   const prodId=req.body.productId;
//   Product.findById(prodId)
//   .then((product)=>{
//     if(!product){
//       return res.status(404).render("admin/products", {
//         message: "Product not found",
//         layout: "main",
//         pageTitle: "Plantso || Admin - Products"
//       });
//     }
//      // Update the product's isDeleted flag
//      product.$isDeleted = true;

//      // Save the updated product
//      return product.save();
//     // console.log('DESTROYED PRODUCT');
//     // res.redirect('/admin/products');
//   }).then(()=>{
//     // Product deletion successful
//     const message = "Product deleted successfully";
//     res.redirect(`/admin/products?message=${encodeURIComponent(message)}`);
//   })
//   .catch(err=>console.log(err));
// }

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findByIdAndRemove(prodId)
    .then((deletedProduct) => {
      if (!deletedProduct) {
        // Product not found
        const message = "Product not found";
        return res.status(404).render("admin/products", {
          message: message,
          layout: "main",
          pageTitle: "Plantso || Admin - Products",
        });
      }

      // Product deletion successful
      const message = "Product deleted successfully";
      return res.redirect(
        `/admin/products?message=${encodeURIComponent(message)}`
      );

      // res.redirect(`/admin/products?message=${encodeURIComponent(message)}`);
      //  res.redirect('admin/products');
    })
    .catch((err) => {
      console.error(err);
      // Handle the error
      const message = "An error occurred while deleting the product";
      res.status(500).render("admin/products", {
        message: message,
        layout: "main",
        pageTitle: "Plantso || Admin - Products",
      });
    });
};

exports.getCategories = (req, res, next) => {
  const message = req.query.message;
  Category.find()
    .lean()
    .then((categories) => {
      res.render("admin/category", {
        pageTitle: "Plantso||Admin-Category",
        title: "Categories",
        layout: "main",
        message: message,
        categories: categories,
        hasCategory: categories.length > 0,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getAddCategory = (req, res, next) => {
  res.render("admin/edit-category", {
    pageTitle: "Plantso||Admin-Category",
    layout: "main",
  });
};
exports.postAddCategory = (req, res, next) => {
  const categoryName = req.body.name.toLowerCase();
  if (!categoryName) {
    return res.status(409).render("admin/edit-category", {
      message: "Category name is required",
      layout: "main",
      pageTitle: "Plantso||Admin-Category",
    });
  } else {
    Category.findOne({ name: categoryName })
      .then((existingCategory) => {
        if (existingCategory) {
          if (existingCategory.isDeleted) {
            existingCategory.isDeleted = false;
            existingCategory
              .save()
              .then((savedCategory) => {
                console.log(savedCategory);
                const message = "Category added Successfully.";
                return res
                  .status(201)
                  .redirect(
                    `/admin/category?message=${encodeURIComponent(message)}`
                  );
              })
              .catch((err) => console.log(err));
          } else {
            return res.status(409).render("admin/edit-category", {
              message: "Category already exists",
              layout: "main",
              pageTitle: "Plantso||Admin-Category",
            });
          }
        } else {
          const category = new Category({
            name: categoryName,
            isDeleted: false,
          });
          category
            .save()
            .then((savedCategory) => {
              console.log(savedCategory);
              const message = "Category added successfully.";
              return res
                .status(201)
                .redirect(
                  `/admin/category?message=${encodeURIComponent(message)}`
                );
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
exports.getEditCategory = (req, res, next) => {
  const editMode = req.query.edit;
  console.log(editMode);
  if (!editMode) {
    return res.redirect("/admin/category");
  }
  const prodId = req.params.categoryId;
  console.log(prodId);
  Category.findById(prodId)
    .lean()
    .then((category) => {
      console.log(category);
      if (!category) {
        return res.redirect("/admin/category");
      }
      res.render("admin/edit-category", {
        editing: editMode,
        category: category,
        layout: "main",
        pageTitle: "Plantso||Edit-category",
      });
    });
};

//method to delete the category from the database
// exports.postDeleteCategory=(req,res,next)=>{
//   const catId=req.body.categoryId;
//   Category.findByIdAndDelete(catId)
//   .then(result=>{
//     message="Category Deleted Successfully";
//     console.log('DESTROYED Category');
//     res.redirect(`/admin/category?message=${encodeURIComponent(message)}`);
//   })
//   .catch(err=>console.log(err));
// };

// another method to hide the category which is deleted
exports.postDeleteCategory = (req, res, next) => {
  const catId = req.body.categoryId;
  const categoryMessage = "Category not found";
  Category.findById(catId)
    .then((category) => {
      if (!category) {
        return res.status(404).render("admin/category", {
          message: categoryMessage,
          layout: "main",
          pageTitle: "Plantso||Admin-Category",
        });
      }
      //Delete the products under the category
      Product.deleteMany({ category: catId })
        .then(() => {
          //Set the category as deleted
          category.isDeleted = true;
          category
            .save()
            .then(() => {
              const message = "Category deleted successfully";
              res.redirect(
                `/admin/category?message=${encodeURIComponent(message)}`
              );
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
exports.postEditCategory = (req, res, next) => {
  const categoryId = req.body.categoryId;
  console.log(categoryId);
  const updatedName = req.body.name.toLowerCase();

  Category.findById(categoryId)
    .then((category) => {
      if (!category) {
        return res.status(409).render("admin/edit-category", {
          message: "Category Not Found",
          layout: "main",
          pageTitle: "Plantso||Admin-Category",
        });
      }

      return Category.findOne({
        name: updatedName,
        _id: { $ne: categoryId },
      }).then((existingCategory) => {
        if (existingCategory) {
          return res.status(409).render("admin/edit-category", {
            message: "Category Already Exists",
            layout: "main",
            pageTitle: "Plantso||Admin-Category",
            category: category,
          });
        } else {
          category.name = updatedName;
          return category.save().then((updatedCategory) => {
            const message = "Category Updated Successfully.";
            console.log("UPDATED CATEGORY");
            return Category.find().then((categories) => {
              categories = categories.map((category) => {
                if (
                  category._id.toString() === updatedCategory._id.toString()
                ) {
                  return updatedCategory;
                }
                return category;
              });
              res.redirect(
                `/admin/category?message=${encodeURIComponent(message)}`
              );
            });
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.postAddProduct = (req, res, next) => {
//   const title = req.body.title;
//   const message1="Product name is required";
//   const message2="Product  with the same name already exists";
//   const successmessage="Product added successfully."
//   if (!title) {
//     return res.status(409).render("admin/edit-product", {
//       message: message1,
//       layout: "main",
//       pageTitle: "Plantso||Admin-Category",
//     });
//   } else {
//     Product.findOne({ title: title })
//       .then((existingProduct) => {
//         if (existingProduct) {
//         Category.find({isDeleted:false})
//         .then((categories)=>{
//           const updatedCategories=categories.map(category=>{
//             return{
//               ...category,
//               categoryId:category._id,
//               name: category.name.charAt(0).toUpperCase()+category.name.slice(1)
//             }
//           })
//           return res.status(409).render("admin/edit-product", {
//             message: message2,
//             layout: "main",
//             pageTitle: "Plantso||Admin-Product",
//             categories:updatedCategories
//           });
//         })
//         }
//         else{
//         const imageUrl = req.body.imageUrl;
//         const price = req.body.price;
//         const description = req.body.description;
//         const stock=req.body.stock;
//         const categoryId =new ObjectId(req.body.categoryId);
//         const product = new Product({
//           title: title,
//           price: price,
//           description: description,
//           imageUrl: imageUrl,
//           category: categoryId,
//           stock:stock
//         });
//         product
//           .save()
//           .then((result) => {
//             console.log(result);
//              res
//               .status(201)
//               .redirect(
//                 `/admin/products?message=${encodeURIComponent(successmessage)}`
//               );
//           })
//           .catch((err) => {
//             console.log(err);
//           });
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// };

exports.getIndex = (req, res, next) => {
  res.render("admin/index", {
    pageTitle: "Plantso||Admin-Dashboard",
    layout: "main",
  });
};

exports.getUser = (req, res, next) => {
  res.render("admin/list-users", {
    pageTitle: "Plantso||Admin-UserList",
    layout: "main",
  });
};

exports.getOrders = (req, res, next) => {
  Order.getAllOrders()
  .then(orders=>{
    res.render("admin/user-list", {
      pageTitle: "Plantso||Admin-UserList",
      layout: "main",
      orders:orders,//Pass the orders to the view
    });
  })
  .catch(error=>{
    console.log(error);
  })
  
};
