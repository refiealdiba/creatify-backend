import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { detailUser, updateUser } from "../controllers/user.controller";
import { upload } from "../middlewares/upload.middleware"; // Assuming you have an upload middleware for handling file uploads

const userRouter = Router();

userRouter.get("/detail", authenticateToken, detailUser);
userRouter.patch("/detail", authenticateToken, upload.single("profile_image"), updateUser);

export default userRouter;
