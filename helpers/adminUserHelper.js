const User = require("../models/user");
const mongoose=require('mongoose');

exports.viewAllUser = async () => {
  try {
    const users = await User.find({ is_Admin: { $ne: true } })
      .lean()
      .exec();
    console.log(users);
    return users;
  } catch (error) {
    throw new Error(error);
  }
};

exports.blockUnblockUsers = async (userInfo) => {
  let {userId,currStatus}=userInfo;
  try {
    if(currStatus){
      currStatus=false;
    }else{
      currStatus=true;
    }
    await User.updateOne({ _id:new mongoose.Types.ObjectId(userId)},{ $set: { status: currStatus } });
    return currStatus;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getUserById=async(userId)=>{
  try{
    //Find  the user ID
    const user=await User.findById(userId);
    if(!user){
      throw new Error('User not found');
    }
    return user;
  }
  catch (error){
    throw new Error('Failed to get User');
  }
}

exports.checkEmailUnqiue=async(email,userId)=>{
  try{
    const user=await User.findOne({email});
    if(user && user._id.toString()!==userId){
      return false;
    }
    return true;
  }
  catch(error){
    throw error;
  }
}
exports.checkPhoneUnqiue=async(phone,userId)=>{
  try{
    const user=await User.findOne({phone});
    if(user && user._id.toString()!==userId){
      return false;
    }
    return true;
  }
  catch(error){
    throw error;
  }
}
exports.checkUsernameUnqiue=async(name,userId)=>{
  try{
    const user=await User.findOne({name});
    if(user && user._id.toString()!==userId){
      return false;
    }
    return true;
  }
  catch(error){
    throw error;
  }
}


exports.fetchUserDetails=async(userId)=>{
  try{
    const user=await User.findById(userId);
    return user;
  }catch(error){
    throw new Error('User details fetching error');
  }
}


exports.updateUser=async(userId,updatedUser)=>{
  try{
    //Find the user  by ID and update the fields
    const user=await User.findByIdAndUpdate(userId,updatedUser,{new:true});
    if(!user){
      throw new Error('User not found');
    }
    return user;
  }
  catch(error){
    throw new Error('Failed to update user');
  }
}



