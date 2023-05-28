const express = require('express');
const  adminRouter = express.Router();

/* GET home page. */
adminRouter.get('/', function(req, res, next) {
  res.render('admin/index', { title: 'Plantso||Admin-Dashboard',layout:'main' });
});
adminRouter.get('/users', function(req, res, next) {
  res.render('admin/list-users', { title: 'Admin-Users',layout:'main' });
});
adminRouter.get('/products', function(req, res, next) {
  res.render('admin/list-products', { title: 'Admin-Products',layout:'main' });
});
adminRouter.get('/orders', function(req, res, next) {
  res.render('admin/list-orders', { title: 'Admin-Orders',layout:'main' });
});
adminRouter.get('/newProduct', function(req, res, next) {
  res.render('admin/edit-product', { title: 'Admin-Orders',layout:'main' });
});
adminRouter.get('/category', function(req, res, next) {
  res.render('admin/category', { title: 'Admin-Orders',layout:'main'});
});


module.exports = adminRouter;
