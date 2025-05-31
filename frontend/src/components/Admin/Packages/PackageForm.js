import React, { useState, useMemo } from "react";

const PackageForm = ({
	newPackage,
	products,
	handlePackageChange,
	toggleProductInPackage,
	calculatePackageTotal,
	createPackage,
	isLoading,
}) => {
	// States for search and pagination
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isAnimating, setIsAnimating] = useState(false);
	const [showValidation, setShowValidation] = useState(false);
	const productsPerPage = 6;

	// Filter products based on search term
	const filteredProducts = useMemo(() => {
		return products.filter(
			(product) =>
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.price.toString().includes(searchTerm)
		);
	}, [products, searchTerm]);

	// Calculate pagination
	const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
	const startIndex = (currentPage - 1) * productsPerPage;
	const endIndex = startIndex + productsPerPage;
	const currentProducts = filteredProducts.slice(startIndex, endIndex);

	// Form validation
	const validateForm = () => {
		const errors = [];

		if (!newPackage.name || newPackage.name.trim() === "") {
			errors.push("Nama Paket");
		}
		if (!newPackage.description || newPackage.description.trim() === "") {
			errors.push("Deskripsi Paket");
		}
		if (!newPackage.payment_amount || newPackage.payment_amount <= 0) {
			errors.push("Pembayaran Satu Kali");
		}
		if (!newPackage.payment_months || newPackage.payment_months <= 0) {
			errors.push("Periode (Bulan)");
		}
		if (!newPackage.productIds || newPackage.productIds.length === 0) {
			errors.push("Pilih minimal 1 produk");
		}

		return errors;
	};

	const formErrors = validateForm();
	const isFormValid = formErrors.length === 0;

	// Handle page change with animation
	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
			setIsAnimating(true);
			setTimeout(() => {
				setCurrentPage(newPage);
				setIsAnimating(false);
			}, 150);
		}
	};

	// Reset pagination when search changes
	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	// Handle payment amount change to prevent auto-calculation
	const handlePaymentAmountChange = (e) => {
		const event = {
			target: {
				name: "payment_amount",
				value: e.target.value,
			},
		};
		handlePackageChange(event);
		// Hide validation when user starts typing
		if (showValidation) {
			setShowValidation(false);
		}
	};

	// Handle other package changes normally
	const handleOtherPackageChange = (e) => {
		if (e.target.name !== "payment_amount") {
			handlePackageChange(e);
		}
		// Hide validation when user starts typing
		if (showValidation) {
			setShowValidation(false);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!isFormValid) {
			setShowValidation(true);
			// Scroll to top to show validation message
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		setShowValidation(false);
		createPackage();
	};

	// Helper function to check if field has error
	const hasFieldError = (fieldName) => {
		if (!showValidation) return false;

		switch (fieldName) {
			case "name":
				return !newPackage.name || newPackage.name.trim() === "";
			case "description":
				return !newPackage.description || newPackage.description.trim() === "";
			case "payment_amount":
				return !newPackage.payment_amount || newPackage.payment_amount <= 0;
			case "payment_months":
				return !newPackage.payment_months || newPackage.payment_months <= 0;
			case "products":
				return !newPackage.productIds || newPackage.productIds.length === 0;
			default:
				return false;
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-2xl font-bold mb-6 text-gray-800">
					Buat Paket Baru
				</h2>

				{/* Validation Alert */}
				{showValidation && !isFormValid && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									Mohon lengkapi form berikut:
								</h3>
								<ul className="mt-2 text-sm text-red-700 list-disc list-inside">
									{formErrors.map((error, index) => (
										<li key={index}>{error}</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				)}

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nama Paket <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							name="name"
							value={newPackage.name}
							onChange={handleOtherPackageChange}
							className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
								hasFieldError("name")
									? "border-red-300 bg-red-50"
									: "border-gray-300"
							}`}
							placeholder="Masukkan nama paket"
						/>
						{hasFieldError("name") && (
							<p className="mt-1 text-sm text-red-600">
								Nama paket wajib diisi
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Deskripsi Paket <span className="text-red-500">*</span>
						</label>
						<textarea
							name="description"
							value={newPackage.description}
							onChange={handleOtherPackageChange}
							className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
								hasFieldError("description")
									? "border-red-300 bg-red-50"
									: "border-gray-300"
							}`}
							rows={3}
							placeholder="Masukkan deskripsi paket"
						/>
						{hasFieldError("description") && (
							<p className="mt-1 text-sm text-red-600">
								Deskripsi paket wajib diisi
							</p>
						)}
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Tipe Pembayaran
							</label>
							<select
								name="payment_method"
								value={newPackage.payment_method}
								onChange={handleOtherPackageChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value="daily">Harian</option>
								<option value="weekly">Mingguan</option>
								<option value="monthly">Bulanan</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Pembayaran Per Bayar <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<span className="absolute left-3 top-2 text-gray-500">Rp</span>
								<input
									type="number"
									name="payment_amount"
									value={newPackage.payment_amount}
									onChange={handlePaymentAmountChange}
									className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
										hasFieldError("payment_amount")
											? "border-red-300 bg-red-50"
											: "border-gray-300"
									}`}
									placeholder="0"
									min="1"
								/>
							</div>
							{hasFieldError("payment_amount") && (
								<p className="mt-1 text-sm text-red-600">
									Jumlah pembayaran harus lebih dari 0
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Periode (Bulan) <span className="text-red-500">*</span>
							</label>
							<input
								type="number"
								name="payment_months"
								value={newPackage.payment_months || ""}
								onChange={handleOtherPackageChange}
								className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
									hasFieldError("payment_months")
										? "border-red-300 bg-red-50"
										: "border-gray-300"
								}`}
								placeholder="0"
								min="1"
								step="1"
							/>
							{hasFieldError("payment_months") && (
								<p className="mt-1 text-sm text-red-600">
									Periode harus lebih dari 0 bulan
								</p>
							)}
						</div>
					</div>

					<div className="mt-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">
								Pilih Produk <span className="text-red-500">*</span>
							</h3>
							<div className="flex items-center space-x-2 text-sm text-gray-600">
								<span>{filteredProducts.length} products found</span>
							</div>
						</div>

						{/* Validation for products */}
						{hasFieldError("products") && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600">
									Pilih minimal 1 produk untuk paket
								</p>
							</div>
						)}

						{/* Search Input */}
						<div className="mb-4">
							<div className="relative">
								<input
									type="text"
									value={searchTerm}
									onChange={handleSearchChange}
									placeholder="Cari produk dari nama atau harga..."
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								/>
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center">
									<svg
										className="h-5 w-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
							</div>
						</div>

						{/* Products Grid */}
						<div className="relative">
							<div
								className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all duration-150 ${
									isAnimating
										? "opacity-50 transform scale-95"
										: "opacity-100 transform scale-100"
								}`}
							>
								{currentProducts.map((product) => (
									<div
										key={product.id}
										onClick={() => {
											toggleProductInPackage(product.id);
											if (showValidation) {
												setShowValidation(false);
											}
										}}
										className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
											newPackage.productIds.includes(product.id)
												? "bg-blue-50 border-blue-300 shadow-sm"
												: "bg-white hover:bg-gray-50 border-gray-200"
										}`}
									>
										<div className="flex items-center">
											<input
												type="checkbox"
												checked={newPackage.productIds.includes(product.id)}
												onChange={() => {}}
												className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											/>
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">
													{product.name}
												</h4>
												<p className="text-sm text-gray-600">
													Rp{product.price.toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Empty State */}
							{filteredProducts.length === 0 && (
								<div className="text-center py-8">
									<div className="text-gray-400 mb-2">
										<svg
											className="mx-auto h-12 w-12"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m12 0H6"
											/>
										</svg>
									</div>
									<p className="text-gray-500">
										Tidak ada produk yang ditemukan.
									</p>
								</div>
							)}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between mt-4 px-2">
								<div className="text-sm text-gray-600">
									Menampilkan {startIndex + 1}-
									{Math.min(endIndex, filteredProducts.length)} dari{" "}
									{filteredProducts.length} produk
								</div>
								<div className="flex items-center space-x-2">
									<button
										type="button"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
										className={`p-2 rounded-lg border transition-all duration-200 ${
											currentPage === 1
												? "border-gray-200 text-gray-400 cursor-not-allowed"
												: "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
										}`}
									>
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>

									<div className="flex items-center space-x-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1)
											.filter(
												(page) =>
													page === 1 ||
													page === totalPages ||
													(page >= currentPage - 1 && page <= currentPage + 1)
											)
											.map((page, index, array) => (
												<React.Fragment key={page}>
													{index > 0 && array[index - 1] !== page - 1 && (
														<span className="text-gray-400">...</span>
													)}
													<button
														type="button"
														onClick={() => handlePageChange(page)}
														className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
															currentPage === page
																? "bg-indigo-600 text-white"
																: "text-gray-600 hover:bg-gray-100"
														}`}
													>
														{page}
													</button>
												</React.Fragment>
											))}
									</div>

									<button
										type="button"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
										className={`p-2 rounded-lg border transition-all duration-200 ${
											currentPage === totalPages
												? "border-gray-200 text-gray-400 cursor-not-allowed"
												: "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
										}`}
									>
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
								</div>
							</div>
						)}
					</div>

					<div className="mt-4 p-4 bg-blue-50 rounded-lg">
						<div className="flex justify-between items-center">
							<h3 className="font-semibold">Detail Paket</h3>
							<p className="text-lg font-bold text-blue-700">
								Total Harga Paket: Rp
								{calculatePackageTotal().toLocaleString()}
							</p>
						</div>
						<p className="mt-2">
							{newPackage.productIds.length} produk dipilih
						</p>
						<p className="mt-1">
							Pembayaran: Rp{(newPackage.payment_amount || 0).toLocaleString()}{" "}
							per {newPackage.payment_method}
						</p>
					</div>

					{/* Form Status Indicator */}
					{!isFormValid && (
						<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
							<div className="flex items-center">
								<svg
									className="h-5 w-5 text-yellow-400 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
								<p className="text-sm text-yellow-800">
									Lengkapi semua field yang wajib diisi untuk membuat paket
								</p>
							</div>
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${
							isFormValid && !isLoading
								? "bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105"
								: "bg-gray-400 cursor-not-allowed"
						}`}
					>
						{isLoading ? (
							<>
								<span className="animate-spin inline-block mr-2">↻</span>
								Membuat Paket...
							</>
						) : (
							`Buat Paket ${!isFormValid ? "(Lengkapi Form)" : ""}`
						)}
					</button>
				</div>
			</div>
		</form>
	);
};

export default PackageForm;
