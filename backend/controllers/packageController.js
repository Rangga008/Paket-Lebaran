const packageModel = require("../models/packageModel");
const productsModel = require("../models/productModel");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	createPackage: async (req, res) => {
		try {
			const { name, description, payment_method, payment_amount, productIds } =
				req.body;

			if (!name || !payment_method || !productIds?.length) {
				return res.status(400).json({ message: "Missing required fields" });
			}

			const newPackage = await prisma.package.create({
				data: {
					name,
					description,
					payment_method,
					payment_amount: parseFloat(payment_amount),
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
		const { name, description, payment_method, payment_amount, productIds } =
			req.body;
		try {
			const updatedPackage = await packageModel.updatePackage(
				id,
				name,
				description,
				payment_method,
				payment_amount,
				productIds
			);
			res.status(200).json(updatedPackage);
		} catch (error) {
			res.status(500).json({ message: "Error updating package", error });
		}
	},

	// Delete a package
	deletePackage: async (req, res) => {
		const { id } = req.params;
		try {
			await packageModel.deletePackage(id);
			res.status(200).json({ message: `Package with id ${id} deleted` });
		} catch (error) {
			res.status(500).json({ message: "Error deleting package", error });
		}
	},
};
