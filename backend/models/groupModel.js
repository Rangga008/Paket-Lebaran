const { raw: db } = require("../database");

// Initialize reseller_customers table to map resellers to customers
db.serialize(() => {
	db.run(
		`CREATE TABLE IF NOT EXISTS reseller_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reseller_id INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (reseller_id) REFERENCES users(id),
      FOREIGN KEY (customer_id) REFERENCES users(id)
    )`
	);
});

function addCustomerToReseller(resellerId, customerId) {
	return new Promise((resolve, reject) => {
		const query =
			"INSERT INTO reseller_customers (reseller_id, customer_id) VALUES (?, ?)";
		db.run(query, [resellerId, customerId], function (err) {
			if (err) reject(err);
			else resolve({ id: this.lastID });
		});
	});
}

function getCustomersByReseller(resellerId) {
	return new Promise((resolve, reject) => {
		const query = `
      SELECT u.* FROM users u
      JOIN reseller_customers rc ON u.id = rc.customer_id
      WHERE rc.reseller_id = ?
    `;
		db.all(query, [resellerId], (err, rows) => {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}

function removeCustomerFromReseller(resellerId, customerId) {
	return new Promise((resolve, reject) => {
		const query =
			"DELETE FROM reseller_customers WHERE reseller_id = ? AND customer_id = ?";
		db.run(query, [resellerId, customerId], function (err) {
			if (err) reject(err);
			else resolve({ changes: this.changes });
		});
	});
}

module.exports = {
	addCustomerToReseller,
	getCustomersByReseller,
	removeCustomerFromReseller,
};
