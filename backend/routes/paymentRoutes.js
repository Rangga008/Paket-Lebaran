const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, paymentController.handlePayment);
router.post("/bulk", authMiddleware, paymentController.addBulkPayments);
router.get(
	"/user/:userId",
	authMiddleware,
	paymentController.getPaymentsByUserId
);

module.exports = router;
