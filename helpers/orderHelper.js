const Order = require("../models/order");

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
                $match: { status: "Completed" },
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
            status: "Completed",
        }).lean();
        console.log(deliveredOrders);
        return(deliveredOrders);
    } catch (error) {
        console.log(error);
    }
};

exports.updateStatus=async(orderId,status,res)=>{
    try{
        console.log(status,orderId);
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