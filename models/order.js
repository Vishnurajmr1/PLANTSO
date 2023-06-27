const  mongoose=require('mongoose');


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
            ref:'User'
        }
    },
    dateCreated:{
        type:Date,
        default:Date.now,
    },
})

module.exports=mongoose.model('Order',orderSchema);