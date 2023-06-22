const Order = require("../models/order");
const Category = require("../models/category");
const Product = require("../models/product");
const User = require("../models/user");

exports.postOrder = (req, res, next) => {
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

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .lean()
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        user: true,
        orders: orders,
        hasOrders: orders.length > 0,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAllOrders = (req, res, next) => {
  Order.find()
    .lean()
    .then((orders) => {
      console.log(orders);
      console.log("hiii");
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching orders" });
    });
};
