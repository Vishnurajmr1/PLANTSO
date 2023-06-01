const express = require('express');
const shopRouter = express.Router();
const shopController=require('../controllers/shopController');

/* GET users listing. */


//userRouter to handle signup and login
shopRouter.get('/login',shopController.getLoginPage);
shopRouter.get('/signup',shopController.getSignupPage)

//userRouter to handle products and homepage 
shopRouter.get('/',shopController.getIndex);
shopRouter.get('/shop',shopController.getProducts);
shopRouter.get('/edit-profile',(req,res)=>{
  res.render('shop/edit-profile',{user:true})
})
shopRouter.get('/account',(req,res)=>{
  res.render('shop/account',{user:true})
})
shopRouter.get('/profile',(req,res)=>{
  res.render('shop/profile',{user:true})
})
// shopRouter.get('/shop',(req,res)=>{
//   res.render('shop/storelist',{user:true})
// })
shopRouter.get('/cart',(req,res)=>{
  res.render('shop/cart',{user:true})
})
shopRouter.get('/product',(req,res)=>{
  res.render('shop/product-details',{user:true})
})
module.exports = shopRouter;
