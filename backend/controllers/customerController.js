const db = require("../database");

module.exports = {
	// Add new customer
	addCustomer: async (
		name,
		email,
		password,
		phone,
		address,
		reseller_id = null,
		package_id = null
	) => {
		try {
			const result = await db.run(
				"INSERT INTO users (name, email, password, phone, address, role, reseller_id, package_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				[
					name,
					email,
					password,
					phone,
					address,
					"customer",
					reseller_id,
					package_id,
				]
			);
			return {
				id: result.lastID,
				name,
				email,
				phone,
				address,
				reseller_id,
				package_id,
			};
		} catch (error) {
			throw error;
		}
	},

	// Get all customers
	getAllCustomers: async () => {
		try {
			return await db.all(`
        SELECT u.*, r.name as reseller_name, p.name as package_name 
        FROM users u
        LEFT JOIN users r ON u.reseller_id = r.id
        LEFT JOIN packages p ON u.package_id = p.id
        WHERE u.role = 'customer'
        ORDER BY u.created_at DESC
      `);
		} catch (error) {
			throw error;
		}
	},

	// Get customer by ID
	getCustomerById: async (id) => {
		try {
			return await db.get(
				`
        SELECT u.*, r.name as reseller_name, p.name as package_name 
        FROM users u
        LEFT JOIN users r ON u.reseller_id = r.id
        LEFT JOIN packages p ON u.package_id = p.id
        WHERE u.id = ? AND u.role = 'customer'
      `,
				[id]
			);
		} catch (error) {
			throw error;
		}
	},

	// Update customer
	updateCustomer: async (
		id,
		name,
		email,
		phone,
		address,
		reseller_id,
		package_id
	) => {
		try {
			await db.run(
				`UPDATE users 
         SET name = ?, email = ?, phone = ?, address = ?, reseller_id = ?, package_id = ?
         WHERE id = ? AND role = 'customer'`,
				[name, email, phone, address, reseller_id, package_id, id]
			);
			return this.getCustomerById(id);
		} catch (error) {
			throw error;
		}
	},

	// Delete customer
	// Delete customer
	deleteCustomer: async (id) => {
		try {
			await db.run(`DELETE FROM users WHERE id = ? AND role = 'customer'`, [
				id,
			]);
			return { id };
		} catch (error) {
			throw error;
		}
	},
};
