const express = require('express');
const shopRouter = express.Router();
const shopController=require('../controllers/shopController');

/* GET users listing. */

shopRouter.use(async(req,res,next)=>{
  const user=await req.user
  .populate('cart.items.productId');
  res.locals.user = user;
  next()
})

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
shopRouter.get('/edit-profile',(req,res)=>{
  res.render('shop/edit-profile',{user:true})
})
shopRouter.get('/account',(req,res)=>{
  res.render('shop/account',{user:true})
})
shopRouter.get('/profile',(req,res)=>{
  res.render('shop/profile',{user:true})
})

shopRouter.get('/cart',(req,res)=>{
  res.render('shop/cart',{})
})

module.exports = shopRouter;
