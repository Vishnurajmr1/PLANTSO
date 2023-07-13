// const {validationResult}=require('express-validator')
const orderHelper = require("../helpers/orderHelper");
const adminUserHelpers=require("../helpers/adminUserHelper");
const dashboardHelper=require("../helpers/dashboardHelper");




exports.getIndex = async(req, res) => {
    try{
        const orders= await orderHelper.getAllOrders();
        const result=await dashboardHelper.getDashBoardData();
        res.render("admin/index", {
            pageTitle: "Plantso||Admin-Dashboard",
            layout: "main",
            orders:orders,
            totalRevenue:result.totalRevenue,
            totalOrdersCount:result.totalOrdersCount,
            totalProductsCount:result.totalProductsCount,
            totalCategoriesCount:result.totalCategoriesCount,
            currentMonthEarnings:result.currentMonthEarnings,
            title: "Dashboard",
        });
    }
    catch(error){
        throw new Error("Error while fetching dashboardData",error);
    }

};

exports.getUser = (req, res) => {
    res.render("admin/list-users", {
        pageTitle: "Plantso||Admin-UserList",
        layout: "main",
        title: "users",
    });
};



exports.getUsers = (req, res) => {
    adminUserHelpers.viewAllUser()
        .then(users => {
            res.render("admin/list-users", {
                pageTitle: "Plantso||Admin-UserList",
                layout: "main",
                users: users, //Pass the orders to the view
                title: "users",
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({error:"An error occured while fetching users"});
        });
};

exports.blockUser=(req,res)=>{
    adminUserHelpers.blockUnblockUsers(req.body)
        .then(userStatus=>{
            res.json(userStatus);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({error:"An error occured while blocking users"});
        });
};

exports.getUserDetails=async(req,res)=>{
    try{
        const {userId}=req.params;
        //Fetch the user details
        const user=await adminUserHelpers.fetchUserDetails(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        res.status(200).json(user);
    }
    catch(error){
        res.status(500).json({error:"Internal server error"});
    }
};



exports.editUser=async(req,res)=>{
    try{
        const {userId}=req.body;
        const {email,phone,name}=req.body;
    
        const existingUser=await  adminUserHelpers.getUserById(userId);
        //Check  email uniqueness
        //Check if email and phone are modified

        //Check  email uniqueness
        const isEmailModified=email!==existingUser.email;
        const isPhoneModified=phone!==existingUser.phone;
        const isNameModified=name!==existingUser.name;
        if(isEmailModified){
            const isEmailUnqiue=await adminUserHelpers.checkEmailUnqiue(email,userId);
            if(!isEmailUnqiue){
                return res.status(400).json({
                    success:false,
                    message:"Email already exists"});
            }
        }
        //Check phone  unqiueness only if it is modified
        if(isPhoneModified){
            const isPhoneUnqiue=await adminUserHelpers.checkPhoneUnqiue(phone,userId);
            if(!isPhoneUnqiue){
                return res.status(400).json({
                    success:false,
                    message:"Phone number already exists"});
            }
        }
        //Check  name uniqueness
        if(isNameModified){
            const isUsernameUnqiue=await adminUserHelpers.checkUsernameUnqiue(name,userId);
            if(!isUsernameUnqiue){
                return res.status(400).json({
                    success:false,
                    message:"Username already exists"});
            }
        }
   
        //Update the user details
        const updatedUser = {
            // name: name || existingUser.name, // Keep existing name if not modified
            email: isEmailModified ? email : existingUser.email, // Keep existing email if not modified
            name: isNameModified ? name : existingUser.name, // Keep existing name if not modified
            phone: isPhoneModified ? phone : existingUser.phone, // Keep existing phone if not modified
        };

        await adminUserHelpers.updateUser(userId,updatedUser);
        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
        });
    }catch(error){
        res.status(500).json({error:"Internal Server Error"});
    }
};




exports.getGraphData=async(req,res)=>{
    try{
        const result=await dashboardHelper.getGraphDate();
        if(result.status){
            res.json({
                labels:result.labels,
                sales:result.salesData,
                products:result.productsData,
                message:result.message,
                success:true
            });
        }
    }
    catch(error){
        console.error("Error while fetching graph data",error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.getChartDataFull=async(req,res)=>{
    try{
        const result=await dashboardHelper.getChartData();
        if (result.status) {
            const { popularProducts } = result;

            // Populate the chart data
            const labels = popularProducts.map((product) => product.productName);
            const data = popularProducts.map((product) => product.totalOrders);
            const stocks = popularProducts.map((product) => product.stocks); // Fetch product stock data

            return res.json({
                success: true,
                labels,
                data,
                stocks,
            });
        } else {
            return res.json({
                success: false,
                message: "Oops! Something went wrong. Chart data not found.",
            });
        }
    }
    catch(error){
        console.error("Error while fetching graph data",error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
