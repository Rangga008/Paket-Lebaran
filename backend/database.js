const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

// Enable foreign key constraints
db.get("PRAGMA foreign_keys = ON");

module.exports = {
	raw: db, // export raw sqlite3 Database instance
	run: (query, params = []) => {
		return new Promise((resolve, reject) => {
			db.run(query, params, function (err) {
				if (err) reject(err);
				else resolve(this);
			});
		});
	},

	get: (query, params = []) => {
		return new Promise((resolve, reject) => {
			db.get(query, params, (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	},

	all: (query, params = []) => {
		return new Promise((resolve, reject) => {
			db.all(query, params, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	},

	transaction: (operations) => {
		return new Promise((resolve, reject) => {
			db.serialize(() => {
				db.run("BEGIN TRANSACTION");

				try {
					operations.forEach((op) => {
						db.run(op.query, op.params);
					});

					db.run("COMMIT", (err) => {
						if (err) {
							db.run("ROLLBACK");
							reject(err);
						} else {
							resolve();
						}
					});
				} catch (error) {
					db.run("ROLLBACK");
					reject(error);
				}
			});
		});
	},
};
