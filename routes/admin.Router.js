const express = require('express');
const adminController=require('../controllers/adminController');
const productController=require('../controllers/productController');
const orderController=require('../controllers/orderController');
const upload=require('../config/multer');
const  adminRouter = express.Router();

/* GET home page. */
adminRouter.get('/', function(req, res, next) {
  res.render('admin/index', { pageTitle: 'Plantso||Admin-Dashboard',layout:'main' });
});
adminRouter.get('/users', function(req, res, next) {
  res.render('admin/list-users', { pageTitle: 'Plantso||Admin-Users',layout:'main' });
});
// adminRouter.get('/products', function(req, res, next) {
//   res.render('admin/list-products', { pageTitle: 'Plantso||Admin-Products',layout:'main' });
// });
adminRouter.get('/orders', function(req, res, next) {
  res.render('admin/list-orders', { pageTitle: 'Plantso||Admin-Orders',layout:'main' });
});
// adminRouter.get('/newProduct', function(req, res, next) {
//   res.render('admin/edit-product', { pageTitle: 'Plantso||Admin-Orders',layout:'main' });
// });


//Category Admin Routers
adminRouter.get('/category',adminController.getCategories);
adminRouter.get('/add-category',adminController.getAddCategory);
adminRouter.post('/add-category',adminController.postAddCategory);
adminRouter.get('/edit-category/:categoryId',adminController.getEditCategory);
adminRouter.post('/edit-category',adminController.postEditCategory);
adminRouter.post('/delete-category',adminController.postDeleteCategory);

//Product Admin Routers
adminRouter.get('/products',adminController.getProducts);
adminRouter.get("/add-product",adminController.getAddProduct);
adminRouter.post("/add-product",adminController.postAddProduct);
adminRouter.get("/view-product/:productId",adminController.getProduct);
adminRouter.get('/edit-product/:productId',adminController.getEditProduct);
adminRouter.post('/edit-product',adminController.postEditProduct);
adminRouter.post('/delete-product',adminController.postDeleteProduct);


//Order Admin Routes

adminRouter.get('/orders',orderController.getAllOrders);




module.exports = adminRouter;
