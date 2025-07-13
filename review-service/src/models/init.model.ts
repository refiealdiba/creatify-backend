// import db from "../config/db";

// export async function initReviewTable() {
//     const createTableQuery = `
//         CREATE TABLE IF NOT EXISTS reviews (
//             id BIGINT AUTO_INCREMENT PRIMARY KEY,
//             gig_id INT NOT NULL,
//             user_id INT NOT NULL,
//             name VARCHAR(255) NOT NULL,
//             profile_image VARCHAR(255) NULL,
//             rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
//             comment TEXT,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//         );
//     `;

//     const dummy = `
//         INSERT INTO reviews (gig_id, user_id, rating, name, comment)
//         VALUES (1, 1, 5, 'jondoe', 'Great service!');
//         `;

//     try {
//         await db.query(createTableQuery);
//         console.log("Reviews table initialized successfully.");

//         await db.query(dummy);
//         console.log("Dummy data inserted into reviews table successfully.");
//     } catch (error) {
//         console.error("Error initializing reviews table:", error);
//     }
// }
