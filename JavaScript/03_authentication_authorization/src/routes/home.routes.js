import {Router} from "express"
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router();

router.get("/welcome", authMiddleware, (req, res) => {
  const { username, userId, role } = req.userInfo;

  res.json({
    message: "Welcome to the home page",
    user: {
      _id: userId,
      username,
      role,
    },
  });
});

export default router;