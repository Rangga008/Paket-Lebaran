const db = require("../models");
const Package = db.packageModel;
const Product = db.productModel;
const User = db.userModel;
const Payment = db.paymentModel;

// Get all packages
exports.getAllPackages = async (req, res) => {
	try {
		const packages = await Package.findAll({
			include: [{ model: Product, as: "products" }],
		});
		res.status(200).json(packages);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get all products
exports.getAllProducts = async (req, res) => {
	try {
		const products = await Product.findAll();
		res.status(200).json(products);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Create new product
exports.createProduct = async (req, res) => {
	try {
		const { name, price, description } = req.body;
		const product = await Product.create({ name, price, description });
		res.status(201).json(product);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Create new package
exports.createPackage = async (req, res) => {
	try {
		const { name, description, payment_method, payment_amount, products } =
			req.body;

		const package = await Package.create({
			name,
			description,
			payment_method,
			payment_amount,
		});

		if (products && products.length > 0) {
			await package.setProducts(products);
		}

		const newPackage = await Package.findByPk(package.id, {
			include: [{ model: Product, as: "products" }],
		});

		res.status(201).json(newPackage);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
	try {
		const customers = await User.findAll({
			where: { role: "customer" },
			include: [
				{
					model: Package,
					as: "package",
				},
				{
					model: User,
					as: "reseller",
				},
			],
		});
		res.status(200).json(customers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get all resellers
exports.getAllResellers = async (req, res) => {
	try {
		const resellers = await User.findAll({
			where: { role: "reseller" },
			include: [
				{
					model: User,
					as: "customers",
					where: { role: "customer" },
					required: false,
				},
			],
		});
		res.status(200).json(resellers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Create bulk payments
exports.createBulkPayments = async (req, res) => {
	try {
		const { payments } = req.body;

		const createdPayments = await Payment.bulkCreate(payments, {
			returning: true,
		});

		res.status(201).json(createdPayments);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
