const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/register", (req, res) => {
	res.send(
		"Ini endpoint register tapi untuk GET~ 🌼 Gunakan POST untuk daftar ya!"
	);
});

module.exports = router;
