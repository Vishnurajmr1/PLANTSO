const couponHelper = require("../helpers/couponHelper");

exports.getCoupon = async (req, res, next) => {
  try {
    const coupons = await couponHelper.getAllCoupon();
    res.render("admin/coupons", {
        pageTitle: "Plantso||Admin-Coupons",
        layout: "main",
        // orders:orders,
        title: "Coupons",
      });
  } catch (err) {
    throw new Error("Error while get coupon page", err);
  }
};
