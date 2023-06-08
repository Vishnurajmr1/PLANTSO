const Product = require("../models/product");

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

exports.getProduct=(req,res,next)=>{
  const prodId=req.params.productId;
  console.log(prodId);
  Product.findById(prodId).populate('category').lean()
  .then(product=>{
    res.render('shop/product-detail',{
      product:product,
      user:true,
    })
  })
  .catch(err=>console.log(err));
}