const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Rute yang lebih sederhana dan terstruktur
router.post("/", productController.addProduct);
router.get("/", productController.getAllProducts);

// Update product by id
router.put("/:id", productController.updateProductHandler);

// Delete product by id
router.delete("/:id", productController.deleteProductHandler);

module.exports = router;
