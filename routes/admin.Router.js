const express = require('express');
//middleware to product admin routes;
const isAdmin=require('../middleware/is-auth');
//controllers for admin 
const adminController=require('../controllers/adminController');
const productController=require('../controllers/productController');
const orderController=require('../controllers/orderController');
const upload=require('../config/multer');
const  adminRouter = express.Router();

/* GET home page. */
adminRouter.get('/',isAdmin.isAdmin,adminController.getIndex);
adminRouter.get('/users',adminController.getUser);
adminRouter.get('/orders',adminController.getOrders);


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
adminRouter.post("/add-product",isAdmin.isAdmin,adminController.postAddProduct);
adminRouter.get("/view-product/:productId",isAdmin.isAdmin,adminController.getProduct);
adminRouter.get('/edit-product/:productId',isAdmin.isAdmin,adminController.getEditProduct);
adminRouter.post('/edit-product',isAdmin.isAdmin,adminController.postEditProduct);
adminRouter.post('/delete-product',isAdmin.isAdmin,adminController.postDeleteProduct);


//Order Admin Routes

adminRouter.get('/orders',orderController.getAllOrders);

module.exports = adminRouter;
