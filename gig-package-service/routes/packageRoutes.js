const express = require("express");
const router = express.Router();
const controller = require("../controllers/packageController");

router.get("/gig/:gigId", controller.getPackagesByGig);
router.post("/", controller.createPackage);
router.put("/:id", controller.updatePackage);
router.delete("/:id", controller.deletePackage);

module.exports = router;
