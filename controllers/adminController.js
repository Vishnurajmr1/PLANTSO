// const {validationResult}=require('express-validator')
const orderHelper = require("../helpers/orderHelper");
const adminUserHelpers=require("../helpers/adminUserHelper");
const dashboardHelper=require("../helpers/dashboardHelper");




exports.getIndex = async(req, res) => {
    try{
        const orders= await orderHelper.getAllOrders();
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
        throw new Error("Error while fetching dashboardData",error);
    }

};

exports.getUser = (req, res) => {
    res.render("admin/list-users", {
        pageTitle: "Plantso||Admin-UserList",
        layout: "main",
        title: "users",
    });
};



exports.getUsers = (req, res) => {
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

exports.blockUser=(req,res)=>{
    adminUserHelpers.blockUnblockUsers(req.body)
        .then(userStatus=>{
            res.json(userStatus);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({error:"An error occured while blocking users"});
        });
};

exports.getUserDetails=async(req,res)=>{
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
        res.status(500).json({error:"Internal server error"});
    }
};



exports.editUser=async(req,res)=>{
    try{
        const {userId}=req.body;
        const {email,phone,name}=req.body;
    
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

        await adminUserHelpers.updateUser(userId,updatedUser);
        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
        });
    }catch(error){
        res.status(500).json({error:"Internal Server Error"});
    }
};




exports.getGraphData=async(req,res)=>{
    try{
        const result=await dashboardHelper.getGraphDate();
        if(result.status){
            res.json({
                labels:result.labels,
                sales:result.salesData,
                products:result.productsData,
                message:result.message,
                success:true
            });
        }
    }
    catch(error){
        console.error("Error while fetching graph data",error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.getChartDataFull=async(req,res)=>{
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
                message: "Oops! Something went wrong. Chart data not found.",
            });
        }
    }
    catch(error){
        console.error("Error while fetching graph data",error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
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
// exports.postDeleteCategory = (req, res, next) => {
//   const catId = req.body.categoryId;
//   const categoryMessage = "Category not found";
//   Category.findById(catId)
//     .then((category) => {
//       if (!category) {
//         return res.status(404).render("admin/category", {
//           message: categoryMessage,
//           layout: "main",
//           pageTitle: "Plantso||Admin-Category",
//         });
//       }
//       Product.countDocuments({category:catId})
//       .then((productCount)=>{
//         if (productCount > 0) {
//           // Products exist under the category, cannot delete/disable the category
//           const message = "Cannot delete/disable the category as it contains products";
//           return res.redirect(
//             `/admin/category?message=${encodeURIComponent(message)}`
//           );
//         }
//       //Delete the products under the category
//       // Product.deleteMany({ category: catId })
//       //   .then(() => {
//           //Set the category as deleted
//           category.isDeleted = true;
//           category
//             .save()
//             .then(() => {
//               const message = "Category deleted successfully";
//               res.redirect(
//                 `/admin/category?message=${encodeURIComponent(message)}`
//               );
//             })
//             .catch((err) => console.log(err));
//         })
//         .catch((err) => console.log(err));
//     })
//     .catch((err) => console.log(err));
// };




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
