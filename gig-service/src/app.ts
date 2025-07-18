import express from "express";
import cors from "cors";
import { testDbConnection } from "./config/db";
import gigRouter from "./routes/gig.route";
// import { initDatabase } from "./models/init.model";

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/gigs", gigRouter);

testDbConnection();
// initDatabase();

export default app;
