import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import User from "../models/user.model";
import db from "../config/db";

export const detailUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query<User[]>(
            "SELECT id, name, email, role, bio, profile_image, created_at, updated_at FROM users WHERE id = ?",
            [userId]
        );

        const user = rows[0];

        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data user" });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { name, bio } = req.body;
    const profileImageFilename = req.file?.filename;

    // Ganti ini dengan URL asli API kamu
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    // Buat URL lengkap jika ada file
    const profileImageUrl = profileImageFilename
        ? `${BASE_URL}/uploads/${profileImageFilename}`
        : null;

    try {
        const fields: string[] = [];
        const values: any[] = [];

        if (name) {
            fields.push("name = ?");
            values.push(name);
        }

        if (bio) {
            fields.push("bio = ?");
            values.push(bio);
        }

        if (profileImageUrl) {
            fields.push("profile_image = ?");
            values.push(profileImageUrl);
        }

        fields.push("updated_at = CURRENT_TIMESTAMP");
        values.push(userId);

        const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

        await db.query(sql, values);

        res.json({ message: "Profil berhasil diperbarui" });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Gagal memperbarui profil" });
    }
};

// export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "Tidak ada file yang diupload." });
//     }

//     const userId = req.user.id;
//     const fileName = req.file.filename;

//     try {
//         await db.query(
//             "UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
//             [fileName, userId]
//         );

//         res.json({ message: "Foto profil berhasil diupload", file: fileName });
//     } catch (err) {
//         res.status(500).json({ message: "Gagal mengupload foto profil" });
//     }
// };
