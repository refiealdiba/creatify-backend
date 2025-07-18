import db from "../config/db";

export async function initCategories() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS categories (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const categories = [
        "Design",
        "Writing",
        "Programming",
        "Marketing",
        "Video Editing",
        "Translation",
        "Voice Over",
        "UI/UX",
        "Animation",
        "Music Production",
    ];

    try {
        await db.execute(createTableQuery);
        console.log("✅ Table 'categories' created successfully.");

        // Cek apakah sudah ada data
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM categories");
        const total = (rows as any[])[0].total;

        if (total === 0) {
            for (const name of categories) {
                await db.execute("INSERT INTO categories (name) VALUES (?)", [name]);
            }
            console.log("✅ Dummy categories inserted.");
        } else {
            console.log("ℹ️ Categories already exist. Skipping insert.");
        }
    } catch (error) {
        console.error("❌ Error initializing categories:", error);
    }
}
