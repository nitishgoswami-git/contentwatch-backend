import mongoose, { mongo } from "mongoose";
import { User } from "./user.model";

const imageSchema = new mongoose.Schema({
    url:{
        type:String,
        required: true
    },
    publicId:{
        type:String,
        required:true
    },
    uploadedBy:{
        type: mongoose.Types.ObjectId,
        ref:User
    }
},{timestamps:true})

export const Image = mongoose.model("Image",imageSchema)