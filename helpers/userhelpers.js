const Address = require("../models/address");

exports.saveAddress = (addressData,userId) => {
    return new Promise((resolve, reject) => {
        const address = new Address({
            fname:addressData.fname,
            lname:addressData.lname,
            country:addressData.country,
            state:addressData.state,
            city:addressData.city,
            phone:addressData.phone,
            zipcode:addressData.zipcode,
            street_address:addressData.streetAddress,
            user:userId,
            isShippingAddress:false,
            isBillingAddress:false
        });
        address.save()
            .then((savedAddress) => {
                console.log(savedAddress);
                resolve(savedAddress);
            })
            .catch((error) => {
                console.log("Error saving address",error);
                reject(error);
            });
    });
};

exports.getAddress=(userId)=>{
    return new Promise((resolve)=>{
        Address.find({user:userId}).lean()
            .then((addresses)=>{
                resolve(addresses);
            })
            .catch((error)=>{
                console.log("Error retrieving addresses:",error);
                resolve([]);
            });
    });
};


// exports.defaultAddress=async(userId)=>{
//     try {
//         return await new Promise((resolve, reject) => {
//             Address.findOne({ user: userId, isBillingAddress: true, isShippingAddress: true }).lean()
//                 .then((addresses) => {
//                     if (addresses.length == 0) {
//                         resolve('No default address found');
//                     } else {
//                         resolve(addresses);
//                     }
//                 });
//         });
//     } catch (error) {
//         console.log('Error retrieving default address', error);
//         reject(error);
//     }
// }

exports.defaultAddress = async (userId) => {
    try {
        const address = await Address.findOne({
            user: userId,
            isBillingAddress: true,
            isShippingAddress: true
        }).lean();
  
        if (!address) {
            return "No default address found";
        } else {
            return address;
        }
    } catch (error) {
        console.log("Error retrieving default address", error);
        throw error;
    }
};
  