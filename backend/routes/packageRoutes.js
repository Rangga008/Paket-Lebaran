const express = require("express");
const router = express.Router();

const packageController = require("../controllers/packageController");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

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
router.post("/pay", paymentController.handlePayment); // Example route, replace with your actual route
router.get("/status/:id", paymentController.getPaymentStatus);
router.delete("/:id", packageController.deletePackage);

module.exports = router;
