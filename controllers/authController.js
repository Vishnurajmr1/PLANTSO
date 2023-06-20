const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render("auth/login",{
    layout: "noLayout",
  });
};
exports.postLogin = (req, res, next) => {
  User.findById('648a8549452437be8afd60e3')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err=>{
        console.log(err);
         res.redirect('/');
      })
    })
    .catch(err => console.log(err));
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    res.redirect("/");
  })
};
