const express = require('express');
const userRouter = express.Router();

/* GET users listing. */
// userRouter.get('/', function(req, res, next) {
//   res.redirect('/login')
// });

userRouter.get('/login',(req,res)=>{
  res.render('users/login',{layout:'noLayout'});
})

userRouter.get("/signup",(req,res)=>{
  res.render('users/signup',{layout:'noLayout'});
})
userRouter.get("/",(req,res)=>{
  res.render('users/homepage',{user:true});
})
userRouter.get('/edit-profile',(req,res)=>{
  res.render('users/edit-profile',{user:true})
})
userRouter.get('/account',(req,res)=>{
  res.render('users/account',{user:true})
})
userRouter.get('/profile',(req,res)=>{
  res.render('users/profile',{user:true})
})
userRouter.get('/shop',(req,res)=>{
  res.render('users/storelist',{user:true})
})
userRouter.get('/cart',(req,res)=>{
  res.render('users/cart',{user:true})
})
userRouter.get('/product',(req,res)=>{
  res.render('users/product-details',{user:true})
})
module.exports = userRouter;
