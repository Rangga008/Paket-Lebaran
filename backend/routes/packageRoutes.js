const express = require("express");
const router = express.Router();

const packageController = require("../controllers/packageController");
const paymentController = require("../controllers/paymentController");

// Routes
router.post(
	"/",
	(req, res, next) => {
		console.log("Received package data:", req.body);
		next();
	},
	packageController.createPackage
);
router.get("/", packageController.getAllPackages);

router.get("/:id", packageController.getPackageById);
router.put("/:id", packageController.updatePackage);
router.delete("/:id", packageController.deletePackage);

module.exports = router;
