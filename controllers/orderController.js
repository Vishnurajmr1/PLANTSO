const Order = require("../models/order");
const Category = require("../models/category");
const Product = require("../models/product");
const User = require('../models/user');

exports.getCheckoutSuccess = (req, res, next) => {
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

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          username:req.user.name,
          email: req.user.email,
          userId: req.user,
        },
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

exports.getAllOrders =() => {
  return new Promise((resolve,reject)=>{
    Order.find()
    .populate({
      path:'products.product',
      populate:{
        path:'category',
        model:'Category',
      },
    })
    .populate('user.userId')
    .lean()
    .then((orders) => {
      orders.forEach((order)=>{
        order.products.forEach((product)=>{
          product.totalPrice=product.product.price*product.quantity;
        })
      })
      console.log(orders);
      resolve(orders);
    })
    .catch((err) => {
      console.log(err.message);
      reject(err)
    });
  });
};

exports.getOrder =(orderId) => {
  return new Promise((resolve,reject)=>{
    Order.findById(orderId)
    .populate('user.userId')
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


// exports.getAllOrders =(req,res,next) => {
//     Order.find()
//     .lean()
//     .then((orders) => {
//       res.render("admin/list-orders", {
//         pageTitle: "Plantso||Admin-OrderList",
//         layout: "main",
//         // orders: orders, //Pass the orders to the view
//         title: "orders",
//       });
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };

