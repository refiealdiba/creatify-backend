import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQL_DATABASE,
});

export async function testDbConnection() {
    try {
        const connection = await db.getConnection();
        console.log("Database connection successful!");
        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

export default db;
