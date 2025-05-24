const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create a new payment
router.post("/", paymentController.createPayment);

// Get all payments
router.get("/", paymentController.getAllPayments);

// Get payments by customer ID
router.get("/customer/:customerId", paymentController.getPaymentsByCustomerId);

// Update payment status
router.patch("/:paymentId/status", paymentController.updatePaymentStatus);

// Get payment summary (new endpoint)
router.get("/summary", paymentController.getPaymentSummary);

// Get paid dates by user ID
router.get("/paid-dates/:userId", paymentController.getPaidDatesByUserId);

// Get payment history by customer ID
router.get(
	"/history/:customerId",
	paymentController.getPaymentHistoryByCustomerId
);

// Get all payments for export with optional filters
router.get("/export-all", paymentController.getAllPaymentsForExport);

module.exports = router;
