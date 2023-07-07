// const {validationResult}=require('express-validator')
const Category = require("../models/category");
const Product = require("../models/product");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const orderController = require("../controllers/orderController");
const adminUserHelpers=require('../helpers/adminUserHelper');
const dashboardHelper=require('../helpers/dashboardHelper');

const ITEMS_PER_PAGE=6;

exports.postAddProduct = (req, res, next) => {
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
  const basePath = `/images/product-images/`;

  const imageUrls=[];
  images.forEach((item)=>{
    let fileName = item.filename;
    imageUrls.push(`${basePath}${fileName}`);
  })
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
              errorMessage:'Price or stock should be Integer.',
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
              errorMessage:'Attached file is not an image.',
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
            .then((result) => {
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
        oldInput:{
          title:'',
          description:'',
          stock:'',
          price:''
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getProducts = async(req, res, next) => {
  try {
    const page=+req.query.page||1;
    const message=req.query.message;
    const totalItems=await Product.countDocuments();
    const productsPerPage=ITEMS_PER_PAGE;
    const skip=(page-1)*productsPerPage;
   const products=await Product.find()
    .skip((page-1)*ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .populate('category')
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
    throw new Error('Error:',err);
  }
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
  const images = req.files;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const updatedStock = req.body.stock;
  const updatedCategoryId = new ObjectId(req.body.categoryId);
  Product.findById(prodId)
    .then((product) => {
      if(product.userId.toString()!==req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.stock = updatedStock;
      if (images) {
        const basePath=`/images/product-images/`;
        const imageUrls=[];
        images.forEach((item)=>{
          let fileName=item.filename;
          imageUrls.push(`${basePath}${fileName}`);
        })
      product.imageUrl =imageUrls;
      }
      product.description = updatedDescription;
      product.category = updatedCategoryId;
      return product.save() .then((result) => {
        console.log("UPDATED PRODUCT!");
        res.redirect("/admin/products");
      });
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
  Product.deleteOne({_id:prodId,userId:req.user._id})
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
    }).then(result=>{
       // Product deletion successful
       const message = "Product deleted successfully";
       return res.redirect(
         `/admin/products?message=${encodeURIComponent(message)}`
       )
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
    title: "categories",
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
              title: "categories",
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
        title: "categories",
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

exports.getIndex = async(req, res, next) => {
  try{
    const orders= await orderController.getAllOrders();
    const result=await dashboardHelper.getDashBoardData();
    res.render("admin/index", {
      pageTitle: "Plantso||Admin-Dashboard",
      layout: "main",
      orders:orders,
      totalRevenue:result.totalRevenue,
      totalOrdersCount:result.totalOrdersCount,
      totalProductsCount:result.totalProductsCount,
      totalCategoriesCount:result.totalCategoriesCount,
      currentMonthEarnings:result.currentMonthEarnings,
      title: "Dashboard",
    });
  }
  catch(error){
    throw new Error('Error while fetching dashboardData',error);
  }

};

exports.getUser = (req, res, next) => {
  res.render("admin/list-users", {
    pageTitle: "Plantso||Admin-UserList",
    layout: "main",
    title: "users",
  });
};

// exports.getOrders = async (req,res,next) => {
//   console.log('hiii')
//   try{
//     const orders=await orderController.getAllOrders()
//     .then(()=>{
//       res.render("admin/list-orders", {
//         pageTitle: "Plantso||Admin-OrderList",
//         layout: "main",
//         orders: orders, //Pass the orders to the view
//         title: "orders",
//     })
//     }).catch((error)=>{
//       console.log(error)
//     })
 
//   }
//   catch(error)  {
//       console.log(error);
//       res.status(500).json({error:"An error occured while fetching orders"});
//     };
// };


exports.getOrders = (req, res, next) => {
  console.log('hiii');
  orderController
    .getAllOrders()
    .then((orders) => {
      console.log(orders);
      res.render("admin/list-orders", {
        pageTitle: "Plantso||Admin-OrderList",
        layout: "main",
        orders: orders,
        title: "orders",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "An error occurred while fetching orders" });
    });
};
exports.getUsers = (req, res, next) => {
  adminUserHelpers.viewAllUser()
  .then(users => {
      res.render("admin/list-users", {
        pageTitle: "Plantso||Admin-UserList",
        layout: "main",
        users: users, //Pass the orders to the view
        title: "users",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({error:"An error occured while fetching users"});
    });
};

exports.blockUser=(req,res,next)=>{
  adminUserHelpers.blockUnblockUsers(req.body)
  .then(userStatus=>{
    res.json(userStatus);
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json({error:"An error occured while blocking users"});
  });
}

exports.getUserDetails=async(req,res,next)=>{
  try{
    const {userId}=req.params;
    //Fetch the user details
    const user=await adminUserHelpers.fetchUserDetails(userId);
    if(!user){
      return res.status(404).json({error:"User not found"});
    }
    res.status(200).json(user);
  }
  catch(error){
    res.status(500).json({error:'Internal server error'});
  }
}

exports.editUser=async(req,res,next)=>{
  try{
    const {userId}=req.body;
    const {email,phone,name}=req.body;
    console.log(userId,email,phone,name)
    
    const existingUser=await  adminUserHelpers.getUserById(userId);
    //Check  email uniqueness
    //Check if email and phone are modified

    //Check  email uniqueness
    const isEmailModified=email!==existingUser.email;
    const isPhoneModified=phone!==existingUser.phone;
    const isNameModified=name!==existingUser.name;
    if(isEmailModified){
      const isEmailUnqiue=await adminUserHelpers.checkEmailUnqiue(email,userId);
    if(!isEmailUnqiue){
      return res.status(400).json({
        success:false,
        message:"Email already exists"});
    }
  }
  //Check phone  unqiueness only if it is modified
  if(isPhoneModified){
    const isPhoneUnqiue=await adminUserHelpers.checkPhoneUnqiue(phone,userId);
    if(!isPhoneUnqiue){
      return res.status(400).json({
        success:false,
        message:"Phone number already exists"});
    }
  }
   //Check  name uniqueness
   if(isNameModified){
    const isUsernameUnqiue=await adminUserHelpers.checkUsernameUnqiue(name,userId);
   if(!isUsernameUnqiue){
     return res.status(400).json({
      success:false,
      message:"Username already exists"});
     }
   }
   
  //Update the user details
  const updatedUser = {
    // name: name || existingUser.name, // Keep existing name if not modified
    email: isEmailModified ? email : existingUser.email, // Keep existing email if not modified
    name: isNameModified ? name : existingUser.name, // Keep existing name if not modified
    phone: isPhoneModified ? phone : existingUser.phone, // Keep existing phone if not modified
  };

   await adminUserHelpers.updateUser(userId,updatedUser)
   return res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
  }catch(error){
    res.status(500).json({error:'Internal Server Error'});
  }
}

exports.updateOrderStatus=(req,res,next)=>{
  const orderId=req.params.orderId;
  const status=req.body.status;
  console.log(orderId,status+'hiiii');
  orderController.updateStatus(orderId,status)
  .then((order)=>{
    return res.json({success:true,message:'Order status updated successfully',status:order.status,orderId:orderId});
  }).catch((error)=>{
    console.log(error)
  })
}


exports.getGraphData=async(req,res,next)=>{
  try{
    const result=await dashboardHelper.getGraphDate();
    if(result.status){
      res.json({
        labels:result.labels,
        sales:result.salesData,
        products:result.productsData,
        message:result.message,
        success:true
      })
    }
  }
  catch(error){
    console.error('Error while fetching graph data',error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


exports.getChartDataFull=async(req,res,next)=>{
  try{
    const result=await dashboardHelper.getChartData();
    if (result.status) {
      const { popularProducts } = result;

      // Populate the chart data
      const labels = popularProducts.map((product) => product.productName);
      const data = popularProducts.map((product) => product.totalOrders);
      const stocks = popularProducts.map((product) => product.stocks); // Fetch product stock data

      return res.json({
        success: true,
        labels,
        data,
        stocks,
      });
    } else {
      return res.json({
        success: false,
        message: 'Oops! Something went wrong. Chart data not found.',
      });
    }
  }
  catch(error){
    console.error('Error while fetching graph data',error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

exports.getsalesReport=(req,res,next)=>{
  res.render("admin/sales", {
    pageTitle: "Plantso||Admin-SalesReport",
    layout: "main",
    title: "salesReport",
  });
}