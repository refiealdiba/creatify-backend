import db from "../config/db";

export async function initUserTable() {
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        no_telp VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('0', '1') NOT NULL DEFAULT 'client',
        bio TEXT,
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    `;

    const insertDummyUserSQL = `
    INSERT INTO users (name, email, no_telp, password, role)
    VALUES (?, ?, ?, ?, ?)
    `;

    try {
        // buat tabel
        await db.query(createTableSQL);
        console.log("✅ Tabel 'users' berhasil dibuat atau sudah ada.");

        // masukkan 1 user dummy
        await db.query(insertDummyUserSQL, [
            "JohnDoe",
            "johndoe@gmail.com",
            "08123456789",
            "rahasia123",
            "0",
        ]);

        console.log("✅ Dummy user berhasil dimasukkan.");
    } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
            console.warn("⚠️ User dummy sudah ada, tidak ditambahkan ulang.");
        } else {
            console.error("❌ Gagal membuat tabel atau insert dummy:", error);
        }
    }
}
