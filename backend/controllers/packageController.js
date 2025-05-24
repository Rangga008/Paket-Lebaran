const packageModel = require("../models/packageModel");
const productsModel = require("../models/productModel");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	createPackage: async (req, res) => {
		try {
			const {
				name,
				description,
				payment_method,
				payment_amount,
				payment_months,
				productIds,
			} = req.body;

			if (!name || !payment_method || !productIds?.length) {
				return res.status(400).json({ message: "Missing required fields" });
			}

			const newPackage = await prisma.package.create({
				data: {
					name,
					description,
					payment_method,
					payment_amount: parseFloat(payment_amount),
					payment_months,
					products: {
						connect: productIds.map((id) => ({ id })),
					},
				},
				include: {
					products: true,
				},
			});

			res.status(201).json(newPackage);
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({ message: error.message });
		}
	},

	handlePayment: (req, res) => {
		const { amount, method } = req.body;
		// Your payment logic here
		res.status(200).json({ message: "Payment processed" });
	},

	updatePackage: async (req, res) => {
		const { id } = req.params;
		const {
			name,
			description,
			payment_method,
			payment_amount,
			payment_months,
			productIds,
		} = req.body;

		try {
			const updatedPackage = await prisma.package.update({
				where: { id: Number(id) },
				data: {
					name,
					description,
					payment_method,
					payment_amount: parseFloat(payment_amount),
					payment_months: parseInt(payment_months),
					products: {
						set: productIds.map((id) => ({ id: Number(id) })),
					},
				},
				include: {
					products: true,
				},
			});

			res.status(200).json(updatedPackage);
		} catch (error) {
			console.error("Error updating package:", error);
			res.status(500).json({ message: "Error updating package", error });
		}
	},

	getPaymentStatus: (req, res) => {
		const { id } = req.params;
		// Fetch payment status logic here
		res.status(200).json({ message: `Payment status for ID: ${id}` });
	},

	// Get all packages

	// Update getAllPackages to include products
	getAllPackages: async (req, res) => {
		try {
			const { search, sort = "desc" } = req.query;

			const packages = await prisma.package.findMany({
				where: search
					? {
							name: { contains: search, mode: "insensitive" },
					  }
					: undefined,
				orderBy: {
					id: sort === "asc" ? "asc" : "desc",
				},
				include: {
					products: true, // This is what was missing
				},
			});

			res.status(200).json(packages);
		} catch (error) {
			console.error("Error fetching packages:", error);
			res.status(500).json({
				error: "Failed to load packages",
				details: error.message,
			});
		}
	},

	// Fix getPackageById (it was querying products instead of packages)
	getPackageById: async (req, res) => {
		const { id } = req.params;
		try {
			const package = await prisma.package.findUnique({
				where: { id: Number(id) },
				include: {
					products: true,
				},
			});

			if (!package) {
				return res.status(404).json({ message: "Package not found" });
			}

			res.status(200).json(package);
		} catch (error) {
			res.status(500).json({
				message: "Error fetching package",
				error: error.message,
			});
		}
	},
	// Get a package by ID

	// Update a package
	updatePackage: async (req, res) => {
		const { id } = req.params;
		const {
			name,
			description,
			payment_method,
			payment_amount,
			payment_months,
			productIds,
		} = req.body;
		try {
			const updatedPackage = await packageModel.updatePackage(
				id,
				name,
				description,
				payment_method,
				payment_amount,
				payment_months,
				productIds
			);
			res.status(200).json(updatedPackage);
		} catch (error) {
			res.status(500).json({ message: "Error updating package", error });
		}
	},

	// Delete package
	// Delete package
	deletePackage: async (req, res) => {
		const { id } = req.params;
		try {
			// First, disconnect all product relations
			await prisma.package.update({
				where: { id: Number(id) },
				data: {
					products: {
						set: [], // This disconnects all related products
					},
				},
			});

			// Set package_id to null for users referencing this package
			await prisma.user.updateMany({
				where: { package_id: Number(id) },
				data: { package_id: null },
			});

			// Delete payments referencing this package
			await prisma.payment.deleteMany({
				where: { package_id: Number(id) },
			});

			// Then delete the package
			await prisma.package.delete({
				where: { id: Number(id) },
			});

			res
				.status(200)
				.json({ message: `Package with id ${id} deleted successfully` });
		} catch (error) {
			console.error("Error deleting package:", error);
			res.status(500).json({
				message: "Error deleting package",
				error: error.message,
			});
		}
	},
};
