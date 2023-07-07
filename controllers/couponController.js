const couponHelper = require("../helpers/couponHelper");

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await couponHelper.getAllCoupons();
    const currentDate = new Date().toISOString().split('T')[0];
    const maxDate=new Date();
    maxDate.setFullYear(maxDate.getFullYear()+1);
    const formattedMaxDate=maxDate.toISOString().split('T')[0];
    res.render("admin/coupons", {
        pageTitle: "Plantso||Admin-Coupons",
        layout: "main",
        coupons:coupons,
        CouponLength:coupons.length>0,
        currentDate:currentDate,
        maxDate:formattedMaxDate,
        title: "Coupons",
      });
  } catch (err) {
    throw new Error("Error while get coupon page", err);
  }
};
exports.addCoupons=async(req,res,next)=>{
    try{
        const result=await couponHelper.addCoupons(req.body);
        console.log(result);
        if(result){
            return res.status(200).json({success:true,message:'coupon added successfully'});
        }else{
            return res.status(500).json({success:false,message:'oops!something wrong internal server error'});
        }
    }
    catch(error){
        throw new Error('Error while adding the coupon',err);
    }
}
exports.changeCouponStatus=async(req,res,next)=>{
    try{
        const result=await couponHelper.changeCouponStatus(id,status);
        console.log(result);
        if(result.status){
             res.status(200).json({success:true});
        }else{
             res.status(500).json({success:false});
        }
    }
    catch(error){
        throw new Error('Error while adding the coupon',err);
    }
}

exports.applyCoupon=async(req,res,next)=>{
    try{
        const couponName=req.body;
        const coupon=await couponHelper.findCoupon(couponName)

        if(!coupon.status){
             return res.json({success:false,message:'Invalid Coupon'});
        }
        const userId=req.session.user._id;
        const response=await couponHelper.isUserValidForCoupon(userId,coupon.coupon);

        // if(req.session.app)
        const discountAmount=(coupon.coupon.discount/100)*response.cartTotal;
        let cartTotal=response.cartTotal-discountAmount;

        req.session.coupon=coupon.coupon;

        return res.json({
            success:true,
            cartTotal:cartTotal,
            discountAmount:discountAmount,
            message:'Coupon successfully added',
        });
    }
    catch(error){
        throw new Error('Error while adding the coupon',error);
    }
}

exports.removeCoupon=async(req,res)=>{
    try{
        if(req.session.coupon){
        req.session.coupon=null;
        return res.json({status:true,message:'coupon removed successfully'});
        }  
        return res.json({status:false,message:'something wrong!cant remove coupon!'})
    }
    catch(error){
      throw new Error('Error while removing coupon',error);
    }
}