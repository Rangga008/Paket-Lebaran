// prisma/models/packageModel.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	// Mendapatkan semua package beserta produk terkait
	getAllPackages: async () => {
		return await prisma.package.findMany({
			include: {
				products: true, // Include related products
			},
		});
	},

	// Membuat package baru
	addPackage: async (
		name,
		description,
		payment_method,
		payment_amount,
		productIds
	) => {
		return await prisma.package.create({
			data: {
				name,
				description,
				payment_method,
				payment_amount,
				products: {
					connect: productIds.map((id) => ({ id })),
				},
			},
			include: {
				products: true,
			},
		});
	},

	// Mendapatkan package by ID
	getPackageById: async (id) => {
		return await prisma.package.findUnique({
			where: { id: Number(id) },
			include: { products: true },
		});
	},

	// Update package
	updatePackage: async (
		id,
		name,
		description,
		payment_method,
		payment_amount,
		productIds
	) => {
		return await prisma.package.update({
			where: { id: Number(id) },
			data: {
				name,
				description,
				payment_method,
				payment_amount,
				products: {
					set: productIds.map((id) => ({ id })),
				},
			},
			include: { products: true },
		});
	},

	// Delete package
	deletePackage: async (id) => {
		return await prisma.package.delete({
			where: { id: Number(id) },
		});
	},
};
