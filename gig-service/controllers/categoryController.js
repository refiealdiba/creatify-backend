const db = require("../config/db");

// Ambil semua kategori
exports.getAllCategories = (req, res) => {
  const sql = `SELECT id, name, LOWER(REPLACE(name, ' ', '-')) AS slug FROM categories`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Tambah kategori baru
exports.createCategory = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  db.query(
    "INSERT INTO categories (name) VALUES (?)",
    [name],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Category created", id: result.insertId });
    }
  );
};

// Ubah kategori
exports.updateCategory = (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  db.query(
    "UPDATE categories SET name = ? WHERE id = ?",
    [name, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Category not found" });
      res.json({ message: "Category updated" });
    }
  );
};

// Hapus kategori
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  });
};
