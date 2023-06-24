const User = require("../models/user");

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
  const userId = userInfo;
  let { currentStatus } = userInfo;
  console.log(currentStatus);
  try {
    if (currentStatus === "true") {
      currentStatus = false;
    } else {
      currentStatus = true;
    }
    await User.updateOne({ _id: userId }, { $set: { status: currentStatus } });
    return currentStatus;
  } catch (error) {
    throw new Error(error);
  }
};
