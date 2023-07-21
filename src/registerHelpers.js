const Order=require("../models/order");


const formatDate=function (date) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
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
        const count=await Order.countDocuments({"user.userId":userId});
        return count;
    }catch(error){
        console.log(error);
        return 0;
    }
};
const getUserCancelledProductsLength=async(userId)=>{
    try{
        const count=await Order.countDocuments({
            "user.userId":userId,
            status:"cancelled"
        });
        return count;
    }catch(error){
        console.log(error);
        return 0;
    }
};

const eq=(a,b)=>a===b;

const gt=(a,b)=>a>b;
const Noteq = (a,b)=> a!==b;

const StrEq = (a,b)=> a==b;

const multiply=(a,b)=>{
    return a * b;
};
const and =(a,b)=>a&&b;
const increment=(index)=>{
    return index+1;
};
const subtract=(a,b)=>{
    return a-b;
};
const or=function(...args){
    for(let i=0;i<args.length-1;i++){
        if(args[i]){
            return true;
        }
    }
    return false;
}

const date=function(dateString) {
   return dateString?new Date(dateString):new Date();
};
const calculateReturnDays=function(returnDate) {
    const currentDate=new Date();
    const returnDateObj=new Date(returnDate);
    const differenceInTime = returnDateObj - currentDate;
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
};

const lookUp=function (obj,property){
    return obj[property];
}

const incrementIndex=function(coupons,index){
    let count=0;
    console.log(index);
    for(let i=0;i<=index;i++){
        if(compareDateHelper(coupons[i].validUntil,">",new Date())){
            count++;
        }
    }
    return count;
};
const incrementIndexOfExp=function(coupons,index){
    let count=0;
    for(let i=0;i<=index;i++){
        if(compareDateHelper(coupons[i].validUntil,"<",new Date())){
            count++;
        }
    }
    return count;
};

const getExpiredCouponLength = function(coupons, currentDate) {
    const currentDateTime = new Date(currentDate).getTime();
    const expiredCoupons = coupons.filter(coupon => new Date(coupon.validUntil).getTime() < currentDateTime);
    return expiredCoupons.length;
};
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
const cancelledProducts = async (req, res, next) => {
    try {
        if (req.user) {
            const userId = req.user._id;
            const userCancelledProductsLength = await getUserCancelledProductsLength(userId);
            res.locals.cancelledProductsLength = userCancelledProductsLength;
        } else {
            res.locals.cancelledProductsLength = 0;
        }
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};

function replaceSpacesWithHyphens(str) {
    return str.replace(/\s+/g, "-");
}

const compareDateHelper = function(date1, operator, date2) {
    // Convert date strings to Date objects
    const d1 = new Date(date1).toISOString().split("T")[0];
    const d2 = new Date(date2).toISOString().split("T")[0];
    // Compare the dates using the specified operator
    switch (operator) {
    case "<":
        return d1 < d2 ? true : false;
    case ">":
        return d1 > d2 ? true : false;
    case "=":
        return d1 === d2 ? true : false;
    default:
        return false;
    }
};


module.exports={
    Noteq,
    eq,
    or,
    gt,
    and,
    increment,
    incrementIndex,
    incrementIndexOfExp,
    getExpiredCouponLength,
    StrEq,
    lookUp,
    subtract,
    compareDateHelper,
    date,
    calculateReturnDays,
    multiply,
    calculateTotalProduct,
    replaceSpacesWithHyphens,
    formatDate:formatDate,
    addUserProductsLengthToContext,
    cancelledProducts,
    getUserProductsLength:getUserProductsLength,
};