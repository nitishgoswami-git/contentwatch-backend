import {Router} from "express"
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router();

router.get("/welcome", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: "Welcome to the admin page",
  });
});

export default router;