import { Router } from "express";
import {
    createPortofolio,
    deletePortofolio,
    getMyPortofolios,
    updatePortofolio,
} from "../controllers/user.portofolio.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const portofolioRouter = Router();

portofolioRouter.get("/all", authenticateToken, getMyPortofolios);
portofolioRouter.post("/create", authenticateToken, upload.single("image"), createPortofolio);
portofolioRouter.put("/update/:id", authenticateToken, upload.single("image"), updatePortofolio);
portofolioRouter.delete("/delete/:id", authenticateToken, deletePortofolio);

export default portofolioRouter;
