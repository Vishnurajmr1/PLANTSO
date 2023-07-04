const express = require('express');
//middleware to product admin routes;
const isAdmin=require('../middleware/is-auth');
//controllers for admin 
const adminController=require('../controllers/adminController');
const productController=require('../controllers/productController');
const orderController=require('../controllers/orderController');
const couponController=require('../controllers/couponController');
const upload=require('../config/multer');
const {body}=require('express-validator');
const  adminRouter = express.Router();

/* GET home page. */
adminRouter.get('/',isAdmin.isAdmin,adminController.getIndex);
// adminRouter.get('/users',adminController.getUser);
// adminRouter.get('/orders',adminController.getOrders);


//Category Admin Routers
adminRouter.get('/category',isAdmin.isAdmin,adminController.getCategories);
adminRouter.get('/add-category',isAdmin.isAdmin,adminController.getAddCategory);
adminRouter.post('/add-category',isAdmin.isAdmin,adminController.postAddCategory);
adminRouter.get('/edit-category/:categoryId',isAdmin.isAdmin,adminController.getEditCategory);
adminRouter.post('/edit-category',isAdmin.isAdmin,adminController.postEditCategory);
adminRouter.post('/delete-category',isAdmin.isAdmin,adminController.postDeleteCategory);

//Product Admin Routers
adminRouter.get('/products',isAdmin.isAdmin,adminController.getProducts);
adminRouter.get("/add-product",isAdmin.isAdmin,adminController.getAddProduct);
adminRouter.post("/add-product",[
    body('title')
    .isAlphanumeric()
    .isLength({min:3})
    .trim(),
    body('price').isNumeric(),
    body('description').isLength({min:5,max:400}).trim(),
    body('stock').isNumeric()
],isAdmin.isAdmin,adminController.postAddProduct);
adminRouter.get("/view-product/:productId",isAdmin.isAdmin,adminController.getProduct);
adminRouter.get('/edit-product/:productId',isAdmin.isAdmin,adminController.getEditProduct);
adminRouter.post('/edit-product',[body('title')
.isAlphanumeric()
.isLength({min:3})
.trim(),
body('price').isNumeric(),
body('description').isLength({min:5,max:400}).trim(),
body('stock').isNumeric()
],isAdmin.isAdmin,adminController.postEditProduct);
adminRouter.post('/delete-product',isAdmin.isAdmin,adminController.postDeleteProduct);

//user managment Admin Routes
adminRouter.get('/users',isAdmin.isAdmin,adminController.getUsers);
adminRouter.post('/blockUser',isAdmin.isAdmin,adminController.blockUser);
adminRouter.get('/editUser/:userId',isAdmin.isAdmin,adminController.getUserDetails);
adminRouter.post('/editUserDetails/',isAdmin.isAdmin,adminController.editUser);
//Order Admin Routes
adminRouter.get('/orders',isAdmin.isAdmin,adminController.getOrders);
adminRouter.put('/orders/:orderId',isAdmin.isAdmin,adminController.updateOrderStatus);
//Coupon Admin Routes

adminRouter.get('/coupons',isAdmin.isAdmin,couponController.getCoupon);
// adminRouter.post('/coupons',isAdmin.isAdmin,couponController.addCoupon);
// adminRouter.put('/coupon-status',isAdmin.isAdmin,couponController.ChangeCouponStatus);
module.exports = adminRouter;
