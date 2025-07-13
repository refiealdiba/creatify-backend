import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { getReviewsByGigId, createReview, updateReview } from "../controllers/review.controller";

const reviewRouter = Router();

// Get reviews by gig ID
reviewRouter.get("/gig", getReviewsByGigId);
reviewRouter.post("/create", authenticateToken, createReview);
reviewRouter.patch("/update/:id", authenticateToken, updateReview);

export default reviewRouter;
