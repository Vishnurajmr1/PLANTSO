const Order = require("../models/order");
const Product = require("../models/product");
const orderHelper=require("../helpers/orderHelper");

exports.getCheckoutSuccess = (req, res) => {
    const paymentMethod=req.body.paymentMethod;
    const totalPrice=req.body.totalPrice;
    const address=req.body.address;
    req.user
        .populate("cart.items.productId")
        .then((user) => {
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
            return Promise.all(updateStockPromise)
                .then(()=>{
                    const order = new Order({
                        user: {
                            email: req.user.email,
                            userId: req.user,
                        },
                        products: products,
                        paymentMethod:paymentMethod,
                        totalPrice:totalPrice,
                        address:address
                    });
                    return order.save();
                })
                .then(() => {
                    return req.user.clearCart();
                });
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
                console.log(order);
                resolve(order);
            })
            .catch((err) => {
                console.log(err.message);
                reject(err);
            });
    });
};

exports.createOrder=(user,cartItems,addressId,paymentMethodId,totalPrice)=>{
    return new Promise((resolve,reject)=>{
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
                    status:"pending",
                    subTotal:user.cart.totalPrice,
                    total:totalPrice,
                    shippingAddress:addressId,
                    products:products,
                    paymentmethod:paymentMethodId
                });
                order.save()
                    .then((savedOrder)=>{
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
            console.log(orders);
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


// convert a number to a indian currency format
function currencyFormat(amount) {
    return Number(amount).toLocaleString("en-in", { style: "currency", currency: "INR", minimumFractionDigits: 0 });
}




const formatDate=function (date) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
};