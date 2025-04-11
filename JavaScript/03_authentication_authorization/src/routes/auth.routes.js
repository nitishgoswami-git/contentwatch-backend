import {Router} from "express"
import {  registerUser, loginUser, changePassword } from "../controllers/auth.controller.js"



const router = Router();
import authMiddleware from "../middleware/auth.middleware.js"


//all routes are related to authentication & authorization
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", authMiddleware, changePassword);

export default router