import dotenv from "dotenv"
import {app} from "./app.js"
import connectDB from "./db/index.js"
import { connection } from "mongoose"

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB Connection Failed",err)
})