import db from "../config/db";

export async function initDatabase() {
    const createTableGigs = `
        CREATE TABLE IF NOT EXISTS gigs (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            user_id BIGINT,
            title VARCHAR(150),
            description TEXT,
            category_id BIGINT,
            price DECIMAL(10,2),
            delivery_time INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;

    const createTablePackages = `
        CREATE TABLE IF NOT EXISTS packages (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            gig_id BIGINT,
            name VARCHAR(100),
            description TEXT,
            price DECIMAL(10,2),
            delivery_time INT,
            revisions INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
        );
    `;

    const createTablePackageBenefits = `
        CREATE TABLE IF NOT EXISTS package_benefits (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            package_id BIGINT,
            benefit TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
        );
    `;

    const createTableGigImages = `
        CREATE TABLE IF NOT EXISTS gig_images (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            gig_id BIGINT,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
        );
    `;

    try {
        await db.execute(createTableGigs);
        await db.execute(createTablePackages);
        await db.execute(createTablePackageBenefits);
        await db.execute(createTableGigImages);
        console.log("✅ Tables created successfully.");

        // Insert dummy GIG
        const [gigResult]: any = await db.execute(
            `
            INSERT INTO gigs (user_id, title, description, category_id, price, delivery_time)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                1,
                "Desain Logo Profesional",
                "Saya akan membuat logo keren untuk bisnis Anda",
                1,
                10.0,
                3,
            ]
        );
        const gigId = gigResult.insertId;

        // Insert dummy packages
        const [basicRes]: any = await db.execute(
            `
            INSERT INTO packages (gig_id, name, description, price, delivery_time, revisions)
            VALUES (?, 'Basic', '1 logo PNG', 10.00, 2, 1)
        `,
            [gigId]
        );
        const basicId = basicRes.insertId;

        const [standardRes]: any = await db.execute(
            `
            INSERT INTO packages (gig_id, name, description, price, delivery_time, revisions)
            VALUES (?, 'Standard', '2 logo PNG + Source file', 25.00, 3, 2)
        `,
            [gigId]
        );
        const standardId = standardRes.insertId;

        const [premiumRes]: any = await db.execute(
            `
            INSERT INTO packages (gig_id, name, description, price, delivery_time, revisions)
            VALUES (?, 'Premium', '3 logo semua format', 50.00, 5, 3)
        `,
            [gigId]
        );
        const premiumId = premiumRes.insertId;

        // Insert dummy benefits
        const benefits = [
            { packageId: basicId, text: "1 file PNG" },
            { packageId: basicId, text: "Revisi 1x" },
            { packageId: standardId, text: "2 file PNG + Source" },
            { packageId: standardId, text: "Revisi 2x" },
            { packageId: premiumId, text: "3 desain lengkap" },
            { packageId: premiumId, text: "Semua format file" },
            { packageId: premiumId, text: "Revisi tanpa batas" },
        ];

        for (const b of benefits) {
            await db.execute(
                `
                INSERT INTO package_benefits (package_id, benefit) VALUES (?, ?)`,
                [b.packageId, b.text]
            );
        }

        // Insert dummy images
        const images = ["uploads/gig1-img1.jpg", "uploads/gig1-img2.jpg", "uploads/gig1-img3.jpg"];

        for (const img of images) {
            await db.execute(
                `
                INSERT INTO gig_images (gig_id, image_url) VALUES (?, ?)`,
                [gigId, img]
            );
        }

        console.log("✅ Dummy data inserted successfully.");
    } catch (error) {
        console.error("❌ Error initializing database:", error);
    }
}
