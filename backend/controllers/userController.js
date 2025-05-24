const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

// Customer controllers
exports.getAllCustomers = async (req, res) => {
	try {
		const { reseller_id, role } = req.query;
		const whereClause = {};
		if (role) {
			whereClause.role = role;
		}
		if (reseller_id) {
			whereClause.reseller_id = parseInt(reseller_id);
		}
		const customers = await prisma.user.findMany({
			where: whereClause,
		});
		res.status(200).json(customers);
	} catch (error) {
		console.error("Error fetching customers:", error);
		res
			.status(500)
			.json({ message: "Failed to fetch customers", error: error.message });
	}
};

// Assign customer to reseller
exports.assignCustomerToReseller = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		let { reseller_id, package_id, payment_method, package_start_date } =
			req.body;

		const existingCustomer = await prisma.user.findUnique({ where: { id } });
		if (!existingCustomer || existingCustomer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Parse package_start_date to Date or null
		if (package_start_date) {
			package_start_date = new Date(package_start_date);
		} else {
			package_start_date = null;
		}

		const updatedCustomer = await prisma.user.update({
			where: { id },
			data: {
				reseller_id: parseInt(reseller_id),
				package_id: parseInt(package_id),
				payment_method,
				package_start_date,
			},
		});

		res.status(200).json(updatedCustomer);
	} catch (error) {
		console.error("Error assigning customer to reseller:", error);
		res.status(500).json({
			message: "Failed to assign customer to reseller",
			error: error.message,
		});
	}
};

// New method to create or update UserPackageSelection
async function saveUserPackageSelection(userId, packageId) {
	const existingSelection = await prisma.userPackageSelection.findUnique({
		where: {
			user_id_package_id: {
				user_id: userId,
				package_id: packageId,
			},
		},
	});

	if (existingSelection) {
		// Update selected_date to now
		return await prisma.userPackageSelection.update({
			where: { id: existingSelection.id },
			data: { selected_date: new Date() },
		});
	} else {
		// Create new selection
		return await prisma.userPackageSelection.create({
			data: {
				user_id: userId,
				package_id: packageId,
				selected_date: new Date(),
			},
		});
	}
}

// Update customer's package and payment method
exports.updateCustomerPackage = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const existingCustomer = await prisma.user.findUnique({ where: { id } });
		if (!existingCustomer || existingCustomer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}
		const { packageId, paymentMethod } = req.body;

		const updatedCustomer = await prisma.user.update({
			where: { id },
			data: {
				package_id: packageId ? parseInt(packageId) : null, // parse to int or null
				payment_method: paymentMethod,
				package_start_date: packageId ? new Date() : null,
			},
		});

		if (packageId) {
			await saveUserPackageSelection(id, parseInt(packageId));
		}

		res.status(200).json(updatedCustomer);
	} catch (error) {
		console.error("Error updating customer package:", error);
		res.status(500).json({
			message: "Failed to update customer package",
			error: error.message,
		});
	}
};

// In your controllers/userController.js
exports.unassignReseller = async (req, res) => {
	const { customerId } = req.params;

	try {
		const updatedCustomer = await prisma.user.update({
			where: { id: Number(customerId) },
			data: {
				reseller_id: null,
				package_id: null,
				payment_method: null,
			},
			include: {
				package: true,
			},
		});

		res.status(200).json({
			message: "Customer unassigned successfully",
			customer: updatedCustomer,
		});
	} catch (error) {
		console.error("Error unassigning reseller:", error);
		res.status(500).json({
			message: "Failed to unassign reseller",
			error: error.message,
		});
	}
};

exports.getAllResellers = async (req, res) => {
	try {
		const resellers = await prisma.user.findMany({
			where: { role: "RESELLER" },
		});
		res.status(200).json(resellers);
	} catch (error) {
		console.error("Error fetching resellers:", error);
		res
			.status(500)
			.json({ message: "Failed to fetch resellers", error: error.message });
	}
};

exports.searchCustomers = async (req, res) => {
	try {
		const { query } = req.query;
		if (!query) {
			return res.status(400).json({ message: "Query parameter is required" });
		}
		const customers = await prisma.user.findMany({
			where: {
				role: "CUSTOMER",
				AND: [
					{
						OR: [
							{ name: { contains: query, mode: "insensitive" } },
							{ phone: { contains: query, mode: "insensitive" } },
						],
					},
				],
			},
		});
		res.status(200).json(customers);
	} catch (error) {
		console.error("Error searching customers:", error);
		res
			.status(500)
			.json({ message: "Failed to search customers", error: error.message });
	}
};

exports.getCustomerById = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const customer = await prisma.user.findUnique({
			where: { id },
		});
		if (!customer || customer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}
		res.status(200).json(customer);
	} catch (error) {
		console.error("Error fetching customer:", error);
		res
			.status(500)
			.json({ message: "Failed to fetch customer", error: error.message });
	}
};

exports.createCustomer = async (req, res) => {
	try {
		let {
			package_id,
			reseller_id,
			package_start_date,
			payment_method = "DAILY",
			password,
			...rest
		} = req.body;

		// Convert package_id and reseller_id to integers if they exist
		if (package_id) {
			package_id = parseInt(package_id);
		}
		if (reseller_id) {
			reseller_id = parseInt(reseller_id);
		}

		// Parse package_start_date to Date or null
		if (package_start_date) {
			package_start_date = new Date(package_start_date);
		} else {
			package_start_date = null;
		}

		// Hash password if provided
		let hashedPassword = undefined;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 10);
		}

		const data = {
			...rest,
			role: "CUSTOMER",
			payment_method, // Include payment method
			package_start_date,
		};

		if (hashedPassword) {
			data.password = hashedPassword;
		}

		if (package_id) {
			data.package = { connect: { id: package_id } };
		}
		if (reseller_id) {
			data.reseller = { connect: { id: reseller_id } };
		}

		const newCustomer = await prisma.user.create({
			data,
		});

		res.status(201).json(newCustomer);
	} catch (error) {
		console.error("Error creating customer:", error);
		res.status(500).json({
			message: "Failed to create customer",
			error: error.message,
		});
	}
};

exports.updateCustomer = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const existingCustomer = await prisma.user.findUnique({ where: { id } });
		if (!existingCustomer || existingCustomer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}

		let { password, ...rest } = req.body;

		let dataToUpdate = { ...rest };

		// Parse package_id to int or null if present
		if (dataToUpdate.package_id !== undefined) {
			dataToUpdate.package_id = dataToUpdate.package_id
				? parseInt(dataToUpdate.package_id)
				: null;
		}

		// Parse package_start_date to Date or null if present
		if (dataToUpdate.package_start_date !== undefined) {
			if (dataToUpdate.package_start_date) {
				dataToUpdate.package_start_date = new Date(
					dataToUpdate.package_start_date
				);
			} else {
				dataToUpdate.package_start_date = null;
			}
		}

		if (password) {
			const hashedPassword = await bcrypt.hash(password, 10);
			dataToUpdate.password = hashedPassword;
		}

		const updatedCustomer = await prisma.user.update({
			where: { id },
			data: dataToUpdate,
		});
		res.status(200).json(updatedCustomer);
	} catch (error) {
		console.error("Error updating customer:", error);
		res
			.status(500)
			.json({ message: "Failed to update customer", error: error.message });
	}
};

// For unassigning a customer from reseller
exports.unassignReseller = async (req, res) => {
	const { customerId } = req.params;

	try {
		// First verify the customer exists
		const customer = await prisma.user.findUnique({
			where: { id: Number(customerId) },
		});

		if (!customer) {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Update to remove reseller association
		const updatedCustomer = await prisma.user.update({
			where: { id: Number(customerId) },
			data: {
				reseller_id: null,
				package_id: null,
				payment_method: null,
			},
		});

		res.status(200).json({
			message: "Customer unassigned successfully",
			customer: updatedCustomer,
		});
	} catch (error) {
		console.error("Error unassigning reseller:", error);
		res.status(500).json({
			message: "Failed to unassign reseller",
			error: error.message,
		});
	}
};

// For deleting a customer
exports.deleteCustomer = async (req, res) => {
	const { id } = req.params;

	if (!id || isNaN(Number(id))) {
		return res.status(400).json({
			message: "Invalid customer ID provided.",
		});
	}

	const customerId = Number(id);

	try {
		// Cek dulu apakah customer-nya ada
		const customer = await prisma.user.findUnique({
			where: { id: customerId },
		});

		if (!customer) {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Hapus relasi-relasi dulu sebelum delete user

		// Hapus semua relasi reseller-customer
		await prisma.resellerCustomer.deleteMany({
			where: {
				OR: [{ customer_id: customerId }, { reseller_id: customerId }],
			},
		});

		// Hapus semua pembayaran yang terkait
		await prisma.payment.deleteMany({
			where: {
				user_id: customerId,
			},
		});

		// Putuskan koneksi user dari reseller dan paket (optional step)
		await prisma.user.update({
			where: { id: customerId },
			data: {
				reseller_id: null,
				package_id: null,
			},
		});

		// Hapus user
		await prisma.user.delete({
			where: { id: customerId },
		});

		res.status(200).json({
			message: "Customer deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting customer:", error);
		res.status(500).json({
			message: "Failed to delete customer",
			error: error.message,
		});
	}
};

// Confirm payment for a customer
exports.confirmPayment = async (req, res) => {
	try {
		const customerId = parseInt(req.params.id);
		const { amount, paymentDate, packageId, selectedDates } = req.body;

		const customer = await prisma.user.findUnique({
			where: { id: customerId },
		});
		if (!customer || customer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Find existing payment record for customer and package
		let payment = await prisma.payment.findFirst({
			where: {
				user_id: customerId,
				package_id: packageId,
			},
		});

		// Parse existing payment_dates JSON or initialize empty array
		let existingDates = [];
		if (payment && payment.payment_dates) {
			try {
				existingDates = JSON.parse(payment.payment_dates);
			} catch {
				existingDates = [];
			}
		}

		// Merge selectedDates with existingDates without duplicates
		const mergedDatesSet = new Set(existingDates);
		if (Array.isArray(selectedDates)) {
			selectedDates.forEach((date) => mergedDatesSet.add(date));
		}
		const mergedDates = Array.from(mergedDatesSet);

		// Calculate new paid amount
		const newPaidAmount = (customer.paid_amount || 0) + amount;

		if (payment) {
			// Update existing payment record
			await prisma.payment.update({
				where: { id: payment.id },
				data: {
					amount: payment.amount + amount,
					payment_dates: JSON.stringify(mergedDates),
					payment_date: paymentDate,
				},
			});
		} else {
			// Create new payment record
			await prisma.payment.create({
				data: {
					user_id: customerId,
					package_id: packageId,
					amount: amount,
					payment_date: paymentDate,
					payment_dates: JSON.stringify(mergedDates),
					status: "CONFIRMED",
				},
			});
		}

		// Update customer paid_amount and last_payment_date
		const updatedCustomer = await prisma.user.update({
			where: { id: customerId },
			data: {
				paid_amount: newPaidAmount,
				last_payment_date: paymentDate,
			},
		});

		res.status(200).json({
			message: "Payment confirmed successfully",
			customer: updatedCustomer,
		});
	} catch (error) {
		console.error("Error confirming payment:", error);
		res
			.status(500)
			.json({ message: "Failed to confirm payment", error: error.message });
	}
};

exports.resetCustomerPassword = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const { newPassword } = req.body;
		if (!newPassword) {
			return res.status(400).json({ message: "New password is required" });
		}

		const existingCustomer = await prisma.user.findUnique({ where: { id } });
		if (!existingCustomer || existingCustomer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await prisma.user.update({
			where: { id },
			data: { password: hashedPassword },
		});

		res.status(200).json({ message: "Password reset successfully" });
	} catch (error) {
		console.error("Error resetting password:", error);
		res
			.status(500)
			.json({ message: "Failed to reset password", error: error.message });
	}
};

exports.getResellerById = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const reseller = await prisma.user.findUnique({
			where: { id },
		});
		if (!reseller || reseller.role !== "RESELLER") {
			return res.status(404).json({ message: "Reseller not found" });
		}
		res.status(200).json(reseller);
	} catch (error) {
		console.error("Error fetching reseller:", error);
		res
			.status(500)
			.json({ message: "Failed to fetch reseller", error: error.message });
	}
};

exports.createReseller = async (req, res) => {
	try {
		const newReseller = await prisma.user.create({
			data: {
				...req.body,
				role: "RESELLER",
			},
		});
		res.status(201).json(newReseller);
	} catch (error) {
		console.error("Error creating reseller:", error);
		res
			.status(500)
			.json({ message: "Failed to create reseller", error: error.message });
	}
};

exports.updateReseller = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const existingReseller = await prisma.user.findUnique({ where: { id } });
		if (!existingReseller || existingReseller.role !== "RESELLER") {
			return res.status(404).json({ message: "Reseller not found" });
		}
		const updatedReseller = await prisma.user.update({
			where: { id },
			data: req.body,
		});
		res.status(200).json(updatedReseller);
	} catch (error) {
		console.error("Error updating reseller:", error);
		res
			.status(500)
			.json({ message: "Failed to update reseller", error: error.message });
	}
};

exports.deleteReseller = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const existingReseller = await prisma.user.findUnique({ where: { id } });
		if (!existingReseller || existingReseller.role !== "RESELLER") {
			return res.status(404).json({ message: "Reseller not found" });
		}
		await prisma.user.delete({ where: { id } });
		res.status(200).json({ message: "Reseller deleted successfully" });
	} catch (error) {
		console.error("Error deleting reseller:", error);
		res
			.status(500)
			.json({ message: "Failed to delete reseller", error: error.message });
	}
};
exports.resetResellerPassword = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const { newPassword } = req.body;

		if (!newPassword) {
			return res.status(400).json({ message: "New password is required" });
		}

		const existingReseller = await prisma.user.findUnique({ where: { id } });

		if (!existingReseller || existingReseller.role !== "RESELLER") {
			return res.status(404).json({ message: "Reseller not found" });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await prisma.user.update({
			where: { id },
			data: { password: hashedPassword },
		});

		res.status(200).json({ message: "Password reset successfully" });
	} catch (error) {
		console.error("Error resetting password:", error);
		res.status(500).json({
			message: "Failed to reset password",
			error: error.message,
		});
	}
};

// Confirm payment for a customer
exports.confirmPayment = async (req, res) => {
	try {
		const customerId = parseInt(req.params.id);
		const { amount, paymentDate, packageId } = req.body;

		const customer = await prisma.user.findUnique({
			where: { id: customerId },
		});
		if (!customer || customer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Calculate new paid amount
		const newPaidAmount = (customer.paid_amount || 0) + amount;

		// Update customer paid_amount and last_payment_date
		const updatedCustomer = await prisma.user.update({
			where: { id: customerId },
			data: {
				paid_amount: newPaidAmount,
				last_payment_date: paymentDate,
			},
		});

		// TODO: Add logic to update payment status based on payment_method and amount

		res.status(200).json({
			message: "Payment confirmed successfully",
			customer: updatedCustomer,
		});
	} catch (error) {
		console.error("Error confirming payment:", error);
		res
			.status(500)
			.json({ message: "Failed to confirm payment", error: error.message });
	}
};
