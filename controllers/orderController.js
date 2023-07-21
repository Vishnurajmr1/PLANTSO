const Order = require("../models/order");
const Product = require("../models/product");
const orderHelper=require("../helpers/orderHelper");
const userHelper=require("../helpers/userhelpers");
const User = require("../models/user");
const { handleError } = require("../middleware/error.handler");

exports.getCheckoutSuccess = (req, res) => {
    const paymentMethod=req.body.paymentMethod;
    const totalPrice=req.body.totalPrice;
    const address=req.body.address;
    req.user
        .populate("cart.items.productId")
        .then(async (user) => {
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            //Update stock quantites for purchased products
            const updateStockPromise=products.map((productData)=>{
                const productId=productData.product_id;
                const quantityPurchased=productData.quantity;
                return Product.findByIdAndUpdate(
                    productId,
                    {$inc:{stock:-quantityPurchased}},
                    {new:true}
                );
            });
            await Promise.all(updateStockPromise);
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user,
                },
                products: products,
                paymentMethod: paymentMethod,
                totalPrice: totalPrice,
                address: address
            });
            await order.save();
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => console.log(err));
};

exports.postOrder = (req,res) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    name:req.user.name,
                    email: req.user.email,
                    userId: req.user,
                },
                // shippingAddress:addressId,
                products: products,
            });
            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => console.log(err));
};

exports.getOrders = (req, res) => {
    Order.find({ "user.userId": req.user._id })
        .lean()
        .then((orders) => {
            console.log(orders);
            res.render("shop/orders", {
                user: true,
                orders: orders,
                hasOrders: orders.length > 0,
                title:"Orders",
                path:"/orders"
            });
        })
        .catch((err) => console.log(err));
};



exports.getOrder =(orderId) => {
    return new Promise((resolve,reject)=>{
        Order.findById(orderId)
            .populate("user.userId")
            .populate("shippingAddress")
            .lean()
            .then((order) => {
                //Calculate the return date
                const returnDate=new Date(order.dateCreated);
                returnDate.setDate(returnDate.getDate()+7)
                order.returnDate=returnDate.toLocaleDateString('en-Us',{
                    year:'numeric',
                    month:'2-digit',
                    day:'2-digit'
                })
                resolve(order);
            })
            .catch((err) => {
                console.log(err.message);
                reject(err);
            });
    });
};

exports.createOrder=(user,cartItems,addressId,paymentMethodId,totalPrice,req)=>{
    return new Promise((resolve,reject)=>{
        const orderStatus=paymentMethodId==='COD'?'processing':'pending';
        const productPromises =cartItems.map(async (item) => {
            const product = await Product.findById(item.productId)
            .exec();
            return { quantity: item.quantity, product };
        });
        Promise.all(productPromises)
            .then((products)=>{
                const order = new Order({
                    user: {
                        name:user.name,
                        email: user.email,
                        userId:user._id,
                    },
                    status:orderStatus,
                    subTotal:user.cart.totalPrice,
                    total:totalPrice,
                    shippingAddress:addressId,
                    products:products,
                    paymentmethod:paymentMethodId
                });
                if(req.session.coupon){
                    let coupon=req.session.coupon;
                    const discountAmt=(coupon.discount/100)*user.cart.totalPrice;
                    order.discount=discountAmt;
                    order.total=user.cart.totalPrice-discountAmt.toFixed(2);
                }
                if(req.session.appliedWallet) {
                    let appliedWallet = req.session.appliedWallet;
                    order.total = order.total - appliedWallet;
                  }
                order.save()
                    .then((savedOrder)=>{
                        products.forEach((item)=>{
                            const productId=item.product._id;
                            const orderedQuantity=item.quantity;

                            Product.findByIdAndUpdate(productId,{$inc:{stock:-orderedQuantity}},{new:true})
                            .exec()
                            .then((updatedProduct)=>{
                              // You can handle the updated product data here if needed
                                console.log(`Stock updated for product ID: ${updatedProduct._id}`);
                               })
                                .catch((error) => {
                                   console.log(`Error updating stock for product ID: ${productId}`);
                             });
                        })
                        resolve(savedOrder);
                    })
                    .catch((error)=>{
                        console.log(error);
                        reject(error);
                    });
            }).catch((error)=>{
                console.log(error);
                reject(error);
            });
    });
};




exports.getsalesReport=async(req,res)=>{
    try{
        const sales=await orderHelper.getAllDeliveredOrders();
        sales.forEach((order)=>{
            const orderDate=new Date(order.orderDate);
            const formattedDate=orderDate.toLocaleDateString("en-GB",{
                day:"2-digit",
                month:"2-digit",
                year:"numeric"
            });
            order.orderDate=formattedDate;
        });
        res.render("admin/sales", {
            pageTitle: "Plantso||Admin-SalesReport",
            layout: "main",
            title: "salesReport",
            sales:sales,
        });
    }
    catch(error){
        throw new Error("error while getting sales report page",error);
    }
  
};

exports.salesReport=async(req,res)=>{
    try {
        let {startDate,endDate}=req.body;
        startDate=new Date(startDate);
        endDate=new Date(endDate);

        const salesReport=await orderHelper.getAllDeliveredOrdersByDate(startDate,endDate);
        for(let i=0;i<salesReport.length;i++){
            salesReport[i].dateCreated=formatDate(salesReport[i].dateCreated);
            salesReport[i].total=currencyFormat(salesReport[i].total);
        }
        res.status(200).json({sales:salesReport});
    } catch (error) {
        console.error("Error while getting current date sales report:", error);
        res.status(500).json({ error: "An error occurred while fetching the sales report." });
    }
};


exports.updateOrderStatus=(req,res)=>{
    const orderId=req.params.orderId;
    const status=req.body.status;
    orderHelper.updateStatus(orderId,status)
        .then((order)=>{
            return res.json({success:true,message:"Order status updated successfully",status:order.status,orderId:orderId});
        }).catch((error)=>{
            console.log(error);
        });
};

exports.getAllOrders = (req, res) => {
    orderHelper
        .getAllOrders()
        .then((orders) => {
            res.render("admin/list-orders", {
                pageTitle: "Plantso||Admin-OrderList",
                layout: "main",
                orders: orders,
                title: "orders",
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: "An error occurred while fetching orders" });
        });
};

exports.cancelOrder=async(req,res)=>{
    try{
        const {id,cancelreason}=req.body;
        const cancelResult=await orderHelper.cancelOrder(id,cancelreason);
        if(cancelResult){
            res.json({message:'Order cancelled successfully',success:true})
        }else{
            res.json({message: 'something wrong! cancelled operation failed',success:false})
        }
    }
    catch(error){
        console.log(error);
    }
}
exports.returnOrder=async(req,res)=>{
    try {
        const {id,returnReason}=req.body;
        const cancelResult=await orderHelper.returnOrder(id,returnReason);
        if(cancelResult){
            res.json({message:'order return successfully',success:true})
        }else{
            res.json({message:'something wrong!return operation failed'})
        }
    } catch (error) {
        console.log(error);
    }
}
exports.changePaymentStatus=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}
exports.changeOrderStatus=async(req,res)=>{
    try {
        const {orderId,status}=req.body;
        const result=await Order.changeOrderStatus(status,orderId);
        if(result.status){
            return res.json({success:true,message:result.message})
        } else{
            return res.json({success:false,message:result.message});
        }
    } catch (error) {
        handleError(res,error);
    }
}
exports.getWallet=async(req,res)=>{
    try{
        const walletAmount=await orderHelper.getWallet(req.session.user._id);
        if(walletAmount.status){
            return res.render('shop/wallet',{
                walletAmount:walletAmount.amount,
                walletPending:walletAmount.pendingWallet,
            })
        }else{
            return res.render('shop/wallet',{
                walletAmount:walletAmount.amount,
                walletPending:walletAmount.pendingWallet,
            });
        }
    }
    catch(error){
        console.log(error);
    }
}
exports.applyWallet=async(req,res)=>{
    try{
        const walletAmount=req.body.walletInput;
        const userId=req.session.user._id;
        // const result=await user.cartProductTotal(userId);
        const user=await User.findById(userId);
        const result=await userHelper.cartTotalProduct();
        const response=await orderHelper.getUserData(userId);
        if(!result.status){
            return res.status(404).json({ success: false, message: 'something wrong!cart not found' });
        }

        let cart=result.cart;
        let totalWallet=response.amount;
        let cartTotal=cart.total;
        let maxAmount;

        if(req.session.coupon){
            let coupon=req.session.coupon;
            const discountAmount=(coupon.discount/100)*cartTotal;
            cartTotal=cartTotal-discountAmount;
        }

        if(totalWallet>cartTotal){
            maxAmount=cartTotal;
        }else{
            maxAmount=totalWallet;
        }
        if(maxAmount<walletAmount){
            return res.status(400).json({success:false,message:'Oops!Wrong wallet amount'});
        }

        cartTotal=cartTotal-walletAmount;
        let walletBalance=totalWallet-walletAmount;
        req.session.appliedWallet=walletAmount;
        return res.json({success:true,cartTotal,walletBalance});
    }
    catch(error){
        console.log(error);
    }
}

exports.verifyPayment=async(req,res)=>{
    try {
        const verifyResult=await orderHelper.verifyPayment(req.body,res);
        if(verifyResult){
            let razorpay_payement_id=req.body['payment[razorpay_payment_id]'];
            let razorpay_order_id=req.body['payment[razorpay_order_id'];
            let razorpay_signature=req.body['payment[razorpay_signature]'];
            let paymentDetails={razorpay_payement_id,razorpay_order_id,razorpay_signature};
            const changePaymentresult=await Order.changePaymentStatus(
                req.body['order[receipt]'],
                paymentDetails,
            );
            if(changePaymentresult){
                return res.json({success:true,message:'payment result updated'});
            }else{
                return res.json({
                    success:false,
                    message:'something goes wrong!payment result not updated',
                })
            }
        
        }
    } catch (error) {
        handleError(res,error);
    }
}




// convert a number to a indian currency format
function currencyFormat(amount) {
    return Number(amount).toLocaleString("en-in", { style: "currency", currency: "INR", minimumFractionDigits: 0 });
}




const formatDate=function (date) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
};

