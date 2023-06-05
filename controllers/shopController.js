const Product = require("../models/product");

exports.getLoginPage = (req, res, next) => {
  res.render("shop/login", { layout: "noLayout" });
};
exports.getSignupPage = (req, res, next) => {
  res.render("shop/signup", { layout: "noLayout" });
};
exports.getProducts = (req, res, next) => {
  Product.find()
    .populate("category")
    .lean()
    .then((products) => {
      console.log(products);
      res.render("shop/storelist", {
        prods: products,
        user: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};


exports.getIndex = (req, res, next) => {
  Product.find()
    .populate("category")
    .lean()
    .then((products) => {
      console.log(products);
      res.render("shop/homepage", {
        prods: products,
        user: true,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
