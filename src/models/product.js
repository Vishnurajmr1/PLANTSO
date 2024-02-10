const mongoose=require("mongoose");

const Schema=mongoose.Schema;

const productSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    thumnail:{
        type:String
    },
    imageUrl:[{
        type:String,
        required:true
    }],
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    stock:{
        type:Number,
        required:true,
        default:0
    },
    dateCreated:{
        type:Date,
        default:Date.now,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false,
    }
});
module.exports=mongoose.model("Product",productSchema);