const express = require("express");
const cors = require("cors");
require("dotenv").config();

const packageRoutes = require("./routes/packageRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static image files from 'uploads' folder (if needed)
app.use("/uploads", express.static("uploads"));

app.use("/api/packages", packageRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Package service running on port ${PORT}`);
});
