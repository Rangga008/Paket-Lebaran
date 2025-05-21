module.exports = (sequelize, DataTypes) => {
	const Product = sequelize.define("Product", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
		},
	});

	Product.associate = (models) => {
		Product.belongsToMany(models.Package, {
			through: "PackageProducts",
			as: "packages",
		});
	};

	return Product;
};
