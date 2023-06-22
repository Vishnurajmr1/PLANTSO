
const isauth=(req,res,next)=>{
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    next();
}
const isAdmin=(req,res,next)=>{
    if(!req.session.isAdmin){
        return res.redirect('/');
    }
    next();
}

module.exports={
    isauth,
    isAdmin,
}