const Product = require("../models/product");

exports.getProductsByFilter = (req, res, next) => {
  const category = req.body.category;
  const price = req.body.price;
  const sort = req.body.sort;
  const page= +req.body.page || 1;
  const perPage=10;//Number of products per page
  console.log(category+'hiiiii',price,sort,page)

  //Prepare the filter options based on category and price
  const filterOptions={};
  if(category!="all"){
    filterOptions["category.name"]=category;
  }
  if(price){
    filterOptions.price={$gte:parseInt(price)};
    console.log(filterOptions);
  }

  //Prepare the sort option based on sort parameter
  const sortOption={};
  switch(sort){
    case 'asc':
      sortOption.price=1;
      break;
    case 'desc':
      sortOption.price=-1;
      break;
    default:
      //If needed handle it properly
      break;
  }
  const  aggregationStages=[
    {
      $lookup:{
        from:'categories',
        localField:'category',
        foreignField:'_id',
        as:'category'
      }
    },
    {
      $match:filterOptions,
        // 'category.name':category 
    },
  ]
  if(sortOption.price||(price && !category)){
    aggregationStages.push({
      $sort:sortOption,
    });
  }
  aggregationStages.push(
    {
      $skip:(page-1)*perPage,
    },
    {
      $limit:perPage,
    }
  );
  Product.aggregate(aggregationStages)
  .then((products)=>{
     // Calculate the total number of filtered products
    const totalProducts=products.length;
     // Perform pagination on the filtered products
     const paginatedProducts=products.slice((page-1)*perPage,page*perPage);
    return res.json({
      prods:products,
      totalProducts,
      filterProducts:paginatedProducts,
    });
  })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch products." });
    });
};
