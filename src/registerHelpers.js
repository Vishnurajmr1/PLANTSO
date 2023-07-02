const Order=require('../models/order');
const mongoose=require('mongoose');


const formatDate=function (date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};
// const getUserProductsLength=async(userId)=>{
//   return new Promise(async(resolve,reject)=>{
//     try{
//       console.log(userId+'🚀🚀🚀')
//       // const objectId = new mongoose.Types.ObjectId(userId);
//       const order= await Order.findOne({'user.userId':userId}).lean();
//       if(order){
//         console.log(order.length);
//         resolve(order.length);
//       }else{
//         resolve(0);
//       }
//     }
//     catch(error){
//       console.log(error);
//       reject (error);
//     }
//   });
// };

const getUserProductsLength=async(userId)=>{
  try{
    const count=await Order.countDocuments({'user.userId':userId});
    return count;
  }catch(error){
    console.log(error);
    return 0;
  }
}

const eq=(a,b)=>a===b;

const multiply=(a, b)=>{
  return a * b;
}

const calculateTotalProduct = (req, res, next) => {
  if (req.user && req.user.cart && req.user.cart.items) {
    res.locals.totalProduct = req.user.cart.items.length;
  } else {
    res.locals.totalProduct = 0;
  }
  next();
};

const addUserProductsLengthToContext = async (req, res, next) => {
  try {
    if (req.user) {
      const userId = req.user._id;
      const userProductsLength = await getUserProductsLength(
        userId
      );
      res.locals.userProductsLength = userProductsLength;
    } else {
      res.locals.userProductsLength = 0;
    }
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
  };

  function replaceSpacesWithHyphens(str) {
    return str.replace(/\s+/g, '-');
  }
module.exports={
  eq,
  multiply,
  calculateTotalProduct,
  replaceSpacesWithHyphens,
  formatDate:formatDate,
  addUserProductsLengthToContext,
  getUserProductsLength:getUserProductsLength,
}