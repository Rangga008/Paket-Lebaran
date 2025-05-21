const db = require("../database");

module.exports = {
	// Add bulk payments
	addBulkPayments: async (payments) => {
		try {
			await db.transaction(
				payments.map((payment) => ({
					query: `
            INSERT INTO payments 
            (user_id, package_id, payment_date, amount, status, payment_start_date, payment_months)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
					params: [
						payment.user_id,
						payment.package_id,
						payment.payment_date,
						payment.amount,
						payment.status,
						payment.payment_start_date,
						payment.payment_months,
					],
				}))
			);

			return payments;
		} catch (error) {
			throw error;
		}
	},

	// Get payments by user ID
	getPaymentsByUserId: async (userId) => {
		try {
			return await db.all(
				`
        SELECT p.*, pk.name as package_name 
        FROM payments p
        JOIN packages pk ON p.package_id = pk.id
        WHERE p.user_id = ?
        ORDER BY p.payment_date DESC
      `,
				[userId]
			);
		} catch (error) {
			throw error;
		}
	},

	// Get all payments
	getAllPayments: async () => {
		try {
			return await db.all(`
        SELECT p.*, u.name as user_name, pk.name as package_name 
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN packages pk ON p.package_id = pk.id
        ORDER BY p.payment_date DESC
      `);
		} catch (error) {
			throw error;
		}
	},

	// Update payment status
	updatePaymentStatus: async (id, status) => {
		try {
			await db.run("UPDATE payments SET status = ? WHERE id = ?", [status, id]);
			return await db.get("SELECT * FROM payments WHERE id = ?", [id]);
		} catch (error) {
			throw error;
		}
	},

	// Handle payment processing
	handlePayment: async (req, res) => {
		try {
			const {
				user_id,
				package_id,
				amount,
				payment_date,
				payment_start_date,
				payment_months,
			} = req.body;
			if (
				!user_id ||
				!package_id ||
				!amount ||
				!payment_date ||
				!payment_start_date ||
				!payment_months
			) {
				return res
					.status(400)
					.json({ error: "Missing required payment fields" });
			}

			const payment = {
				user_id,
				package_id,
				amount,
				payment_date,
				status: "pending",
				payment_start_date,
				payment_months,
			};

			await db.run(
				`INSERT INTO payments (user_id, package_id, payment_date, amount, status, payment_start_date, payment_months) VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					payment.user_id,
					payment.package_id,
					payment.payment_date,
					payment.amount,
					payment.status,
					payment.payment_start_date,
					payment.payment_months,
				]
			);

			return res
				.status(201)
				.json({ message: "Payment processed successfully", payment });
		} catch (error) {
			console.error("Error processing payment:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	},

	// Get payment status by payment ID
	getPaymentStatus: async (req, res) => {
		try {
			const { id } = req.params;
			const payment = await db.get("SELECT * FROM payments WHERE id = ?", [id]);
			if (!payment) {
				return res.status(404).json({ error: "Payment not found" });
			}
			return res.status(200).json({ status: payment.status });
		} catch (error) {
			console.error("Error fetching payment status:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	},
};
