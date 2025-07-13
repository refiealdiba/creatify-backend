import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Review from "../models/review.model";
import db from "../config/db";

export const getReviewsByGigId = async (req: Request, res: Response) => {
    const { gig_id } = req.body;
    if (!gig_id) {
        return res.status(400).json({ message: "Gig ID is required" });
    }
    try {
        const [rows] = await db.query<Review[]>(
            "SELECT * FROM reviews WHERE gig_id = ? ORDER BY created_at DESC",
            [gig_id]
        );
        // if (rows.length === 0) {
        //     return res.status(404).json({ message: "No reviews found for this gig" });
        // }
        res.json(rows);
    } catch (error) {
        console.error("Gagal connect ke Review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createReview = async (req: AuthRequest, res: Response) => {
    const { gig_id, rating, comment } = req.body;
    const { id, name, profile_image } = req.user;

    // console.log(req.user);

    if (!gig_id || !rating || !comment) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!req.user) {
        return res.status(400).json({ message: "User ID and name are required" });
    }

    try {
        await db.query(
            "INSERT INTO reviews (gig_id, user_id, name, profile_image, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
            [gig_id, id, name, profile_image || null, rating, comment]
        );
        return res.status(201).json({ message: "Review created successfully" });
    } catch (error) {
        console.error("Gagal bikin Review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ message: "Rating and comment are required" });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        const [result] = await db.query(
            "UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?",
            [rating, comment, id, req.user.id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: "Review not found or not authorized" });
        }

        res.json({ message: "Review updated successfully" });
    } catch (error) {
        console.error("Gagal update Review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
