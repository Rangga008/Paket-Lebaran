const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
	addProduct: async (req, res) => {
		try {
			const { name, price, description } = req.body;

			// Validasi input
			if (!name || price === undefined) {
				return res.status(400).json({ error: "Nama dan harga harus diisi" });
			}

			const product = await prisma.product.create({
				data: {
					name,
					price: parseFloat(price),
					description: description || "",
				},
			});

			res.status(201).json(product);
		} catch (error) {
			console.error("Error creating product:", error);

			// Handle error unik untuk duplicate product name
			if (error.code === "P2002") {
				return res.status(400).json({ error: "Nama produk sudah ada" });
			}

			res.status(500).json({ error: "Gagal membuat produk" });
		}
	},

	getAllProducts: async (req, res) => {
		try {
			const { search, sort = "desc" } = req.query;

			const products = await prisma.product.findMany({
				where: search
					? {
							name: { contains: search, mode: "insensitive" },
					  }
					: undefined,
				orderBy: {
					id: sort === "asc" ? "asc" : "desc",
				},
			});

			res.status(200).json(products);
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({
				error: "Terjadi kesalahan saat mengambil data produk",
				details: error.message,
			});
		}
	},

	// Get product by ID
	getProductById: async (id) => {
		try {
			return await prisma.product.findUnique({
				where: { id: Number(id) },
			});
		} catch (error) {
			throw error;
		}
	},

	// Update product
	updateProduct: async (id, name, price, description) => {
		try {
			const updated = await prisma.product.update({
				where: { id: Number(id) },
				data: { name, price, description },
			});
			return updated;
		} catch (error) {
			throw error;
		}
	},

	// Delete product
	deleteProduct: async (id) => {
		try {
			await prisma.product.delete({
				where: { id: Number(id) },
			});
			return { id: Number(id) };
		} catch (error) {
			throw error;
		}
	},

	// Handler for updating product (Express route handler)
	updateProductHandler: async (req, res) => {
		const { id } = req.params;
		const { name, price, description } = req.body;
		try {
			const updatedProduct = await module.exports.updateProduct(
				id,
				name,
				price,
				description
			);
			res.status(200).json(updatedProduct);
		} catch (error) {
			console.error("Error updating product:", error);
			res.status(500).json({ error: "Gagal memperbarui produk" });
		}
	},

	// Handler for deleting product (Express route handler)
	deleteProductHandler: async (req, res) => {
		const { id } = req.params;
		try {
			const deleted = await module.exports.deleteProduct(id);
			res.status(200).json(deleted);
		} catch (error) {
			console.error("Error deleting product:", error);
			res.status(500).json({ error: "Gagal menghapus produk" });
		}
	},
};
