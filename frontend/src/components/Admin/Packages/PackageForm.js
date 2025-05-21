import React from "react";

const PackageForm = ({
	newPackage,
	products,
	handlePackageChange,
	toggleProductInPackage,
	calculatePackageTotal,
	createPackage,
	isLoading, // Tambahkan prop isLoading
}) => {
	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission
		createPackage();
	};
	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-2xl font-bold mb-6 text-gray-800">
					Create New Package
				</h2>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Package Name
						</label>
						<input
							type="text"
							name="name"
							value={newPackage.name}
							onChange={handlePackageChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Package name"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							name="description"
							value={newPackage.description}
							onChange={handlePackageChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							rows={3}
							placeholder="Package description"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Payment Method
							</label>
							<select
								name="payment_method"
								value={newPackage.payment_method}
								onChange={handlePackageChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value="daily">Daily</option>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Payment Amount
							</label>
							<div className="relative">
								<span className="absolute left-3 top-2">Rp</span>
								<input
									type="number"
									name="payment_amount"
									value={newPackage.payment_amount}
									onChange={handlePackageChange}
									className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="0"
								/>
							</div>
						</div>
					</div>

					<div className="mt-6">
						<h3 className="text-lg font-semibold mb-3">Select Products</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
							{products.map((product) => (
								<div
									key={product.id}
									onClick={() => toggleProductInPackage(product.id)}
									className={`p-3 border rounded-lg cursor-pointer transition ${
										newPackage.productIds.includes(product.id)
											? "bg-blue-50 border-blue-300"
											: "bg-white hover:bg-gray-50"
									}`}
								>
									<div className="flex items-center">
										<input
											type="checkbox"
											checked={newPackage.productIds.includes(product.id)}
											onChange={() => {}}
											className="mr-2"
										/>
										<div>
											<h4 className="font-medium">{product.name}</h4>
											<p className="text-sm text-gray-600">
												Rp{product.price.toLocaleString()}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="mt-4 p-4 bg-blue-50 rounded-lg">
						<div className="flex justify-between items-center">
							<h3 className="font-semibold">Package Summary</h3>
							<p className="text-lg font-bold text-blue-700">
								Total: Rp{calculatePackageTotal().toLocaleString()}
							</p>
						</div>
						<p className="mt-2">
							{newPackage.productIds.length} product(s) selected
						</p>
						<p className="mt-1">
							Payment: Rp{newPackage.payment_amount.toLocaleString()} per{" "}
							{newPackage.payment_method}
						</p>
					</div>

					<button
						type="submit"
						disabled={isLoading || newPackage.productIds.length === 0}
						className={`w-full py-3 rounded-lg font-medium text-white ${
							newPackage.productIds.length > 0 && !isLoading
								? "bg-indigo-600 hover:bg-indigo-700"
								: "bg-gray-400 cursor-not-allowed"
						}`}
					>
						{isLoading ? (
							<>
								<span className="animate-spin inline-block mr-2">↻</span>
								Creating...
							</>
						) : (
							"Create Package"
						)}
					</button>
				</div>
			</div>
		</form>
	);
};

export default PackageForm;
