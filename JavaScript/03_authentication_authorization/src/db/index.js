import mongoose from "mongoose";

const connectDB = async () =>{
    try{
           const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/auth`)
                console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    }catch(e){
        console.log(`Something went wrong ${e}`)
        process.exit(1)
    }
}
export {connectDB}