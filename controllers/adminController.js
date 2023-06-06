const Category = require("../models/category");
const product = require("../models/product");
const Product = require("../models/product");
const mongoose = require('mongoose');
const ObjectId=mongoose.Types.ObjectId;


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

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const message1 = "Product name is required";
  const message2 = "Product with the same name already exists";
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

          const imageUrl = req.body.imageUrl;
          const price = req.body.price;
          const description = req.body.description;
          const stock = req.body.stock;
          const categoryId = new ObjectId(req.body.categoryId);
          const product = new Product({
            title: title,
            price: price,
            description: description,
            imageUrl: imageUrl,
            category: categoryId,
            stock: stock,
          });

          product
            .save()
            .then((result) => {
              console.log(result);
              res.status(201).redirect(`/admin/products?message=${encodeURIComponent(successMessage)}`);
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
  Category.find({isDeleted:false})
  .then(categories=>{
    const updatedCategories=categories.map(category=>{
      return {
        ...category,
        categoryId:category._id,
        name: category.name.charAt(0).toUpperCase()+category.name.slice(1)
      };
    });
    res.render("admin/edit-product", {
      pageTitle:"Plantso||Admin-Product",
      layout:'main',
      title:'Products',
      categories:updatedCategories
    });
  })
  .catch(err=>{
    console.log(err);
  })
 
};
exports.getProducts = (req, res, next) => {
  const message = req.query.message;
  Product.find()
  .populate('category')
  .lean()
    .then((products) => {
      products.forEach((product,index)=>{
        product.serialNumber=index+1;
      });
      console.log(products);
      res.render("admin/list-products", {
        prods: products,
        message: message,
        pageTitle: "Admin Products",
        path: "/admin/products",
        hasProducts: products.length > 0,
        layout:'main'
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//GET Single Product 

exports.getProduct=(req,res,next)=>{
  const prodId=req.params.productId;
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/admin/list-product");
  }
  Product.findById(prodId)
  .then(product=>{
    res.render("admin/edit-product", {
      pageTitle:"Plantso||Admin-editProduct",
      layout:'main',
      title:'Products',
      product:product
      // categories:updatedCategories
    });
  })
  .catch(err=>console.log(err));
}
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
    Category.findOne({ name: categoryName})
      .then((existingCategory) => {
        if (existingCategory) {
          return res.status(409).render("admin/edit-category", {
            message: "Category already exists",
            layout: "main",
            pageTitle: "Plantso||Admin-Category",
          });
        }
        const category = new Category({ name: categoryName ,isDeleted:false});
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
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getEditCategory=(req,res,next)=>{
  const editMode = req.query.edit;
  console.log(editMode);
  if (!editMode) {
    return res.redirect("/admin/category");
  }
  const prodId = req.params.categoryId;
  console.log(prodId);
  Category.findById(prodId).lean().then((category) => {
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
}

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
exports.postDeleteCategory=(req,res,next)=>{
  const catId=req.body.categoryId;
  const categoryMessage="Category not found"
  console.log(catId);
  Category.findById(catId)
  .then(category=>{
    if(!category){
      return res.status(404).render("admin/category",{
        message:categoryMessage,
        layout:'main',
        pageTitle:'Plantso||Admin-Category',
      });
    }
    category.isDeleted=true;
    category.save()
    .then(savedCategory=>{
      const message="Category deleted successfully";
      res.redirect(`/admin/category?message=${encodeURIComponent(message)}`);
    })
    .catch(err=>console.log(err));
  })
  .catch(err=>console.log(err));
}
exports.postEditCategory = (req, res, next) => {
  const categoryId = req.body.categoryId;
  console.log(categoryId);
  const updatedName = req.body.name.toLowerCase();

  Category.findById(categoryId)
    .then(category => {
      if (!category) {
        return res.status(409).render("admin/edit-category", {
          message: "Category Not Found",
          layout: "main",
          pageTitle: "Plantso||Admin-Category",
        });
      }

      return Category.findOne({ name: updatedName, _id: { $ne: categoryId } })
        .then(existingCategory => {
          if (existingCategory) {
            return res.status(409).render("admin/edit-category", {
              message: "Category Already Exists",
              layout: "main",
              pageTitle: "Plantso||Admin-Category",
              category: category
            });
          } else {
            category.name = updatedName;
            return category.save()
              .then(updatedCategory => {
                const message = "Category Updated Successfully.";
                console.log("UPDATED CATEGORY");
                return Category.find()
                  .then(categories => {
                    categories = categories.map(category => {
                      if (category._id.toString() === updatedCategory._id.toString()) {
                        return updatedCategory;
                      }
                      return category;
                    });
                    res.redirect(`/admin/category?message=${encodeURIComponent(message)}`)
                  });
              });
          }
        });
    })
    .catch(err => {
      console.log(err);
    });
};


