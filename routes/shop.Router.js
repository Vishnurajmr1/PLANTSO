const express = require('express');
const shopRouter = express.Router();
const shopController=require('../controllers/shopController');
const productController=require('../controllers/productController');
const orderController=require('../controllers/orderController');

/* GET users listing. */

// shopRouter.use(async(req,res,next)=>{
//   const user=await req.user
//   .populate('cart.items.productId');
//   res.locals.user = user;
//   next()
// })

//userRouter to handle signup and login
shopRouter.get('/login',shopController.getLoginPage);
shopRouter.get('/signup',shopController.getSignupPage)

//userRouter to handle products and homepage 
shopRouter.get('/',shopController.getIndex);
shopRouter.get('/shop',shopController.getProducts);
shopRouter.get('/products/:productId',shopController.getProduct);

//UserRouter to handle the cart and orders

shopRouter.get('/cart',shopController.getCart);
shopRouter.post('/cart',shopController.postCart);
shopRouter.post('/cart-delete-item',shopController.postCartDeleteProduct);
shopRouter.patch('/cart',shopController.updateQuantity);
shopRouter.get('/filterview/:categoryId',productController.getProductsByCategory);
shopRouter.post('/create-order',orderController.postOrder);
shopRouter.get('/orders',orderController.getOrders);
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

shopRouter.get('/orders',(req,res)=>{
  res.render('shop/orders',{user:true})
})
shopRouter.get('/myorders',(req,res)=>{
  res.render('shop/order-details',{user:true})
})
shopRouter.get('/wishlist',(req,res)=>{
  res.render('shop/wishlist',{user:true})
})

module.exports = shopRouter;
