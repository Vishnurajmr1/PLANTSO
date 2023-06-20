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
        isAuthenticated:req.isLoggedIn
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
      console.log(categories);
      res.render("shop/storelist", {
        prods: products,
        user: true,
        categories:categories,
      });
  } catch (error) {
    console.log(error)
  }   
};
exports.getProduct=(req,res,next)=>{
  const prodId=req.params.productId;
  console.log(prodId);
  Product.findById(prodId).populate('category').populate('userId','name').lean()
  .then(product=>{
    res.render('shop/product-detail',{
      product:product,
      user:true,
    })
  })
  .catch(err=>console.log(err));
}

// exports.getCart = (req, res, next) => {
//   req.user
//   .addToCart()
//   .then(products => {
//       console.log(products);
//       res.render('shop/cart', {
//         path: '/cart',
//         pageTitle: 'Your Cart',
//         products: products,
//         user:true
//       });
//     })
//     .catch(err => console.log(err));
// };



// exports.getCart = (req, res, next) => {
//   const productId = req.params.productId; // Assuming you're retrieving the product ID from the request parameters

//   Product.findById(productId)
//     .then(product => {
//       if (!product) {
//         // Handle the case where the product is not found
//         return res.redirect('/error-page'); // Redirect to an error page or handle it as per your requirement
//       }

//       return req.user.addToCart(product); // Pass the product object to the addToCart function
//     })
//     .then(() => {
//       return req.user.populate('cart.items.productId').execPopulate(); // Populate the cart items with product details
//     })
//     .then(user => {
//       console.log(user.cart.items);
//       res.render('shop/cart', {
//         path: '/cart',
//         pageTitle: 'Your Cart',
//         products: user.cart.items,
//         user: true
//       });
//     })
//     .catch(err => console.log(err));
// };


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
      hasProducts:products.length>0,
    })
  })
  .catch(err=>{
    console.log(err);
  })
}
// exports.postCart = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findById(prodId)
//     .then(product => {     
//       return req.user.addToCart(product);
//     })
//     .then((result) => {
//         console.log(result);
//         return res.json({success:true,message:'product added to cart sucessfully'});
//     }).catch((err)=>{
//         console.log(err);
//         return res.json({success:false,message:'oops!something wrong.product not added'});
//     })
// };



//post cart sample

exports.postCart=async (req,res,next)=>{
  try{
  const prodId=req.body.productId;
  const product=await Product.findById(prodId);

  if(!product){
    return res.status(400).json({success:false,message:'Product Not Found!'});
  }
      // Retrieve productStock and productQuantity values
     const result=await req.user.addToCart(product);
     console.log(result);
        return res.json({
            success:true,
            message:'Product added to cart successfully',
            // productStock,
            // productQuantity
          });
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