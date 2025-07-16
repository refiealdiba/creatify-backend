const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

const benefitRoutes = require("./routes/benefitRoutes");
app.use("/api/benefits", benefitRoutes);

app.listen(port, () => {
  console.log(`Benefit Service running on port ${port}`);
});
