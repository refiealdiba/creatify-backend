const db = require("../config/db");
const path = require("path");

// Get all gigs
exports.getAllGigs = (req, res) => {
  const sql = `
    SELECT g.*, c.name AS category_name
    FROM gigs g
    LEFT JOIN categories c ON g.category_id = c.id
    ORDER BY g.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get single gig by ID
exports.getGigById = (req, res) => {
  const gigId = req.params.id;

  const sql = `
    SELECT g.*, c.name AS category_name
    FROM gigs g
    LEFT JOIN categories c ON g.category_id = c.id
    WHERE g.id = ?
  `;

  db.query(sql, [gigId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Gig not found" });

    res.json(rows[0]);
  });
};

// Create a new gig
exports.createGig = (req, res) => {
  const {
    user_id,
    user_name,
    category_id,
    title,
    description,
    price,
    delivery_time,
    image,
  } = req.body;

  if (!user_id || !user_name || !title || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const slug = title.toLowerCase().replace(/\s+/g, "-");

  const sql = `
    INSERT INTO gigs (
      user_id, user_name, category_id, title, slug, description, price, delivery_time, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      user_name,
      category_id,
      title,
      slug,
      description,
      price,
      delivery_time,
      image,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ message: "Gig created", id: result.insertId });
    }
  );
};

// Update a gig
exports.updateGig = (req, res) => {
  const gigId = req.params.id;
  const { title, description, price, delivery_time, image, category_id } =
    req.body;

  const sql = `
    UPDATE gigs
    SET title = ?, description = ?, price = ?, delivery_time = ?, image = ?, category_id = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [title, description, price, delivery_time, image, category_id, gigId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Gig not found" });
      }

      res.json({ message: "Gig updated" });
    }
  );
};

// Delete a gig
exports.deleteGig = (req, res) => {
  const gigId = req.params.id;

  db.query("DELETE FROM gigs WHERE id = ?", [gigId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.json({ message: "Gig deleted" });
  });
};

// Get all images for a gig
exports.getGigImages = (req, res) => {
  const gigId = req.params.id;

  const sql = "SELECT * FROM gig_images WHERE gig_id = ?";
  db.query(sql, [gigId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Optionally map full URLs
    const mapped = rows.map((img) => ({
      ...img,
      url: `${req.protocol}://${req.get("host")}/uploads/${img.image_path}`,
    }));

    res.json(mapped);
  });
};

// Upload images for a gig
exports.uploadGigImages = (req, res) => {
  const gigId = req.params.id;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  const imagePaths = files.map((file) => file.filename);
  const values = imagePaths.map((img) => [gigId, img]);

  const sql = "INSERT INTO gig_images (gig_id, image_path) VALUES ?";

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Images uploaded",
      uploaded: imagePaths,
      inserted: result.affectedRows,
    });
  });
};

// Delete a single image
exports.deleteGigImage = (req, res) => {
  const imageId = req.params.imageId;

  const sql = "DELETE FROM gig_images WHERE id = ?";
  db.query(sql, [imageId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.json({ message: "Image deleted" });
  });
};
