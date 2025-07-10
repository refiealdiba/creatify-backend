import { Request, Response } from "express";
import db from "../config/db";
import { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_KEY as string;

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    try {
        // cek apakah email sudah ada
        const [existing] = await db.query<RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [
            email,
        ]);

        if (existing.length > 0) {
            return res.status(409).json({ message: "Email sudah digunakan" });
        }

        const [result] = await db.query(
            `INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)`,
            [name, email, password, role]
        );

        res.status(201).json({
            message: "Registrasi berhasil",
            userId: (result as any).insertId,
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Gagal melakukan registrasi" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [
            email,
        ]);

        const user = rows[0] as User | undefined;

        if (!user) {
            return res.status(401).json({ message: "Email tidak ditemukan" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Password salah" });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: "Login berhasil",
            user: userWithoutPassword,
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
