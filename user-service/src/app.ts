import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./config/db";
// import { initUserTable } from "./models/init.model";
import authRouter from "./routes/user.auth.routes";
import userRouter from "./routes/user.routes";

dotenv.config();
const app = express();

app.use(
    cors({
        origin: "*", // Allow all origins for simplicity, adjust as needed
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRouter);
app.use("/me", userRouter);

testDbConnection();
// initUserTable();

export default app;
