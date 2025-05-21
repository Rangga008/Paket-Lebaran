const groupModel = require("../models/groupModel");

async function addCustomerToReseller(req, res) {
	try {
		const { resellerId, customerId } = req.body;
		const result = await groupModel.addCustomerToReseller(
			resellerId,
			customerId
		);
		res
			.status(201)
			.json({ message: "Customer added to reseller group", id: result.id });
	} catch (err) {
		res.status(500).json({ error: "Failed to add customer to reseller group" });
	}
}

async function getCustomersByReseller(req, res) {
	try {
		const resellerId = parseInt(req.params.resellerId);
		const customers = await groupModel.getCustomersByReseller(resellerId);
		res.json(customers);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch customers for reseller" });
	}
}

async function removeCustomerFromReseller(req, res) {
	try {
		const { resellerId, customerId } = req.body;
		const result = await groupModel.removeCustomerFromReseller(
			resellerId,
			customerId
		);
		res.json({
			message: "Customer removed from reseller group",
			changes: result.changes,
		});
	} catch (err) {
		res
			.status(500)
			.json({ error: "Failed to remove customer from reseller group" });
	}
}

module.exports = {
	addCustomerToReseller,
	getCustomersByReseller,
	removeCustomerFromReseller,
};
