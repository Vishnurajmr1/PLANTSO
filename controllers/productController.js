const Product = require("../models/product");

exports.getProductsByCategory = (req, res, next) => {
  const {category} = req.body;

  Product.aggregate([
    {
      $lookup:{
        from:'categories',
        localField:'category',
        foreignField:'_id',
        as:'category'
      }
    },
    {
      $match:{
        'category.name':category
      }
    }
  ])
  .then((products)=>{
    console.log(products);
    return res.json({prods:products});
  })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch products." });
    });
};
