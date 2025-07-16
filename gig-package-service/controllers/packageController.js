const db = require("../config/db");

exports.getPackagesByGig = (req, res) => {
  const { gigId } = req.params;

  const pkgSql = "SELECT * FROM gig_packages WHERE gig_id = ?";
  db.query(pkgSql, [gigId], (err, packages) => {
    if (err) return res.status(500).json({ error: err.message });
    if (packages.length === 0) return res.json([]);

    const pkgIds = packages.map((p) => p.id);
    const placeholders = pkgIds.map(() => "?").join(",");

    const benSql = `
      SELECT package_id, benefit
      FROM gig_package_benefits
      WHERE package_id IN (${placeholders})
    `;

    db.query(benSql, pkgIds, (err2, benefits) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const finalPackages = packages.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        deliveryTime: p.delivery_time,
        revisions: p.revisions ?? 1,
        description: p.description,
        benefits: benefits
          .filter((b) => b.package_id === p.id)
          .map((b) => b.benefit),
      }));

      res.json(finalPackages);
    });
  });
};

exports.createPackage = (req, res) => {
  const { gig_id, name, price, delivery_time, revisions, description } =
    req.body;

  const sql = `
    INSERT INTO gig_packages
      (gig_id, name, price, delivery_time, revisions, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [gig_id, name, price, delivery_time, revisions, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Package created", id: result.insertId });
    }
  );
};

exports.updatePackage = (req, res) => {
  const { id } = req.params;
  const { name, price, delivery_time, revisions, description } = req.body;

  const sql = `
    UPDATE gig_packages
    SET name=?, price=?, delivery_time=?, revisions=?, description=?
    WHERE id=?
  `;

  db.query(
    sql,
    [name, price, delivery_time, revisions, description, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Package updated" });
    }
  );
};

exports.deletePackage = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM gig_package_benefits WHERE package_id=?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query("DELETE FROM gig_packages WHERE id=?", [id], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: "Package and its benefits deleted" });
      });
    }
  );
};
