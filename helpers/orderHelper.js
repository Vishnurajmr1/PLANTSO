const Order=require('../models/order');


exports.getAllDeliveredOrders=async()=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const currentDate=new Date();
            const currentMonthStart=new Date(currentDate.getFullYear(),currentDate.getMonth(),1);
            const orderDetails=await Order.aggregate([
                {
                    $match:{status:'Completed'}
                },
                {
                    $lookup:{
                        from:'users',
                        localField:'user.userId',
                        foreignField:'_id',
                        as:'userDetails',
                    },
                },
                {
                    $match:{
                        dateCreated:{$gte:currentMonthStart}
                    }
                }
            ]);
            resolve(orderDetails);
        }
        catch(error){
            reject(error);
        }
    })
}
exports.getAllDeliveredOrdersByDate=(startDate,endDate)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const deliveredOrders=await Order.find({dateCreated:{$gte:startDate,$lte:endDate},status:'Completed'}).lean();
            console.log(deliveredOrders);
            resolve(deliveredOrders);
        }
        catch(error){
            reject(error);
        }
    })
    
}