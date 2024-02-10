const Coupon = require("../models/coupon");
const User = require("../models/user");

exports.addCoupons = async (dataBody) => {
    try {
        const {
            couponName,
            couponDesc,
            couponDiscount,
            validFrom,
            validUntil,
            couponMinAmt,
        } = dataBody;
        const randomThreeDigitNumber = Math.floor(100 + Math.random() * 900);
        const code = `${couponName
            .split("")
            .join("")}${randomThreeDigitNumber}`.toUpperCase();
        const coupon = new Coupon({
            couponname: couponName,
            code: code,
            couponDescription: couponDesc,
            discount: couponDiscount,
            minimumPurchase: couponMinAmt,
            validFrom: validFrom,
            validUntil: validUntil,
        });
        const result = await coupon.save();
        if (result) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        throw new Error("oops!something wrong while adding coupon");
    }
};

exports.changeCouponStatus = async (couponId, updateStatus) => {
    try {
        const result = await Coupon.updateOne(
            { _id: couponId },
            { $set: { isActive: updateStatus } }
        );
        if (result.modifiedCount > 0) {
            return { status: true };
        } else {
            return { status: false };
        }
    } catch (error) {
        throw new Error("oops!something wrong while changing the coupon status");
    }
};
exports.getAllCoupons = async () => {
    try {
        const result = await Coupon.find({}).sort({ validFrom: 1 }).lean();
        return result;
    } catch (error) {
        throw new Error("Oops!something wrong while fetching coupons");
    }
};
exports.getValidCoupons = async () => {
    try {
        const result = await Coupon.find({ isActive: true })
            .sort({ validFrom: 1 })
            .lean();
        return result;
    } catch (error) {
        throw new Error("Oops!something wrong while fetching coupons");
    }
};

exports.findCoupon = async (couponName) => {
    try {
        const result = await Coupon.findOne({ code: couponName });
        if (result) {
            return { status: true, coupon: result };
        } else {
            return { status: false };
        }
    } catch (error) {
        throw new Error("oops!something wrong while finding the coupon");
    }
};

exports.isUserValidForCoupon = async (userId, coupon) => {
    try {
        const user = await User.findById(userId);
        if (user.couponHistory.length > 0) {
            const usedCoupon = user.couponHistory.find((couponId) =>
                couponId.equals(coupon._id)
            );
            if (usedCoupon) {
                return { status: false, message: "Coupon already used" };
            }
        }
        const cart = user.cart;
        if (cart.totalPrice < coupon.minimumPurchase) {
            return {
                status: false,
                message: "Cart total does not meet the minimum purchase requirement",
            };
        } else {
            let cartTotal = cart.totalPrice;
            return { status: true, cartTotal };
        }
    } catch (error) {
        throw new Error(
            "Oops! Something went wrong while checking if the user is valid for the coupon"
        );
    }
};

exports.addCouponData = async (couponData, userId) => {
    try {
        const user = await User.findById(userId);
        user.couponHistory.push(couponData._id);
        await user.save();
        return true;
    } catch (error) {
        throw new Error("Oops!Something wrong while adding coupon data");
    }
};
