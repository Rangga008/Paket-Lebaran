const express = require("express");
const router = express.Router();

// You'll need to import your user controller
const userController = require("../controllers/userController");

// Customer routes
router.get("/customers", userController.getAllCustomers);
router.get("/customers/search", userController.searchCustomers);
router.get("/customers/:id", userController.getCustomerById);
router.post("/customers", userController.createCustomer);
router.put("/customers/:id", userController.updateCustomer);
router.delete("/customers/:id", userController.deleteCustomer);
router.patch(
	"/customers/:id/reset-password",
	userController.resetCustomerPassword
);
router.post(
	"/customers/:id/reset-password",
	userController.resetCustomerPassword
);

// Add /users routes for compatibility with frontend
router.get("/users", userController.getAllCustomers);
router.get("/users/search", userController.searchCustomers);
router.get("/users/:id", userController.getCustomerById);
router.post("/users", userController.createCustomer);
router.post("/users/customers", userController.createCustomer);
router.put("/users/:id", userController.updateCustomer);
router.delete("/users/:id", userController.deleteCustomer);
router.post(
	"/users/customers/:id/reset-password",
	userController.resetCustomerPassword
);

// Add route for payment confirmation
router.post("/users/:id/confirm-payment", userController.confirmPayment);

// Reseller routes
router.get("/resellers", userController.getAllResellers);
router.get("/resellers/:id", userController.getResellerById);
router.post("/resellers", userController.createReseller);
router.put("/resellers/:id", userController.updateReseller);

router.delete("/:id", userController.deleteReseller);
router.patch(
	"/resellers/:id/reset-password",
	userController.resetResellerPassword
);
router.post("/:id/reset-password", userController.resetResellerPassword);

// Customer assignment to reseller
router.put("/:id/reseller", userController.assignCustomerToReseller);

router.put("/users/:id/package", userController.updateCustomerPackage);

module.exports = router;
