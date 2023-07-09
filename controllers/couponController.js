const couponHelper = require("../helpers/couponHelper");

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await couponHelper.getAllCoupons();
    const currentDate = new Date();
    const maxDate=new Date();
    const minDate=new Date();
    minDate.setDate(currentDate.getDate()+1);
    maxDate.setFullYear(maxDate.getFullYear()+1);
    const formattedNextDate=minDate.toISOString().split('T')[0];
    const formattedCurrentDate=currentDate.toISOString().split('T')[0];
    const formattedMaxDate=maxDate.toISOString().split('T')[0];
    res.render("admin/coupons", {
        pageTitle: "Plantso||Admin-Coupons",
        layout: "main",
        coupons:coupons,
        CouponLength:coupons.length>0,
        currentDate:formattedCurrentDate,
        nextDate:formattedNextDate,
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
        throw new Error('Error while adding the coupon',error);
    }
}
exports.changeCouponStatus=async(req,res,next)=>{
    try{
        const {id,status}=req.body;
        const result=await couponHelper.changeCouponStatus(id,status);
        if(result.status){
             res.status(200).json({success:true});
        }else{
             res.status(500).json({success:false});
        }
    }
    catch(error){
        throw new Error('Error while adding the coupon',error);
    }
}

exports.applyCoupon=async(req,res,next)=>{
    try{
        
        // const couponName=req.body;
        const couponName=req.body.couponname;
        const coupon=await couponHelper.findCoupon(couponName)

        if(!coupon.status){
             return res.json({success:false,message:'Invalid Coupon'});
        }
        const userId=req.session.user._id;
        console.log(userId);
        const response=await couponHelper.isUserValidForCoupon(userId,coupon.coupon);

        // if(req.session.app)
        
        if (!response.status) {
        // Cart total does not meet the minimum purchase requirement
        return res.json({ success: false, message: response.message });
        }
        
        const discountAmount=(coupon.coupon.discount/100)*response.cartTotal;
        console.log(discountAmount);
        let cartTotal=response.cartTotal-discountAmount;
        console.log(cartTotal);
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