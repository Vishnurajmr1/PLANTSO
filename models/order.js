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
            "cancelled",
            "cancelPending",
            "returnPending",
            "returned",
        ],
        default: "pending",
    },
    PaymentResponse:[],

    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    },
    total: {
        type:Number,
    },
    subTotal:{
        type:Number,
    }, 
    paymentmethod: {
        type: String,
    },
    paymentStatus:{
        type: String,
        enum: ['failed', 'success'],
        default: 'failed',
    },
    cancel_reason:{
        type:String,
    },
    return_reason:{
        type:String,
    },
    discount:{
        type:Number,
        default:0,
    },
    wallet:{
        type:Number,
        default:0,
    },
    dateCreated:{
        type:Date,
        default:Date.now,
    }
});

module.exports=mongoose.model("Order",orderSchema);