const mongoose=require("mongoose");

const Schema=mongoose.Schema;

const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    isDeleted:{
        type:Boolean,
        required:true,
        default:false
    }
});

module.exports=mongoose.model("Category",categorySchema);
