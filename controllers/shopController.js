const Category = require("../models/category");
const Product = require("../models/product");
const User = require('../models/user');

exports.getLoginPage = (req, res, next) => {
  res.render("shop/login", { layout: "noLayout" });
};
exports.getSignupPage = (req, res, next) => {
  res.render("shop/signup", { layout: "noLayout" });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .populate("category")
    .lean()
    .then((products) => {
      const Prods=products.slice(0,1);
      const Prods1=products.slice(1,2);
      const Prods2=products.slice(2,3);
      const Prods3=products.slice(3,4);

      res.render("shop/homepage", {
        prods:Prods,
        prods1:Prods1,
        prods2:Prods2,
        prods3:Prods3,
        allProds: products,
        user: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });
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
      product:item.productId.title,
      quantity:item.quantity,
      price:item.productId.price,
      category:item.productId.category
    }));
    res.render('shop/cart',{
      products:products,
      user:true
    })
  })
  .catch(err=>{
    console.log(err);
  })
}
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {     
      return req.user.addToCart(product);
    })
    .then((result) => {
        console.log(result);
        return res.json({success:true,message:'product added to cart sucessfully'});
    }).catch((err)=>{
        console.log(err);
        return res.json({success:false,message:'oops!something wrong.product not added'});
    })
};