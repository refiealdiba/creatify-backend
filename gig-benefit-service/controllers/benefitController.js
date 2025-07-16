const db = require("../config/db");

// GET all benefits by package ID
exports.getBenefitsByPackage = (req, res) => {
  const { packageId } = req.params;
  db.query(
    "SELECT * FROM gig_package_benefits WHERE package_id = ?",
    [packageId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

// POST a single benefit
exports.createBenefit = (req, res) => {
  const { package_id, benefit } = req.body;
  if (!package_id || !benefit) {
    return res
      .status(400)
      .json({ error: "package_id and benefit are required" });
  }

  db.query(
    "INSERT INTO gig_package_benefits (package_id, benefit) VALUES (?, ?)",
    [package_id, benefit],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Benefit added", id: result.insertId });
    }
  );
};

// POST multiple benefits (bulk insert)
exports.createBenefitsBulk = (req, res) => {
  const benefits = req.body;

  if (!Array.isArray(benefits) || benefits.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid input: must be a non-empty array" });
  }

  const values = benefits.map((b) => [b.package_id, b.benefit]);

  db.query(
    "INSERT INTO gig_package_benefits (package_id, benefit) VALUES ?",
    [values],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Benefits added", count: result.affectedRows });
    }
  );
};

// PUT update a benefit
exports.updateBenefit = (req, res) => {
  const { benefit } = req.body;
  const id = req.params.id;

  if (!benefit) {
    return res.status(400).json({ error: "benefit is required" });
  }

  db.query(
    "UPDATE gig_package_benefits SET benefit = ? WHERE id = ?",
    [benefit, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Benefit not found" });
      }

      res.json({ message: "Benefit updated" });
    }
  );
};

// DELETE a benefit
exports.deleteBenefit = (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM gig_package_benefits WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Benefit not found" });
      }

      res.json({ message: "Benefit deleted" });
    }
  );
};
