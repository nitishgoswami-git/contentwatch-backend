import express from "express"
import cors from "cors"

const app = express();

app.listen(process.env.PORT , () =>{
    console.log(`Server Listening on port ${process.env.PORT}`)
})

import authRouter from "./routes/auth.routes.js"
import homeRouter from "./routes/home.routes.js"
import adminRouter from "./routes/admin.routes.js"

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/home",homeRouter)
app.use("/api/v1/admin",adminRouter)

export {app}