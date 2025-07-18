import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Gig } from "../models/gig.model";
import { GigImage } from "../models/gig.image.model";
import { GigPackage } from "../models/gig.package.model";
import { GigPackageBenefit } from "../models/gig.package.benefit.model";
import { ResultSetHeader } from "mysql2";
import db from "../config/db";
import fs from "fs";
import path from "path";

const baseUrl = process.env.BASE_URL;

export async function getGigs(req: Request, res: Response) {
    try {
        // Ambil semua data gig
        const [gigResults] = await db.query<Gig[]>(`
            SELECT * FROM gigs ORDER BY created_at DESC
        `);

        const gigIdList = gigResults.map((gig) => gig.id);

        if (gigIdList.length === 0) {
            return res.json([]);
        }

        // Ambil semua gambar untuk setiap gig
        const [gigImageResults] = await db.query<GigImage[]>(
            `
            SELECT * FROM gig_images WHERE gig_id IN (?)
        `,
            [gigIdList]
        );

        // Ambil semua paket untuk setiap gig
        const [packageResults] = await db.query<GigPackage[]>(
            `
            SELECT * FROM packages WHERE gig_id IN (?)
        `,
            [gigIdList]
        );

        const packageIdList = packageResults.map((pkg) => pkg.id);

        // Ambil semua benefit untuk setiap package
        const [benefitResults] =
            packageIdList.length > 0
                ? await db.query<GigPackageBenefit[]>(
                      `SELECT * FROM package_benefits WHERE package_id IN (?)`,
                      [packageIdList]
                  )
                : [[]];

        // Gabungkan semua data menjadi satu struktur per gig
        const formattedGigs = gigResults.map((gig) => {
            const gigImages = gigImageResults
                .filter((image) => image.gig_id === gig.id)
                .map((image) => image.image_url);

            const gigPackages = packageResults
                .filter((pkg) => pkg.gig_id === gig.id)
                .map((pkg) => {
                    const packageBenefits = benefitResults
                        .filter((benefit) => benefit.package_id === pkg.id)
                        .map((benefit) => benefit.benefit);

                    return {
                        id: pkg.id,
                        name: pkg.name,
                        description: pkg.description,
                        price: pkg.price,
                        delivery_time: pkg.delivery_time,
                        revisions: pkg.revisions,
                        benefits: packageBenefits,
                        created_at: pkg.created_at,
                        updated_at: pkg.updated_at,
                    };
                });

            return {
                id: gig.id,
                user_id: gig.user_id,
                title: gig.title,
                description: gig.description,
                category_id: gig.category_id,
                price: gig.price,
                delivery_time: gig.delivery_time,
                created_at: gig.created_at,
                updated_at: gig.updated_at,
                images: gigImages,
                packages: gigPackages,
            };
        });

        res.json(formattedGigs);
    } catch (error) {
        console.error("❌ Gagal mengambil data gigs:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data gigs" });
    }
}

export async function getGigById(req: Request, res: Response) {
    const gigIdParam = req.params.id;

    if (!gigIdParam || isNaN(Number(gigIdParam))) {
        return res.status(400).json({ message: "ID gig tidak valid" });
    }

    const gigId = Number(gigIdParam);

    try {
        // Ambil data gig berdasarkan ID
        const [gigResults] = await db.query<Gig[]>(`SELECT * FROM gigs WHERE id = ?`, [gigId]);

        if (gigResults.length === 0) {
            return res.status(404).json({ message: "Gig tidak ditemukan" });
        }

        const gig = gigResults[0];

        // Ambil gambar-gambar gig
        const [gigImageResults] = await db.query<GigImage[]>(
            `SELECT * FROM gig_images WHERE gig_id = ?`,
            [gigId]
        );

        // Ambil packages dari gig ini
        const [packageResults] = await db.query<GigPackage[]>(
            `SELECT * FROM packages WHERE gig_id = ?`,
            [gigId]
        );

        const packageIdList = packageResults.map((pkg) => pkg.id);

        // Ambil benefits dari masing-masing package
        const [benefitResults] =
            packageIdList.length > 0
                ? await db.query<GigPackageBenefit[]>(
                      `SELECT * FROM package_benefits WHERE package_id IN (?)`,
                      [packageIdList]
                  )
                : [[]];

        // Mapping packages lengkap dengan benefits
        const gigPackages = packageResults.map((pkg) => {
            const packageBenefits = benefitResults
                .filter((benefit) => benefit.package_id === pkg.id)
                .map((benefit) => benefit.benefit);

            return {
                id: pkg.id,
                name: pkg.name,
                description: pkg.description,
                price: pkg.price,
                delivery_time: pkg.delivery_time,
                revisions: pkg.revisions,
                benefits: packageBenefits,
                created_at: pkg.created_at,
                updated_at: pkg.updated_at,
            };
        });

        // Format final data gig
        const formattedGig = {
            id: gig.id,
            user_id: gig.user_id,
            title: gig.title,
            description: gig.description,
            category_id: gig.category_id,
            price: gig.price,
            delivery_time: gig.delivery_time,
            created_at: gig.created_at,
            updated_at: gig.updated_at,
            images: gigImageResults.map((img) => img.image_url),
            packages: gigPackages,
        };

        res.json(formattedGig);
    } catch (error) {
        console.error("❌ Error saat mengambil gig:", error);
        res.status(500).json({ message: "Gagal mengambil gig" });
    }
}

export async function createGig(req: AuthRequest, res: Response) {
    const {
        title,
        description,
        category_id,
        price,
        delivery_time,
        packages: rawPackages,
    } = req.body;

    const uploadedImages = req.files as Express.Multer.File[];

    if (
        !req.user ||
        !title ||
        !description ||
        !category_id ||
        !price ||
        !delivery_time ||
        !rawPackages ||
        !uploadedImages ||
        uploadedImages.length === 0
    ) {
        return res
            .status(400)
            .json({ message: "Semua field wajib diisi termasuk minimal 1 gambar." });
    }

    let packageList: {
        name: string;
        description: string;
        price: number;
        delivery_time: number;
        revisions: number;
        benefits: string[];
    }[];

    try {
        packageList = typeof rawPackages === "string" ? JSON.parse(rawPackages) : rawPackages;
    } catch (error) {
        return res.status(400).json({ message: "Format packages tidak valid. Harus JSON." });
    }

    const imageUrls: string[] = uploadedImages.map((file) => `${baseUrl}/uploads/${file.filename}`);

    const dbConnection = await db.getConnection();
    await dbConnection.beginTransaction();

    try {
        // Insert gig utama
        const [gigInsertResult] = await dbConnection.execute<ResultSetHeader>(
            `INSERT INTO gigs (user_id, title, description, category_id, price, delivery_time)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, title, description, category_id, price, delivery_time]
        );
        const gigId = gigInsertResult.insertId;

        // Insert gambar-gambar ke tabel gig_images
        for (const imageUrl of imageUrls) {
            await dbConnection.execute(`INSERT INTO gig_images (gig_id, image_url) VALUES (?, ?)`, [
                gigId,
                imageUrl,
            ]);
        }

        // Insert packages dan benefit-nya
        for (const gigPackage of packageList) {
            const [packageInsertResult] = await dbConnection.execute<ResultSetHeader>(
                `INSERT INTO packages (gig_id, name, description, price, delivery_time, revisions)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    gigId,
                    gigPackage.name,
                    gigPackage.description,
                    gigPackage.price,
                    gigPackage.delivery_time,
                    gigPackage.revisions,
                ]
            );

            const packageId = packageInsertResult.insertId;

            for (const benefit of gigPackage.benefits) {
                await dbConnection.execute(
                    `INSERT INTO package_benefits (package_id, benefit) VALUES (?, ?)`,
                    [packageId, benefit]
                );
            }
        }

        await dbConnection.commit();
        res.status(201).json({ message: "Gig berhasil dibuat!" });
    } catch (error) {
        await dbConnection.rollback();
        console.error("❌ Gagal membuat gig:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat membuat gig." });
    } finally {
        dbConnection.release();
    }
}

export async function updateGig(req: AuthRequest, res: Response) {
    const gigId = Number(req.params.id);

    const {
        title,
        description,
        category_id,
        price,
        delivery_time,
        packages: rawPackages,
        imagesToDelete: rawImagesToDelete,
    } = req.body;

    const uploadedImages = req.files as Express.Multer.File[];

    if (!req.user || !gigId) {
        return res.status(400).json({ message: "User atau ID tidak valid." });
    }

    // Parse optional JSON fields
    let packageList: any[] = [];
    let imagesToDelete: string[] = [];

    try {
        if (rawPackages) {
            packageList = typeof rawPackages === "string" ? JSON.parse(rawPackages) : rawPackages;
        }

        if (rawImagesToDelete) {
            imagesToDelete =
                typeof rawImagesToDelete === "string"
                    ? JSON.parse(rawImagesToDelete)
                    : rawImagesToDelete;
        }
    } catch (err) {
        return res.status(400).json({ message: "Format JSON tidak valid." });
    }

    const newImageUrls = uploadedImages?.map((file) => `${baseUrl}/uploads/${file.filename}`) || [];

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Pastikan gig milik user
        const [existingGig] = await connection.query(
            `SELECT * FROM gigs WHERE id = ? AND user_id = ?`,
            [gigId, req.user.id]
        );

        if ((existingGig as any[]).length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Gig tidak ditemukan atau bukan milik Anda." });
        }

        // Update gig (field yang ada saja)
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (title) {
            updateFields.push("title = ?");
            updateValues.push(title);
        }
        if (description) {
            updateFields.push("description = ?");
            updateValues.push(description);
        }
        if (category_id) {
            updateFields.push("category_id = ?");
            updateValues.push(category_id);
        }
        if (price) {
            updateFields.push("price = ?");
            updateValues.push(price);
        }
        if (delivery_time) {
            updateFields.push("delivery_time = ?");
            updateValues.push(delivery_time);
        }

        if (updateFields.length > 0) {
            updateFields.push("updated_at = CURRENT_TIMESTAMP");
            await connection.execute(
                `UPDATE gigs SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`,
                [...updateValues, gigId, req.user.id]
            );
        }

        // Hapus gambar yang diminta
        for (const imageUrl of imagesToDelete) {
            await connection.execute(`DELETE FROM gig_images WHERE gig_id = ? AND image_url = ?`, [
                gigId,
                imageUrl,
            ]);

            const filePath = path.join("public", imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.warn("⚠️ Gagal menghapus file:", filePath);
                });
            }
        }

        // Tambahkan gambar baru jika ada
        for (const imageUrl of newImageUrls) {
            await connection.execute(`INSERT INTO gig_images (gig_id, image_url) VALUES (?, ?)`, [
                gigId,
                imageUrl,
            ]);
        }

        // Jika package baru dikirim → hapus semua lalu insert ulang
        if (packageList.length > 0) {
            await connection.execute(
                `DELETE FROM package_benefits WHERE package_id IN (
                SELECT id FROM packages WHERE gig_id = ?
            )`,
                [gigId]
            );

            await connection.execute(`DELETE FROM packages WHERE gig_id = ?`, [gigId]);

            for (const pkg of packageList) {
                const [packageInsertResult] = await connection.execute<ResultSetHeader>(
                    `INSERT INTO packages (gig_id, name, description, price, delivery_time, revisions)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [gigId, pkg.name, pkg.description, pkg.price, pkg.delivery_time, pkg.revisions]
                );

                const packageId = packageInsertResult.insertId;

                for (const benefit of pkg.benefits) {
                    await connection.execute(
                        `INSERT INTO package_benefits (package_id, benefit) VALUES (?, ?)`,
                        [packageId, benefit]
                    );
                }
            }
        }

        await connection.commit();
        res.status(200).json({ message: "Gig berhasil diperbarui." });
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error update gig:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat update gig." });
    } finally {
        connection.release();
    }
}

export async function deleteGig(req: AuthRequest, res: Response) {
    const gigId = Number(req.params.id);

    if (!req.user || !gigId) {
        return res.status(400).json({ message: "User atau ID tidak valid." });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Pastikan gig milik user
        const [gigRows] = await connection.query(
            `SELECT * FROM gigs WHERE id = ? AND user_id = ?`,
            [gigId, req.user.id]
        );

        if ((gigRows as any[]).length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Gig tidak ditemukan atau bukan milik Anda." });
        }

        // Ambil semua gambar untuk dihapus dari file system
        const [imageRows] = await connection.query(
            `SELECT image_url FROM gig_images WHERE gig_id = ?`,
            [gigId]
        );

        const imagePaths = (imageRows as any[]).map((img) => path.join("public", img.image_url));

        // Hapus file dari sistem
        for (const filePath of imagePaths) {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.warn("⚠️ Gagal hapus file:", filePath);
                });
            }
        }

        // Hapus gig (otomatis cascade ke images, packages, package_benefits)
        await connection.execute(`DELETE FROM gigs WHERE id = ? AND user_id = ?`, [
            gigId,
            req.user.id,
        ]);

        await connection.commit();
        res.status(200).json({ message: "Gig berhasil dihapus." });
    } catch (error) {
        await connection.rollback();
        console.error("❌ Gagal hapus gig:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat menghapus gig." });
    } finally {
        connection.release();
    }
}
