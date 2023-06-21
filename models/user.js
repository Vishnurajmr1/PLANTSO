const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    required: true,
  },
  password:{
    type:String,
    required:true,
  },
  status:{
    type:Boolean,
    default:true,
  },
  is_Admin:{
    type:Boolean,
    default:false
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price:{type:Number,required:true},
      },
    ],
  },
});

// userSchema.methods.addToCart = function (product) {
//   const cartProductIndex = this.cart.items.findIndex((cp) => {
//     return cp.productId.toString() === product._id.toString();
//   });

//   let newQuantity = 1;
//   const updatedCartItems = [...this.cart.items];

//   if (cartProductIndex >= 0) {
//     newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//     updatedCartItems[cartProductIndex].quantity = newQuantity;
//   } else {
//     updatedCartItems.push({
//       productId: product._id,
//       quantity: newQuantity,
//     });
//   }
//   const updatedCart = {
//     items: updatedCartItems,
//   };
//   this.cart = updatedCart;
//   return this.save();
// };


userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  let newPrice=product.price;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    const currentQuantity = this.cart.items[cartProductIndex].quantity;
    const stockLimit = product.stock; // Assuming the product schema has a 'stock' field

    if (currentQuantity + 1 <= stockLimit) {
      newQuantity = currentQuantity + 1;
      newPrice=product.price*newQuantity;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
      updatedCartItems[cartProductIndex].price=newPrice;
    } else {
      // Handle the case where quantity exceeds the stock limit
      throw new Error('Cannot add more quantity than available in stock.');
    }
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
      price:newPrice,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart=function(productId){
  const updatedCartItems=this.cart.items.filter(item=>{
    return item.productId.toString()!==productId.toString();
  });
  this.cart.items=updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart=function(){
  this.cart={items:[]};
  return this.save();
}


module.exports = mongoose.model("User", userSchema);
