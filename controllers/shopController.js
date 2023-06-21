const Category = require("../models/category");
const Product = require("../models/product");
const User = require('../models/user');

// exports.getLoginPage = (req, res, next) => {
//   res.render("shop/login", { layout: "noLayout" });
// };
// exports.getSignupPage = (req, res, next) => {
//   res.render("shop/phoneotp", { layout: "noLayout" });
// };

exports.getIndex = (req, res, next) => {
  Product.find()
    .sort({_id:1})
    .populate("category")
    .lean()
    .then((products) => {
      const Prods=products.slice(0,1);
      const Prods1=products.slice(1,2);
      const Prods2=products.slice(2,3);
      const Prods3=products.slice(3,4);
      const reverseProducts=products.slice().reverse();
    Category.find({isDeleted:false})
    .limit(4)
    .lean()
    .then((categories)=>{
      res.render("shop/homepage", {
        prods:Prods,
        prods1:Prods1,
        prods2:Prods2,
        prods3:Prods3,
        allProds: products,
        reverseProds:reverseProducts,
        categories:categories,
        user: true,
        isAuthenticated: req.session.isLoggedIn,
        username:req.session.user,
      // totalProduct:req.user.cart.items.length,
      });
    })
    .catch((err) => {
      console.log(err);
    });

  })
  .catch((err)=>{
    console.log(err);
  })
};

exports.getProducts = async (req, res, next) => {
  try {
    const products =  await Product.find()
    .populate("category")
    .populate('userId','name')
    .lean()
    const categories =  await Category.find({isDeleted:false}).lean()
      res.render("shop/storelist", {
        prods: products,
        user:true,
        categories:categories,
        isAuthenticated: req.session.isLoggedIn,
        username:req.session.user
      });
  } catch (error) {
    console.log(error)
  }   
};
exports.getProduct=(req,res,next)=>{
  const prodId=req.params.productId;
  const getProductPromise=
  Product.findById(prodId)
  .populate('category')
  .populate('userId','name')
  .lean()
  //Fetch all products except the one with the specified productId
  const getOtherProductsPromise=Product.find({_id:{$ne:prodId}})
  .populate('category')
  .limit(10)
  .lean();
  Promise.all([getProductPromise,getOtherProductsPromise])
  .then(([product,otherProducts])=>{
    res.render('shop/product-detail',{
      product:product,
      otherProducts:otherProducts,
      user:true,
      isAuthenticated: req.session.isLoggedIn,
      username:req.session.user,
      // totalProduct:totalProduct,
    })
  })
  .catch(err=>console.log(err));
}

exports.getCart=(req,res,next)=>{
  req.user
  .populate('cart.items.productId')
  .then(user=>{
    // console.log(user.cart.items);
    const products=user.cart.items.map(item=>({
      productId:item.productId._id,
      product:item.productId.title,
      quantity:item.quantity,
      updatedPrice:item.price.toFixed(2),
      price:item.productId.price.toFixed(2),
      category:item.productId.category,
      stock:item.productId.stock,
      imageUrl:item.productId.imageUrl,
    }));
    res.render('shop/cart',{
      products:products,
      user:true,
      hasProducts:req.user.cart.items.length>0,
      isAuthenticated: req.session.isLoggedIn,
      username:req.session.user,
      // totalProduct:req.user.cart.items.length,
    })
  })
  .catch(err=>{
    console.log(err);
  })
}

//post cart sample

exports.postCart=async (req,res,next)=>{
  try{
  const prodId=req.body.productId;
  const product=await Product.findById(prodId);

  if(!product){
    return res.status(400).json({success:false,message:'Product Not Found!'});
  }
  
  if(req.user){
    const result=await req.user.addToCart(product);
    console.log(result);
    return res.json({
        success:true,
        message:'Product added to cart successfully',
        // productStock,
        // productQuantity
      });
  }else{
    return res.json({
      success:false,
       message:'Oops!Something went wrong.Product not added to cart'
    })
  }
      // Retrieve productStock and productQuantity values 
      }   
      catch(err){
        console.log(err);
          // Handle the specific error when quantity exceeds stock
          if(err.message==='Cannot add more quantity than available in stock.'){
            return res.json({
            success:false,
            message:'Currently,the Stock is not available'
            });
          }
          return res.json({
            success:false,
            message:'Oops!Something went wrong.Product not added to cart'
          });   
  };
};
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
    .then((result) => {
        console.log(result);
        return res.json({success:true,message:'product deleted from  cart sucessfully'});
    }).catch((err)=>{
        console.log(err);
        return res.json({success:false,message:'oops!something wrong.product not deleted from cart'});
    })
};

exports.updateQuantity=async (req,res,next)=>{
  try{
    const {productId,quantity}=req.body;

    console.log(productId)
    console.log(quantity)

    const cartItem=req.user.cart.items.find(item=>item.productId.toString()===productId.toString());

    const product=await Product.findById(productId);

    if(!product){
      return res.status(400).json({success:false,message:'Product Not Found!'});
    }

    const currentQuantity=cartItem.quantity;

    if(currentQuantity>=1){
      cartItem.quantity=quantity;
      console.log(cartItem.quantity)
      
      // Calculate the updated price based on the quantity
      const productPrice = parseFloat(product.price);
      const updatedPrice = (productPrice * cartItem.quantity).toFixed(2);
      console.log(productPrice)
      console.log( updatedPrice)
      cartItem.price=parseFloat(updatedPrice);      


      await req.user.save();

      const cartTotal = req.user.cart.items.reduce((accumulator, item) => {
        return accumulator + item.price;
      }, 0);

      console.log( cartTotal)

      //Prepare the response Data
      const responseData={updatedPrice,cartTotal};
      return res.json(responseData);
    }else{
      throw new Error('Quantity cannot be less than 1');
    }
  }catch(error){
    console.log('There was a problem with updating the product quantity:',error);
    return res.status(500).json({error:'Internal server error'});
  }
}