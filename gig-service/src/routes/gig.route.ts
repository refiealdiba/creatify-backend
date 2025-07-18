import { Router } from "express";
import {
    getGigs,
    getGigById,
    createGig,
    updateGig,
    deleteGig,
} from "../controllers/gig.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const gigRouter = Router();

gigRouter.get("/", getGigs);
gigRouter.get("/:id", getGigById);
gigRouter.post("/", authenticateToken, upload.array("images", 5), createGig);
gigRouter.patch("/:id", authenticateToken, upload.array("images", 5), updateGig);
gigRouter.delete("/:id", authenticateToken, deleteGig);

export default gigRouter;
