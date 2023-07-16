function handleError(res,error){
    const err=new Error(error);
    err.httpStatusCode=500;
    throw err;
}
// function handleError(res,error) {
//     console.error('💥',error);
//     res.status(500).json({status:false,message: error?.message });
//   }

module.exports=handleError;

