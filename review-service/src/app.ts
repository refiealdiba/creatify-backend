import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./config/db";
// import { initReviewTable } from "./models/init.model";
import reviewRouter from "./routes/review.route";

dotenv.config();
const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/review", reviewRouter);

testDbConnection();
// initReviewTable();

export default app;
