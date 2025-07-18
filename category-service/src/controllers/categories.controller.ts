import { Category } from "../models/categories.model";
import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import db from "../config/db";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query<Category[]>("SELECT * FROM categories ORDER BY name ASC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    try {
        const [rows] = await db.query<Category[]>("SELECT * FROM categories WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        throw error;
    }
};

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Invalid category name" });
    }

    try {
        const [result] = await db.query<ResultSetHeader>(
            "INSERT INTO categories (name) VALUES (?)",
            [name]
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    if (isNaN(id) || !name || typeof name !== "string") {
        return res.status(400).json({ error: "Invalid category ID or name" });
    }

    try {
        const [result] = await db.query<ResultSetHeader>(
            "UPDATE categories SET name = ? WHERE id = ?",
            [name, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({ id, name });
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
    }

    try {
        const [result] = await db.query<ResultSetHeader>("DELETE FROM categories WHERE id = ?", [
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};
