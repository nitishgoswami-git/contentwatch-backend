import express from "express"
import cors from "cors"

const app = express();

app.listen(process.env.PORT , () =>{
    console.log(`Server Listening on port ${process.env.PORT}`)
})

export {app}