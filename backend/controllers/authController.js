const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
require("dotenv").config();

const prisma = new PrismaClient();

module.exports = {
	register: async (req, res) => {
		try {
			const { username, password, role, name, phone } = req.body;

			if (!username || !password) {
				return res
					.status(400)
					.json({ error: "Username dan password wajib diisi" });
			}

			// Check if username already exists
			const existingUser = await prisma.user.findUnique({
				where: { username },
			});

			if (existingUser) {
				return res.status(400).json({ error: "Username sudah digunakan" });
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await prisma.user.create({
				data: {
					username,
					password: hashedPassword,
					role: role ? role.toUpperCase() : "CUSTOMER", // default role USER
					name,
					phone,
					reseller_id: null, // Set reseller_id to null for new users
					// You can set this to a specific reseller ID if needed
				},
			});

			res.status(201).json({
				message: "User created successfully",
				userId: user.id,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	login: async (req, res) => {
		try {
			const { username, password } = req.body;

			if (!username || !password) {
				return res
					.status(400)
					.json({ error: "Username dan password wajib diisi" });
			}

			const user = await prisma.user.findUnique({
				where: { username },
			});

			if (!user) {
				return res.status(401).json({ error: "Username atau password salah" });
			}

			const passwordMatch = await bcrypt.compare(password, user.password);
			if (!passwordMatch) {
				return res.status(401).json({ error: "Username atau password salah" });
			}

			const token = jwt.sign(
				{ userId: user.id, role: user.role },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			res.json({
				token,
				userId: user.id,
				role: user.role,
				username: user.username,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},
};
