import dotenv from "dotenv";

dotenv.config();

interface Config {
    port: number;
    // jwtSecret: string;
}

const config: Config = {
    port: 3000,
    // jwtSecret: process.env.JWT_SECRET || "defaultsecret",
};

export default config;
