import mongoose from 'mongoose';
import configKeys from '../configkeys.js';

const uri=configKeys.MONGO_DB_URL;

mongoose.connection.once("open",()=>{
    console.log("MongoDB connection ready!🚀");
});

mongoose.connection.on("error",(error)=>{
    console.error(`Database not connected!!!${error}`);
});

async function mongoConnect(){
    await mongoose.connect(uri,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    });
}
export default mongoConnect;