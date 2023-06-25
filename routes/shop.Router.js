const express = require('express');
const shopRouter = express.Router();
//middleware to protect the routes
const isAuth=require('../middleware/is-auth');
//controllers used for shoproutes
const shopController=require('../controllers/shopController');
const productController=require('../controllers/productController');
const orderController=require('../controllers/orderController');



//userRouter to handle products and homepage 
shopRouter.get('/',shopController.getIndex);
shopRouter.get('/shop',shopController.getProducts);
shopRouter.get('/products/:productId',shopController.getProduct);

//UserRouter to handle the cart and orders

shopRouter.get('/cart',isAuth.isauth,shopController.getCart);
shopRouter.post('/cart',isAuth.isauth,shopController.postCart);
shopRouter.post('/cart-delete-item',isAuth.isauth,shopController.postCartDeleteProduct);
shopRouter.patch('/cart',isAuth.isauth,shopController.updateQuantity);
shopRouter.get('/filterview/:categoryId',productController.getProductsByCategory);
//router used for checkout 
shopRouter.get('/checkout',isAuth.isauth,shopController.getCheckout);
shopRouter.get('/checkout/success',orderController.getCheckoutSuccess);
shopRouter.get('/checkout/cancel',shopController.getCheckout);
//orders router
// shopRouter.post('/create-order',isAuth.isauth,orderController.postOrder);
shopRouter.get('/orders',isAuth.isauth,orderController.getOrders);
shopRouter.get('/orderDetails/:orderId',shopController.getOrder);
shopRouter.get('/edit-profile',(req,res)=>{
  res.render('shop/edit-profile',{user:true})
})
shopRouter.get('/account',(req,res)=>{
  res.render('shop/account',{user:true})
})
shopRouter.get('/profile',(req,res)=>{
  res.render('shop/profile',{user:true})
})
shopRouter.get('/checkout',(req,res)=>{
  res.render('shop/checkout',{user:true})
})
shopRouter.get('/wishlist',(req,res)=>{
  res.render('shop/wishlist',{user:true})
})

module.exports = shopRouter;
