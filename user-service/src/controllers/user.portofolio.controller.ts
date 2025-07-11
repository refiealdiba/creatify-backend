import { Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import Portofolio from "../models/user.portofolio.model";

// GET all portfolios for logged in user
export async function getMyPortofolios(req: AuthRequest, res: Response) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [rows] = await db.query<Portofolio[]>(
            "SELECT * FROM portofolio WHERE user_id = ? ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data portofolio" });
    }
}

// CREATE new portfolio with image
export async function createPortofolio(req: AuthRequest, res: Response) {
    const { title, description } = req.body;
    const image = req.file?.filename;
    const imageUrl = image ? `${process.env.BASE_URL}/uploads/${image}` : null;

    if (!title || !description || !imageUrl) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    try {
        await db.query(
            "INSERT INTO portofolio (user_id, title, description, image) VALUES (?, ?, ?, ?)",
            [req.user.id, title, description, imageUrl]
        );
        res.status(201).json({ message: "Portofolio berhasil dibuat" });
    } catch (err) {
        res.status(500).json({ message: "Gagal membuat portofolio" });
    }
}

// UPDATE
export async function updatePortofolio(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { title, description } = req.body;
    const image = req.file?.filename;
    const imageUrl = image ? `${process.env.BASE_URL}/uploads/${image}` : null;

    if (!title || !description) {
        return res.status(400).json({ message: "Judul dan deskripsi harus diisi" });
    }

    try {
        const sql = `
        UPDATE portofolio
        SET title = ?, description = ?, image = IFNULL(?, image)
        WHERE id = ? AND user_id = ?
    `;
        await db.query(sql, [title, description, imageUrl, id, req.user.id]);
        res.json({ message: "Portofolio berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ message: "Gagal update portofolio" });
    }
}

// DELETE
export async function deletePortofolio(req: AuthRequest, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "ID portofolio harus disediakan" });
    }

    try {
        await db.query("DELETE FROM portofolio WHERE id = ? AND user_id = ?", [id, req.user.id]);
        res.json({ message: "Portofolio berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: "Gagal hapus portofolio" });
    }
}
