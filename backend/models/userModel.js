module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define("User", {
		username: {
			// <-- Tambahkan field ini (wajib untuk login)
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, // Username harus unik
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		phone: {
			type: DataTypes.STRING,
		},
		role: {
			type: DataTypes.ENUM("admin", "reseller", "customer"),
			defaultValue: "customer",
		},
		reseller_id: {
			type: DataTypes.INTEGER,
			references: {
				model: "Users",
				key: "id",
			},
		},
	});

	User.associate = (models) => {
		User.belongsTo(models.Package, { as: "package" });
		User.hasMany(models.User, {
			as: "customers",
			foreignKey: "reseller_id",
		});
		User.belongsTo(models.User, {
			as: "reseller",
			foreignKey: "reseller_id",
		});
		User.hasMany(models.Payment, {
			as: "payments",
			foreignKey: "user_id",
		});
	};

	return User;
};
