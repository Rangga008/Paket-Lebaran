const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

// Add customer to reseller group
router.post("/add", groupController.addCustomerToReseller);

// Get customers by reseller ID
router.get("/:resellerId/customers", groupController.getCustomersByReseller);

// Remove customer from reseller group
router.post("/remove", groupController.removeCustomerFromReseller);

module.exports = router;
