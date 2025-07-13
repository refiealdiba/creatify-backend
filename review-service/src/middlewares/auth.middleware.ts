import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
    user?: any;
}

const JWT_SECRET = process.env.JWT_KEY as string;

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1]; // format: Bearer <token>

    if (!token) return res.sendStatus(401); // Unauthorized

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token tidak valid" }); // Forbidden
    }
}
