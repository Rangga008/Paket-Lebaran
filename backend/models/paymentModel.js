module.exports = (sequelize, DataTypes) => {
	const Payment = sequelize.define("Payment", {
		payment_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		amount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("pending", "confirmed", "canceled"),
			defaultValue: "pending",
		},
		payment_start_date: {
			type: DataTypes.DATE,
		},
		payment_months: {
			type: DataTypes.INTEGER,
		},
	});

	Payment.associate = (models) => {
		Payment.belongsTo(models.User, {
			as: "user",
			foreignKey: "user_id",
		});
		Payment.belongsTo(models.Package, {
			as: "package",
			foreignKey: "package_id",
		});
	};

	return Payment;
};
