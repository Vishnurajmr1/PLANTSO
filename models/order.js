const  mongoose=require("mongoose");


const Schema=mongoose.Schema;

const orderSchema=new Schema({
    products:[
        {
            product:{type:Object,required:true},
            quantity:{type:Object,required:true}
        }
    ],
    user:{
        email:{
            type:String,
            required:true
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },
        name:{
            type:String,
        }
    },
    status: {
        type: String,
        enum: [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "canceled",
            "cancelPending",
            "returnPending",
            "returned",
        ],
        default: "pending",
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    },
    dateCreated:{
        type:Date,
        default:Date.now,
    },
    paymentmethod: {
        type: String,
    },
    total: {
        type: Number,
    },
    subTotal:{
        type:Number,
    },
});

module.exports=mongoose.model("Order",orderSchema);