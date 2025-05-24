const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const paymentController = {
	// Create a new payment with selected dates
	createPayment: async (req, res) => {
		try {
			const {
				customerId,
				packageId,
				amount,
				paymentDate,
				selectedDates,
				paymentMethod,
			} = req.body;

			// Validate input
			if (
				!customerId ||
				!packageId ||
				!amount ||
				!paymentDate ||
				!selectedDates ||
				!selectedDates.length
			) {
				return res.status(400).json({ error: "Missing required fields" });
			}

			// Pastikan data numerik dikonversi dengan benar
			const userIdInt = parseInt(customerId, 10);
			const packageIdInt = parseInt(packageId, 10);
			const amountFloat = parseFloat(amount);

			if (isNaN(userIdInt) || isNaN(packageIdInt) || isNaN(amountFloat)) {
				return res.status(400).json({ error: "Invalid numeric values" });
			}

			// Urutkan selectedDates untuk memastikan startDate dan endDate benar
			const sortedDates = [...selectedDates].sort();
			const startDate = new Date(sortedDates[0]);
			const endDate = new Date(sortedDates[sortedDates.length - 1]);

			// Validate dates
			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				return res.status(400).json({ error: "Invalid date format" });
			}

			// Check for duplicate payment dates in existing payments
			const existingPayments = await prisma.payment.findMany({
				where: {
					user_id: userIdInt,
					status: "CONFIRMED",
				},
				select: {
					payment_dates: true,
				},
			});

			const existingDatesSet = new Set();
			existingPayments.forEach((payment) => {
				if (payment.payment_dates) {
					try {
						const dates = JSON.parse(payment.payment_dates);
						dates.forEach((date) => existingDatesSet.add(date));
					} catch (e) {
						console.error("Failed to parse payment_dates:", e);
					}
				}
			});

			const duplicateDates = selectedDates.filter((date) =>
				existingDatesSet.has(date)
			);

			if (duplicateDates.length > 0) {
				return res.status(400).json({
					error: "Some selected dates have already been paid",
					duplicateDates,
				});
			}

			// Calculate payment period based on method
			let paymentPeriod = {};

			if (paymentMethod === "MONTHLY") {
				paymentPeriod.payment_months = Math.ceil(selectedDates.length / 30);
			} else if (paymentMethod === "WEEKLY") {
				// payment_weeks is not a valid field in schema, so skip setting it
			}

			try {
				// Start a transaction to ensure data consistency
				const payment = await prisma.$transaction(async (prisma) => {
					// Create payment record
					const newPayment = await prisma.payment.create({
						data: {
							user_id: userIdInt,
							package_id: packageIdInt,
							amount: amountFloat,
							payment_date: new Date(paymentDate), // ini satu tanggal utama
							status: "CONFIRMED",
							payment_start_date: startDate,
							payment_dates: JSON.stringify(selectedDates), // simpan array tanggal dalam bentuk string JSON di kolom `payment_dates`
							...paymentPeriod,
						},
						include: {
							user: true,
							package: true,
						},
					});

					return newPayment;
				});

				return res.status(201).json({
					success: true,
					message: "Payment created successfully",
					payment,
				});
			} catch (transactionError) {
				console.error("Transaction error:", transactionError);
				return res.status(500).json({
					error: "Failed to process payment transaction",
					details: transactionError.message,
				});
			}
		} catch (error) {
			console.error("Error creating payment:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},

	// New function to get paid dates by user ID
	getPaidDatesByUserId: async (req, res) => {
		try {
			const { userId } = req.params;
			const userIdInt = parseInt(userId, 10);

			if (isNaN(userIdInt)) {
				return res.status(400).json({ error: "Invalid user ID" });
			}

			const payments = await prisma.payment.findMany({
				where: {
					user_id: userIdInt,
					status: "CONFIRMED",
				},
				select: {
					payment_dates: true,
				},
			});

			const paidDatesSet = new Set();
			payments.forEach((payment) => {
				if (payment.payment_dates) {
					try {
						const dates = JSON.parse(payment.payment_dates);
						dates.forEach((date) => paidDatesSet.add(date));
					} catch (e) {
						console.error("Failed to parse payment_dates:", e);
					}
				}
			});

			const paidDates = Array.from(paidDatesSet);

			return res.status(200).json({ paid_dates: paidDates });
		} catch (error) {
			console.error("Error fetching paid dates:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},

	// Get all payments with user and package details
	getAllPayments: async (req, res) => {
		try {
			const payments = await prisma.payment.findMany({
				include: {
					user: {
						select: {
							id: true,
							name: true,
						},
					},
					package: {
						select: {
							id: true,
							name: true,
							payment_method: true,
							payment_amount: true,
						},
					},
				},
				orderBy: {
					payment_date: "desc",
				},
			});

			return res.status(200).json(payments);
		} catch (error) {
			console.error("Error fetching payments:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},

	// Get payments by customer ID
	getPaymentsByCustomerId: async (req, res) => {
		try {
			const { customerId } = req.params;

			if (!customerId || isNaN(parseInt(customerId, 10))) {
				return res.status(400).json({ error: "Invalid customer ID" });
			}

			const customerIdInt = parseInt(customerId, 10);

			const payments = await prisma.payment.findMany({
				where: { user_id: customerIdInt },
				include: {
					package: true,
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: {
					payment_date: "desc",
				},
			});

			return res.status(200).json(payments);
		} catch (error) {
			console.error("Error fetching customer payments:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},

	// Update payment status
	updatePaymentStatus: async (req, res) => {
		try {
			const { paymentId } = req.params;
			const { status } = req.body;

			if (!paymentId || isNaN(parseInt(paymentId, 10))) {
				return res.status(400).json({ error: "Invalid payment ID" });
			}

			const paymentIdInt = parseInt(paymentId, 10);

			// Validate status
			const validStatuses = ["PENDING", "CONFIRMED", "CANCELED"];
			if (!validStatuses.includes(status)) {
				return res.status(400).json({
					error: "Invalid status value",
					validValues: validStatuses,
				});
			}

			// Get current payment to handle status change properly
			const currentPayment = await prisma.payment.findUnique({
				where: { id: paymentIdInt },
				include: { user: { select: { id: true, paid_dates: true } } },
			});

			if (!currentPayment) {
				return res.status(404).json({ error: "Payment not found" });
			}

			// If changing from CONFIRMED to CANCELED, remove the paid dates from the user
			if (
				currentPayment.status === "CONFIRMED" &&
				status === "CANCELED" &&
				currentPayment.payment_dates &&
				currentPayment.payment_dates.length > 0
			) {
				try {
					await prisma.$transaction(async (prisma) => {
						// Update payment status
						const payment = await prisma.payment.update({
							where: { id: paymentIdInt },
							data: { status },
						});

						// Remove the payment dates from the user's paid_dates
						const userPaidDates = currentPayment.user?.paid_dates || [];
						const paymentDates = currentPayment.payment_dates || [];
						const updatedPaidDates = userPaidDates.filter(
							(date) => !paymentDates.includes(date)
						);

						await prisma.user.update({
							where: { id: currentPayment.user_id },
							data: { paid_dates: updatedPaidDates },
						});

						return payment;
					});

					return res.status(200).json({
						success: true,
						message: "Payment status updated and paid dates adjusted",
					});
				} catch (transactionError) {
					console.error("Transaction error:", transactionError);
					return res.status(500).json({
						error: "Failed to update payment status",
						details: transactionError.message,
					});
				}
			} else {
				// Simple status update without adjusting dates
				const payment = await prisma.payment.update({
					where: { id: paymentIdInt },
					data: { status },
				});

				return res.status(200).json({
					success: true,
					message: "Payment status updated",
					payment,
				});
			}
		} catch (error) {
			console.error("Error updating payment status:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},

	// Mendapatkan ringkasan pembayaran
	getPaymentSummary: async (req, res) => {
		try {
			// Mendapatkan total pembayaran per bulan
			const monthlyPayments = await prisma.$queryRaw`
				SELECT 
					DATE_TRUNC('month', payment_date) AS month,
					SUM(amount) AS total_amount,
					COUNT(*) AS payment_count
				FROM "Payment"
				WHERE status = 'CONFIRMED'
				GROUP BY DATE_TRUNC('month', payment_date)
				ORDER BY month DESC
				LIMIT 12
			`;

			// Mendapatkan total berdasarkan metode pembayaran
			const paymentMethodSummary = await prisma.$queryRaw`
				SELECT 
					p.payment_method,
					SUM(pm.amount) AS total_amount,
					COUNT(*) AS payment_count
				FROM "Payment" pm
				JOIN "Package" p ON pm.package_id = p.id
				WHERE pm.status = 'CONFIRMED'
				GROUP BY p.payment_method
			`;

			return res.status(200).json({
				monthlyPayments,
				paymentMethodSummary,
			});
		} catch (error) {
			console.error("Error getting payment summary:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},

	// Get payment history by customer ID for export
	getPaymentHistoryByCustomerId: async (req, res) => {
		try {
			const { customerId } = req.params;
			const customerIdInt = parseInt(customerId, 10);

			if (isNaN(customerIdInt)) {
				return res.status(400).json({ error: "Invalid customer ID" });
			}

			const payments = await prisma.payment.findMany({
				where: { user_id: customerIdInt },
				select: {
					id: true,
					amount: true,
					payment_date: true,
					payment_dates: true, // ✅ yang ini ada di model
					status: true,
				},

				orderBy: {
					payment_date: "desc",
				},
			});

			return res.status(200).json(payments);
		} catch (error) {
			console.error("Error fetching payment history:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},
	// Get all customers with their payment history for bulk export
	getAllPaymentsForExport: async (req, res) => {
		try {
			const { startDate, endDate, userIds } = req.query;

			// Parse userIds if provided
			let userIdsArray = [];
			if (userIds) {
				userIdsArray = userIds
					.split(",")
					.map((id) => {
						const parsed = parseInt(id, 10);
						return isNaN(parsed) ? null : parsed;
					})
					.filter((id) => id !== null);
			}

			// Validate startDate and endDate
			let validStartDate = null;
			let validEndDate = null;
			if (startDate) {
				const sd = new Date(startDate);
				if (!isNaN(sd.getTime())) {
					validStartDate = sd;
				}
			}
			if (endDate) {
				const ed = new Date(endDate);
				if (!isNaN(ed.getTime())) {
					validEndDate = ed;
				}
			}

			// Build customer filter
			const customerFilter = {
				role: "CUSTOMER",
				...(userIdsArray.length > 0 && { id: { in: userIdsArray } }),
			};

			// Build payments where filter
			const paymentsWhere = {};
			// Temporarily disable date filter for testing
			// if (validStartDate && validEndDate) {
			// 	paymentsWhere.payment_date = {
			// 		gte: validStartDate,
			// 		lte: validEndDate,
			// 	};
			// }

			// Fetch customers with their packages and payments in a single query
			// In getAllPaymentsForExport controller
			const customers = await prisma.user.findMany({
				where: customerFilter,
				include: {
					package: true,
					payments: {
						where: paymentsWhere,
						orderBy: { payment_date: "desc" },
						select: {
							id: true,
							amount: true,
							payment_date: true,
							payment_dates: true,
							status: true,
							package: {
								// Include related package info
								select: {
									payment_method: true,
									payment_amount: true,
								},
							},
						},
					},
				},
			});

			// Structure response with complete payment data
			const result = customers.map((customer) => {
				const totalPaid = customer.payments.reduce(
					(sum, p) => sum + (p.amount || 0),
					0
				);
				const lastPaymentDate = customer.payments[0]?.payment_date || null;

				return {
					customer_id: customer.id,
					customer_name: customer.name,
					package: customer.package
						? {
								id: customer.package.id,
								name: customer.package.name,
								payment_method: customer.package.payment_method,
								payment_amount: customer.package.payment_amount,
						  }
						: null,
					package_start_date: customer.package_start_date,
					payments: customer.payments.map((p) => ({
						id: p.id,
						amount: p.amount,
						payment_date: p.payment_date,
						payment_dates: p.payment_dates ? JSON.parse(p.payment_dates) : [],
						status: p.status,
						payment_method: p.package?.payment_method, // Get from related package
					})),
					total_payments: totalPaid,
					last_payment_date: lastPaymentDate,
				};
			});

			return res.status(200).json(result);
		} catch (error) {
			console.error("Error fetching all payment data:", error);
			return res.status(500).json({
				error: "Internal server error",
				details: error.message,
			});
		}
	},
};

module.exports = paymentController;
