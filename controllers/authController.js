exports.getLogin = (req, res, next) => {
  //  const isLoggedIn=req
  // .get("Cookie")
  // .split(';')[0]
  // .trim()
  // .split("=")[1];
  console.log(req.session.isLoggedIn);
  res.render("auth/login",{
    layout: "noLayout",
  });
};

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn=true;
  res.redirect("/");
};
