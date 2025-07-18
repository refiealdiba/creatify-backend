import express from "express";
import cors from "cors";
import categoriesRouter from "./routes/categories.route";
import { testConnectionDb } from "./config/db";
import { initCategories } from "./models/init.model";

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/categories", categoriesRouter);

testConnectionDb();
initCategories();

export default app;
