import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.auth.controller";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

export default authRouter;
