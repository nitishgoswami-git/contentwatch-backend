import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'

    }
},{timestamps:true})

export const User = mongoose.model("User",userSchema);