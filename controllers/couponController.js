const couponHelper=require('../helpers/couponHelper');

exports.getCoupon=async(req,res,next)=>{
    try {
        const coupons=await couponHelper.getAllCoupon();
        res.render('admin/coupons',{activePage:'coupon',coupons});
    } catch (err) {
        throw new Error('Error while get coupon page',err);
    }
}


