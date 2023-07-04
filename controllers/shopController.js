
require('dotenv').config()
const Category = require("../models/category");
const Product = require("../models/product");
const User = require("../models/user");
const Address=require('../models/address');
const userHelper=require('../helpers/userhelpers');
const orderController=require('../controllers/orderController');
const countryStatePicker=require('country-state-picker');
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);

const ITEMS_PER_PAGE=6;


exports.getIndex = (req, res, next) => {
  Product.find()
    .sort({ _id: 1 })
    .populate("category")
    .lean()
    .then((products) => {
      const Prods = products.slice(0, 1);
      const Prods1 = products.slice(1, 2);
      const Prods2 = products.slice(2, 3);
      const Prods3 = products.slice(3, 4);
      const reverseProducts = products.slice().reverse();
      Category.find({ isDeleted: false })
        .limit(4)
        .lean()
        .then((categories) => {
          console.log(products)
          res.render("shop/homepage", {
            prods: Prods,
            prods1: Prods1,
            prods2: Prods2,
            prods3: Prods3,
            allProds: products,
            reverseProds: reverseProducts,
            categories: categories,
            user: true,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = async (req, res, next) => {
  try {
    const page= +req.query.page || 1;
    let totalItems;
    const products = await Product
    .find()
    .countDocuments()
    .then(numProducts=>{
      totalItems=numProducts;
      return Product.find()
      .skip((page-1)*ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("category")
      .populate("userId", "name")
      .lean();
    })
    const categories = await Category.find({ isDeleted: false }).lean();
    res.render("shop/storelist", {
      prods: products,
      user: true,
      categories: categories,
      currentPage:page,
      hasNextPage:ITEMS_PER_PAGE*page<totalItems,
      hasPreviousPage:page > 1,
      nextPage:page + 1,
      previousPage:page-1,
      lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)
    });
  } catch (error) {
    console.log(error);
  }
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const getProductPromise = Product.findById(prodId)
    .populate("category")
    .populate("userId", "name")
    .lean();
  //Fetch all products except the one with the specified productId
  const getOtherProductsPromise = Product.find({ _id: { $ne: prodId } })
    .populate("category")
    .limit(10)
    .lean();
  Promise.all([getProductPromise, getOtherProductsPromise])
    .then(([product, otherProducts]) => {
      res.render("shop/product-detail", {
        product: product,
        otherProducts: otherProducts,
        user: true,
        // totalProduct:totalProduct,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      // console.log(user.cart.items);
      const products = user.cart.items.map((item) => ({
        productId: item.productId._id,
        product: item.productId.title,
        quantity: item.quantity,
        updatedPrice: item.price.toFixed(2),
        price: item.productId.price.toFixed(2),
        category: item.productId.category,
        stock: item.productId.stock,
        imageUrl: item.productId.imageUrl,
      }));
      const totalPrice=user.cart.totalPrice.toFixed(2);
      res.render("shop/cart", {
        products: products,
        user: true,
        hasProducts: req.user.cart.items.length > 0,
        totalPrice:totalPrice,
        // totalProduct:req.user.cart.items.length,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//post cart sample

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    console.log(prodId, product);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product Not Found!" });
    }
    if (req.user) {
      if(req.user.is_Admin){
        //User is an Admin
        return res.json({
          success:false,
          message:"Admin users cannot make purchases."
        })
      }
      const result = await req.user.addToCart(product);
      console.log(result);
      return res.json({
        success: true,
        message: "Product added to cart successfully",
        // productStock,
        // productQuantity
      });
    } else {
      return res.json({
        success: false,
        message: "Oops!Something went wrong.Product not added to cart",
      });
    }
    // Retrieve productStock and productQuantity values
  } catch (err) {
    console.log(err);
    // Handle the specific error when quantity exceeds stock
    if (err.message === "Cannot add more quantity than available in stock.") {
      return res.json({
        success: false,
        message: "Currently,the Stock is not available",
      });
    }
    return res.json({
      success: false,
      message: "Oops!Something went wrong.Product not added to cart",
    });
  }
};
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      console.log(result);
      return res.json({
        success: true,
        message: "product deleted from  cart sucessfully",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.json({
        success: false,
        message: "oops!something wrong.product not deleted from cart",
      });
    });
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    console.log(productId);
    console.log(quantity);

    const cartItem = req.user.cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product Not Found!" });
    }

    const currentQuantity = cartItem.quantity;

    if (currentQuantity >= 1) {
      cartItem.quantity = quantity;
      console.log(cartItem.quantity);

      // Calculate the updated price based on the quantity
      const productPrice = parseFloat(product.price);
      const updatedPrice = (productPrice * cartItem.quantity).toFixed(2);
      console.log(productPrice);
      console.log(updatedPrice);
      cartItem.price = parseFloat(updatedPrice);

      // const cartTotal = req.user.cart.items.reduce((accumulator, item) => {
      //   return accumulator + item.price;
      // }, 0);
      req.user.cart.totalPrice=req.user.cart.items.reduce((accumulator,item)=>
        accumulator+item.price,0
      ).toFixed(2);

      // cartItem.totalPrice=totalPrice;
      await req.user.save();
      //Prepare the response Data
      const responseData = { 
        updatedPrice:updatedPrice,
        cartTotal:req.user.cart.totalPrice.toFixed(2)
      };
      return res.json(responseData);
    } else {
      throw new Error("Quantity cannot be less than 1");
    }
  } catch (error) {
    console.log(
      "There was a problem with updating the product quantity:",
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

//checkout controller


// exports.getCheckout=(req,res,next)=>{
//   req.user
//   .populate("cart.items.productId")
//   .then((user) => {
//     const products = user.cart.items.map((item) => ({
//       productId: item.productId._id,
//       product: item.productId.title,
//       quantity: item.quantity,
//       updatedPrice: item.price.toFixed(2),
//       price: item.productId.price.toFixed(2),
//       category: item.productId.category,
//       stock: item.productId.stock,
//       imageUrl: item.productId.imageUrl,
//     }));
//     res.render("shop/checkout", {
//       products: products,
//       user: true,
//       hasProducts: req.user.cart.items.length > 0,
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// }


//sample checkout working 
// exports.getCheckout = async (req, res, next) => {
//   req.user
//   .populate("cart.items.productId")
//   .then((user) => {
//     // console.log(user.cart.items);
//     const products = user.cart.items.map((item) => ({
//       productId: item.productId._id,
//       product: item.productId.title,
//       quantity: item.quantity,
//       updatedPrice: item.price.toFixed(2),
//       price: item.productId.price.toFixed(2),
//       category: item.productId.category,
//       stock: item.productId.stock,
//       imageUrl: item.productId.imageUrl,
//     }));
//     const price=products.price;
//     res.render("shop/checkout", {
//       products: products,
//       user: true,
//       hasProducts: req.user.cart.items.length > 0,

//       // totalProduct:req.user.cart.items.length,
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// };




exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((item) => {
      const quantity = item.quantity;
      const price = item.productId.price;
      const subtotal = quantity * price;
      return {
        productId: item.productId._id,
        product: item.productId.title,
        quantity: quantity,
        updatedPrice: item.price.toFixed(2),
        price: price.toFixed(2),
        category: item.productId.category,
        stock: item.productId.stock,
        imageUrl: item.productId.imageUrl,
        subtotal: subtotal.toFixed(2), // Add subtotal to the product object
      };
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products.map((item) => ({
        price_data: {
          currency: "INR",
          product_data: {
            name: item.product,
          },
          unit_amount: parseFloat(item.price) * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url:req.protocol+'://'+req.get('host')+'/checkout/success', // Replace with your success URL
      cancel_url:req.protocol+'://'+req.get('host')+'/checkout/cancel', // Replace with your cancel URL
    });
    const total = products.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
    let countries=countryStatePicker.getCountries();
    res.render("shop/checkout", {
      products: products,
      user: true,
      hasProducts: products.length > 0,
      totalSum: total,
      sessionId:session.id,
      country:countries,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred while fetching user cart.");
  }
};


exports.getOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  console.log(orderId);
  orderController.getOrder(orderId)
  .then(order=>{
    res.render('shop/order-details',{
    user: true,
    order:order,
    title:'orderDetail',
    path:'/orders'
    })
  }).catch(error=>{
    console.log(error);
    res.status(500).json({error:"An error occurred while fetching order details"});
  })
};
exports.getAccount=(req,res,next)=>{
  res.render('shop/account',
  {user:true,
    path:'/address',
    title:'Address',
  });
}

exports.getAddAccount=(req,res,next)=>{
  let countries=countryStatePicker.getCountries();
  // console.log(countries)
  res.render('shop/add-address',{
    user:true,
    country:countries,
    path:'/add-address',
    title:'AddAddress',
  });
}

exports.getStateList=(req,res,next)=>{
  const countryCode=req.params.code;
  console.log(countryCode);
  const states=countryStatePicker.getStates(countryCode);
  console.log(states);
  return res.json(states);
}

exports.getAddress=(req,res,next)=>{
  const userId=req.user._id;
  const successMessage=req.flash('success');
  userHelper.getAddress(userId)
  .then((address)=>{
    const formattedAddress=address.map((address)=>({
      ...address,
      countryName:countryStatePicker.getCountry(address.country),
    }));
    res.status(200).render('shop/addressBook',{
      user:true,
      Address:formattedAddress,
      hasAddress:address.length>0,
      path:'/addresses',
      success:successMessage,
      title:'Address',
    });
  })
  .catch((error)=>{
    res.status(500).json({error:"Error retrieving addresses"});
  })
}

exports.postAddress=(req,res,next)=>{
 const addressData=req.body;
  const userId=req.user._id;
  console.log(req.body);
  userHelper.saveAddress(addressData,userId)
  .then(saveAddress=>{
    console.log(saveAddress);
    req.flash('success','New Address Added successfully');
    res.status(200).redirect('/addresses');
  })
  .catch(error=>{
    res.status(500).json({error:'Failed to save Address'});
  })
};

exports.defaultAddress=(req,res,next)=>{
  const userId=req.user._id;
  userHelper.defaultAddress(userId)
  .then(defaultAddress=>{
    return res.json(defaultAddress);
  })
  .catch(error=>{
    if (error === 'No default address found') {
      return res.status(404).json({ error: 'No default address found. Please set a default address.' });
    } else {
      return res.status(500).json({ error: 'Failed to get Default Address'});
    }
  })
}

exports.getDefault=(req,res,next)=>{
  const userId=req.user._id;
  const successMessage=req.flash('success');
  userHelper.getAddress(userId)
  .then((address)=>{
    const formattedAddress=address.map((address)=>({
      ...address,
      countryName:countryStatePicker.getCountry(address.country),
    }));
    res.status(200).render('shop/makedefault',{
      user:true,
      Address:formattedAddress,
      hasAddress:address.length>0,
      path:'/addresses',
      success:successMessage,
      title:'Address',
    });
  })
  .catch((error)=>{
    res.status(500).json({error:"Error retrieving addresses"});
  })
}

exports.postCheckout=(req,res,next)=>{
  const {address,paymentMethodId}=req.body;
  if(paymentMethodId==='COD'){
    const user=req.user;
    const cartItems=user.cart.items;
    if(address.addressId){
      Address.findById(address.addressId)
      .then((existingAddress)=>{
        console.log(existingAddress)
        if(existingAddress){
          return orderController.createOrder(
            user,
            cartItems,
            existingAddress._id,
            paymentMethodId
            );
        }
      })
      .then((order)=>{
        return req.user.clearCart()
      })
      .then((order)=>{
        return res.json({success:true,message:"order placed successfully"})
      })
      .catch((error)=>{
        console.log('Failed to process the order',error);
      })
    }else{
      console.log(address);
    const newAddress=new Address({
      fname:address.firstName,
      lname:address.lastName,
      street_address:address.address,
      country:address.country,
      state:address.state,
      phone:address.phoneNumber,
      zipcode:address.zipCode,
      city:address.town,
      user:user._id,
    });
    console.log(newAddress);
    newAddress
    .save()
    .then((savedAddress)=>{
      return orderController.createOrder(
        user,
        cartItems,
        savedAddress._id,
        paymentMethodId,
      )
    })
    .then((order)=>{
      return req.user.clearCart()
      .then(()=>{
        return res.json({success:true,message:"order placed successfully"})
      });
    })
    .catch((error)=>{
      console.log('Failed to process the order',error);
    })
  }
}else{
  res.json({message:'Payment method handled successfully'});
}
}