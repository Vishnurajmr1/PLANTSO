const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    }
});

module.exports=mongoose.model('Category',categorySchema);
// const Category=mongoose
