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






