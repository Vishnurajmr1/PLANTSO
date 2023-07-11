const Product = require("../models/product");

exports.getProductsByFilter = (req, res, next) => {
  const category = req.body.category;
  const price = req.body.price;
  const sort = req.body.sort;
  const page= +req.query.page || 1;
  console.log(category,price,sort,page)

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
    return res.json({prods:products});
  })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch products." });
    });
};
