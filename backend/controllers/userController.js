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
		const { reseller_id, package_id, payment_method } = req.body;

		const existingCustomer = await prisma.user.findUnique({ where: { id } });
		if (!existingCustomer || existingCustomer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}

		const updatedCustomer = await prisma.user.update({
			where: { id },
			data: {
				reseller_id: parseInt(reseller_id),
				package_id: parseInt(package_id),
				payment_method,
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
				package_id: packageId,
				payment_method: paymentMethod,
			},
		});
		res.status(200).json(updatedCustomer);
	} catch (error) {
		console.error("Error updating customer package:", error);
		res.status(500).json({
			message: "Failed to update customer package",
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

		// Hash password if provided
		let hashedPassword = undefined;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 10);
		}

		const data = {
			...rest,
			role: "CUSTOMER",
			payment_method, // Include payment method
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

exports.deleteCustomer = async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const existingCustomer = await prisma.user.findUnique({ where: { id } });
		if (!existingCustomer || existingCustomer.role !== "CUSTOMER") {
			return res.status(404).json({ message: "Customer not found" });
		}
		await prisma.user.delete({ where: { id } });
		res.status(200).json({ message: "Customer deleted successfully" });
	} catch (error) {
		console.error("Error deleting customer:", error);
		res
			.status(500)
			.json({ message: "Failed to delete customer", error: error.message });
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
		res
			.status(500)
			.json({ message: "Failed to reset password", error: error.message });
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
