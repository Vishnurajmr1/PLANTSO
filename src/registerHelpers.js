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

const Noteq = (a,b)=> a!==b;

const StrEq = (a,b)=> a==b;

const multiply=(a, b)=>{
  return a * b;
}
module.exports={
  Noteq,
  eq,
  StrEq,
  multiply,
  formatDate:formatDate,
  getUserProductsLength:getUserProductsLength,
}