const express = require("express");
const router = express.Router();
const controller = require("../controllers/benefitController");

router.get("/package/:packageId", controller.getBenefitsByPackage);
router.post("/", controller.createBenefit);
router.post("/bulk", controller.createBenefitsBulk);
router.put("/:id", controller.updateBenefit);
router.delete("/:id", controller.deleteBenefit);

module.exports = router;
