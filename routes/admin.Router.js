const express = require("express");
//middleware to product admin routes;
const isAdmin=require("../middleware/is-auth");
//controllers for admin 
const adminController=require("../controllers/adminController");
const categoryController=require("../controllers/categoryController");
const productController=require("../controllers/productController");
const orderController=require("../controllers/orderController");
const couponController=require("../controllers/couponController");
// const upload=require("../config/multer");
const {body}=require("express-validator");
const  adminRouter = express.Router();

/* GET home page. */
adminRouter.get("/",isAdmin.isAdmin,adminController.getIndex);



//Category Admin Routers
adminRouter.get("/category",isAdmin.isAdmin,categoryController.getCategories);
adminRouter.get("/add-category",isAdmin.isAdmin,categoryController.getAddCategory);
adminRouter.post("/add-category",isAdmin.isAdmin,categoryController.postAddCategory);
adminRouter.get("/edit-category/:categoryId",isAdmin.isAdmin,categoryController.getEditCategory);
adminRouter.post("/edit-category",isAdmin.isAdmin,categoryController.postEditCategory);
adminRouter.post("/delete-category",isAdmin.isAdmin,categoryController.postDeleteCategory);

//Product Admin Routers
adminRouter.get("/products",isAdmin.isAdmin,productController.getProducts);
adminRouter.get("/add-product",isAdmin.isAdmin,productController.getAddProduct);
adminRouter.post("/add-product",[
    body("title")
        .isAlphanumeric()
        .isLength({min:3})
        .trim(),
    body("price").isNumeric(),
    body("description").isLength({min:5,max:400}).trim(),
    body("stock").isNumeric()
],isAdmin.isAdmin,productController.postAddProduct);
adminRouter.get("/view-product/:productId",isAdmin.isAdmin,productController.getProduct);
adminRouter.get("/edit-product/:productId",isAdmin.isAdmin,productController.getEditProduct);
adminRouter.post("/edit-product",[body("title")
    .isAlphanumeric()
    .isLength({min:3})
    .trim(),
body("price").isNumeric(),
body("description").isLength({min:5,max:400}).trim(),
body("stock").isNumeric()
],isAdmin.isAdmin,productController.postEditProduct);
adminRouter.post("/delete-product",isAdmin.isAdmin,productController.postDeleteProduct);

//user managment Admin Routes
adminRouter.get("/users",isAdmin.isAdmin,adminController.getUsers);
adminRouter.post("/blockUser",isAdmin.isAdmin,adminController.blockUser);
adminRouter.get("/editUser/:userId",isAdmin.isAdmin,adminController.getUserDetails);
adminRouter.post("/editUserDetails/",isAdmin.isAdmin,adminController.editUser);
//Order Admin Routes
adminRouter.get("/orders",isAdmin.isAdmin,orderController.getAllOrders);
adminRouter.put("/orders/:orderId",isAdmin.isAdmin,orderController.updateOrderStatus);


//Dashbord graph
adminRouter.get("/graph",isAdmin.isAdmin,adminController.getGraphData);
adminRouter.get("/chart",isAdmin.isAdmin,adminController.getChartDataFull);
//Sales Report page


adminRouter.get("/sales",isAdmin.isAdmin,orderController.getsalesReport);
adminRouter.post("/sales-report",isAdmin.isAdmin,orderController.salesReport);

//Coupon Admin Routes

adminRouter.get("/coupons",isAdmin.isAdmin,couponController.getCoupons);
adminRouter.post("/addCoupon",isAdmin.isAdmin,couponController.addCoupons);
adminRouter.put("/coupon-status",isAdmin.isAdmin,couponController.changeCouponStatus);

module.exports = adminRouter;
