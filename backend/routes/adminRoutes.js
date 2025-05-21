const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin routes
router.get(
	"/packages",
	authMiddleware,
	adminMiddleware,
	adminController.getAllPackages
);
router.get(
	"/products",
	authMiddleware,
	adminMiddleware,
	adminController.getAllProducts
);
router.post(
	"/products",
	authMiddleware,
	adminMiddleware,
	adminController.createProduct
);
router.post(
	"/packages",
	authMiddleware,
	adminMiddleware,
	adminController.createPackage
);
router.get(
	"/users/customers",
	authMiddleware,
	adminMiddleware,
	adminController.getAllCustomers
);
router.get(
	"/users/resellers",
	authMiddleware,
	adminMiddleware,
	adminController.getAllResellers
);
router.post(
	"/payments/bulk",
	authMiddleware,
	adminMiddleware,
	adminController.createBulkPayments
);

module.exports = router;
