const crypto = require('crypto');
const Order = require("../models/order");
const User=require('../models/user');
const {handleError}=require("../middleware/error.handler");

exports.getAllDeliveredOrders = async () => {
    try {
        const currentDate = new Date();
        const currentMonthStart = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const orderDetails = await Order.aggregate([
            {
                $match: { status: "completed" },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user.userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $match: {
                    dateCreated: { $gte: currentMonthStart },
                },
            },
        ]);
        return orderDetails;
    } catch (error) {
        console.log(error);
    }
};
exports.getAllDeliveredOrdersByDate =async (startDate, endDate) => {
    // return new Promise(async (resolve, reject) => {
    try {
        const deliveredOrders = await Order.find({
            dateCreated: { $gte: startDate, $lte: endDate },
            status: "completed",
        }).lean();
        console.log(deliveredOrders);
        return(deliveredOrders);
    } catch (error) {
        console.log(error);
    }
};

exports.updateStatus=async(orderId,status,res)=>{
    try{
        const order=await Order.findByIdAndUpdate(orderId,{$set:{status:status}},{new:true});
        if(!order){
            return res.status(404).json({success:false,message:"Order not found"});
        }
        return order;
    }
    catch(error){
        console.log("Error updating order status",error);
    // res.status(500).json({success:false,message:'Error updating order status'})
    }
};



exports.getAllOrders=async()=>{
    try {
        const orders = await Order.find()
            .populate({
                path: "products.product",
                populate: {
                    path: "category",
                    model: "Category",
                },
            })
            .populate("user.userId")
            .lean();
        orders.forEach((order) => {
            order.products.forEach((product) => {
                product.totalPrice = product.product.price * product.quantity;
            });
        });
        return orders;
    } catch (err) {
        console.log(err.message);
        throw err;
    }
};


exports.cancelOrder=async(orderId,cancelReason)=>{
    try {
        console.log(orderId,cancelReason)
        const result=await Order.updateOne(
            {_id:orderId},
            {
                $set:{
                    status:'cancelPending',
                    cancel_reason:cancelReason,
                },
            },
        );
        return result.modifiedCount===1;
    } catch (error) {
        console.log(error);
    }
    
}
exports.returnOrder=async(orderId,returnReason)=>{
try {
    const result=await Order.updateOne(
        {_id:orderId},
        {
            $set:{
                status:'returnPending',
                return_reason:returnReason,
            }
        }
        )
        return result.modifiedCount===1;
} catch (error) {
    console.log(error);
}
}

exports.changePayStatus=async(orderId,paymentMethodId,res)=>{
    try {
        const changePaymentStatus=await Order.updateOne(
            {_id:orderId},
            {
                $set:{
                    status:'processing',
                    PaymentResponse:paymentMethodId
                },
            },
        );
        if(changePaymentStatus.modifiedCount>0){
            return true;
        }else{
            return false;
        }
    } catch (error) {
        handleError(res,error)
    }
}

exports.setSuccessStatus=async function(orderId){
    try {
        const result=await Order.updateOne(
        {_id:orderId},
        {
            $set:{
                paymentStatus:'success',
            }
         }
      )
      if(result) return true;
    } catch (error) {
       throw new Error('failed to change payment status!something wrong');  
    }
}

exports.changeOrderStatus=async function(changeStatus,orderId){
    try{
        if(['shipped','delivered','cancelled','returned'].includes(changeStatus)){
            throw new Error('Invalid status');
        }
        const orderResult=await Order.findByIdAndUpdate(orderId,{
            $set:{
                status:changeStatus,
            }
        });

        if(changeStatus==='returned'){
            const orderResult=await Order.findById(orderId).select('total user.userId');
            const {total,user}=orderResult;
            const userResult=await User.findById(user).select('wallet');
            const wallet=userResult.wallet;
            const updatedWallet=wallet+total;
            await User.findByIdAndUpdate(user,{
                $set:{
                    wallet:updatedWallet,
                }
            });
        }

        if(orderResult){
            return {status:true,message:'order updated'};
        }else{
            return {status:false,message:'Something goes wrong updation failed'};
        }
    }
    catch(error){
        throw new Error('failed to change status!Something wrong')
    }
}

exports.orderStatus=async function(orderId){
    try {
        const result=await Order.findByIdAndUpdate(
            orderId,
            {
                $set:{paymentmethod:'COD',status:'processing'},
            },
            {new:true},
        );
        return true; 
    } catch (error) {
        throw new Error('Error updating order data!');
    }
}

exports.verifyPayment=async(razorData,res)=>{
    try {
        var expectedSignature=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET);
        expectedSignature.update(
            `${razorData['payment[razorpay_order_id]']} | ${razorData['payment[razorpay_payment_id]']}`,
        );
        expectedSignature=expectedSignature.digest('hex');

        if(expectedSignature===razorData['payment[razorpay_signature]']){
            return true;
        }else{
            return false;
        }
    } catch (error) {
        handleError(res,error);
    }
}
