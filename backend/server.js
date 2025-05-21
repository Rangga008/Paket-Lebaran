const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const packageRoutes = require("./routes/packageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const groupRoutes = require("./routes/groupRoutes");
const userRoutes = require("./routes/userRoutes"); // Add this new route

const app = express();

app.use(
	cors({
		origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Explicitly list allowed origins
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		exposedHeaders: ["Content-Length", "X-Request-ID"],
		credentials: true,
		maxAge: 86400,
	})
);

// Middleware
app.use(express.json()); // Ini cukup, tanpa body-parser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/resellers", userRoutes);
app.use("/api/users", userRoutes); // Add user routes

app.get("/", (req, res) => {
	res.send("Yey~ Backend API is running! 🎉");
});

// Health check endpoint
app.get("/api/health-check", (req, res) => {
	res
		.status(200)
		.json({ status: "healthy", message: "API is running correctly" });
});

// Error handling middleware
app.use((error, req, res, next) => {
	console.error(error.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
