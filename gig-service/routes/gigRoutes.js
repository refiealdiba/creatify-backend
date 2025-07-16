const express = require("express");
const router = express.Router();
const controller = require("../controllers/gigController");
const upload = require("../middlewares/upload"); // ⬅️ pakai middleware yang baru

router.get("/", controller.getAllGigs);
router.get("/:id", controller.getGigById);
router.post("/", controller.createGig);
router.put("/:id", controller.updateGig);
router.delete("/:id", controller.deleteGig);

// 🔹 Upload gambar (max 5)
router.post(
  "/:id/images",
  upload.array("images", 5),
  controller.uploadGigImages
);
router.get("/:id/images", controller.getGigImages);
router.delete("/images/:imageId", controller.deleteGigImage);

module.exports = router;
