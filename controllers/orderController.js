const Order = require("../models/order");
const Category = require("../models/category");
const Product = require("../models/product");
const User = require('../models/user');

exports.getCheckoutSuccess = (req, res, next) => {
  const paymentMethod=req.body.paymentMethod;
  const totalPrice=req.body.totalPrice;
  const address=req.body.address;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
        paymentMethod:paymentMethod,
        totalPrice:totalPrice,
        address:address
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req,res,next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      console.log(addressId)
      const order = new Order({
        user: {
          name:req.user.name,
          email: req.user.email,
          userId: req.user,
        },
        shippingAddress:addressId,
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .lean()
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        user: true,
        orders: orders,
        hasOrders: orders.length > 0,
        title:'Orders',
        path:'/orders'
      });
    })
    .catch((err) => console.log(err));
};


exports.getAllOrders=async()=>{
  try {
    console.log('hello');
    const orders = await Order.find()
    .populate({
      path: 'products.product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    })
    .populate('user.userId')
    .lean();
      orders.forEach((order) => {
      order.products.forEach((product) => {
        product.totalPrice = product.product.price * product.quantity;
      });
    });
    return orders;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

exports.getOrder =(orderId) => {
  return new Promise((resolve,reject)=>{
    Order.findById(orderId)
    .populate('user.userId')
    .populate('shippingAddress')
    .lean()
    .then((order) => {
      console.log(order);
      resolve(order);
    })
    .catch((err) => {
      console.log(err.message);
      reject(err)
    });
  });
};

exports.createOrder=(user,cartItems,addressId,paymentMethodId,totalPrice)=>{
  return new Promise((resolve,reject)=>{
      // console.log(user);
      console.log(cartItems);
      const productPromises =cartItems.map(async (item) => {
        const product = await Product.findById(item.productId)
          .exec();
        return { quantity: item.quantity, product };
      });
      console.log(productPromises);
      Promise.all(productPromises)
      .then((products)=>{
        const order = new Order({
          user: {
            name:user.name,
            email: user.email,
            userId:user._id,
          },
          status:'pending',
          subTotal:user.cart.totalPrice,
          total:totalPrice,
          shippingAddress:addressId,
          products:products,
          paymentmethod:paymentMethodId
        });
     order.save()
    .then((savedOrder)=>{
      resolve(savedOrder);
    })
    .catch((error)=>{
      console.log(error);
      reject(error);
    });
  }).catch((error)=>{
    console.log(error);
    reject(error);
  });
  });
};


exports.updateStatus=async(orderId,status,res)=>{
  try{
    console.log(status,orderId);
    const order=await Order.findByIdAndUpdate(orderId,{$set:{status:status}},{new:true});
    if(!order){
      return res.status(404).json({success:false,message:'Order not found'});
    }
    return order;
  }
  catch(error){
    console.log('Error updating order status',error);
    // res.status(500).json({success:false,message:'Error updating order status'})
  }
};