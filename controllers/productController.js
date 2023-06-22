const Product = require("../models/product");

exports.getProductsByCategory = (req, res, next) => {
  const categoryId = req.params.categoryId;
  Product.find({ category: categoryId })
    .populate("category")
    .lean()
    .then((products) => {
      return res.json({ products });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch products." });
    });
};
