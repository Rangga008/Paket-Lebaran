import React, { useState, useEffect } from "react";
import Modal from "../../common/Modal";
import api from "../../../utils/api"; // Adjust the import based on your project structure

const PackageList = ({
	packages = [],
	isLoading,
	error,
	onEdit,
	onEditProduct,
	onDelete,
	onRefresh,
}) => {
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");

	const [editPackage, setEditPackage] = useState(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletePackageId, setDeletePackageId] = useState(null);
	const [allProducts, setAllProducts] = useState([]);
	const [showAddProductModal, setShowAddProductModal] = useState(false);
	const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const productsPerPage = 12; // Adjust based on your grid size
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		payment_method: "daily",
		payment_amount: 0,
		payment_months: 0,
		productIds: [],
	});
	const [formLoading, setFormLoading] = useState(false);
	const [formError, setFormError] = useState(null);
	const [notification, setNotification] = useState(null);
	// Add these new states at the top of your component
	const [showProductEditModal, setShowProductEditModal] = useState(false);
	const [currentProduct, setCurrentProduct] = useState(null);
	const [productFormData, setProductFormData] = useState({
		name: "",
		price: 0,
		description: "",
	});

	// Filter and pagination logic
	const filteredPackages = packages.filter(
		(pkg) =>
			pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentPackages = filteredPackages.slice(
		indexOfFirstItem,
		indexOfLastItem
	);

	const fetchAllProducts = async () => {
		try {
			const response = await api.get("/products");
			setAllProducts(response.data);
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	};

	useEffect(() => {
		fetchAllProducts();
		setCurrentPage(1);
	}, [searchTerm, itemsPerPage]);

	// Modal handlers
	const openEditModal = (pkg) => {
		setEditPackage(pkg);
		setFormData({
			name: pkg.name || "",
			description: pkg.description || "",
			payment_method: pkg.payment_method?.toLowerCase() || "daily",
			payment_amount: pkg.payment_amount || 0,
			payment_months: pkg.payment_months || 0,
			productIds: pkg.products ? pkg.products.map((p) => p.id) : [],
		});
		setFormError(null);
		setShowEditModal(true);
	};

	// Filter products based on search query
	const filteredProducts = allProducts.filter((product) =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Pagination logic

	// Get current products
	const currentProducts = filteredProducts
		.filter((p) => !formData.productIds.includes(p.id))
		.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

	const handleAddProduct = (productId) => {
		if (!formData.productIds.includes(productId)) {
			setFormData((prev) => ({
				...prev,
				productIds: [...prev.productIds, productId],
			}));
		}
		setSelectedProductToAdd(null);
		setShowAddProductModal(false);
	};

	const handleRemoveProduct = (productId) => {
		setFormData((prev) => ({
			...prev,
			productIds: prev.productIds.filter((id) => id !== productId),
		}));
	};

	const openProductEditModal = (product) => {
		setCurrentProduct(product);
		setProductFormData({
			name: product.name || "",
			price: product.price || 0,
			description: product.description || "",
		});
		setShowProductEditModal(true);
	};

	const closeProductEditModal = () => {
		setShowProductEditModal(false);
		setCurrentProduct(null);
		setProductFormData({
			name: "",
			price: 0,
			description: "",
		});
	};

	const handleProductFormChange = (e) => {
		const { name, value } = e.target;
		setProductFormData((prev) => ({
			...prev,
			[name]: name === "price" ? parseFloat(value) || 0 : value,
		}));
	};

	const handleProductFormSubmit = async (e) => {
		e.preventDefault();
		try {
			// You'll need to implement this function in your parent component
			await onEditProduct(currentProduct.id, productFormData);
			setNotification({
				type: "success",
				message: "Product updated successfully",
			});
			closeProductEditModal();
		} catch (err) {
			setNotification({
				type: "error",
				message: err.message || "Failed to update product",
			});
		}
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setEditPackage(null);
		setFormError(null);
	};

	const openDeleteModal = (packageId) => {
		setDeletePackageId(packageId);
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setDeletePackageId(null);
	};

	// Form handlers
	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "payment_amount" || name === "payment_months"
					? parseFloat(value) || 0
					: value,
		}));
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setFormLoading(true);
		setFormError(null);
		try {
			await onEdit({ ...editPackage, ...formData });
			setNotification({
				type: "success",
				message: "Package updated successfully",
			});
			closeEditModal();
		} catch (err) {
			setFormError(err.message || "Failed to update package");
		} finally {
			setFormLoading(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deletePackageId) return;
		try {
			await onDelete(deletePackageId);
			setNotification({
				type: "success",
				message: "Package deleted successfully",
			});
		} catch (err) {
			setNotification({
				type: "error",
				message: err.message || "Failed to delete package",
			});
		} finally {
			closeDeleteModal();
		}
	};

	// Pagination handlers
	const nextPage = () =>
		currentPage < totalPages && setCurrentPage(currentPage + 1);
	const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
	const goToPage = (page) => setCurrentPage(page);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			{/* Header Section */}
			<div className="px-6 py-4 border-b border-gray-200 bg-white ">
				<div className="grid-flow-row md:flex-row md:items-center md:justify-between gap-2">
					<div>
						<h2 className="text-xl font-semibold text-gray-800">
							Manajemen Paket
						</h2>
						<p className="text-sm text-gray-500 mt-1">
							Manage Paket Dan Harga Paket
						</p>
						<br></br>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
						{/* Search Input */}
						<div className="relative flex-1 min-w-[200px]">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg
									className="h-5 w-5 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
							<input
								type="text"
								placeholder="Cari Paket..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
							/>
						</div>

						{/* Items per page dropdown */}
						<div className="relative min-w-[120px]">
							<select
								value={itemsPerPage}
								onChange={(e) => setItemsPerPage(Number(e.target.value))}
								className="appearance-none block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								{[5, 10, 25, 50].map((num) => (
									<option key={num} value={num}>
										Perlihatkan {num}
									</option>
								))}
							</select>
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
								<svg
									className="h-5 w-5 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>

						{/* Refresh Button - Fixed Version */}
						<button
							onClick={onRefresh}
							disabled={isLoading}
							className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
								isLoading ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{isLoading ? (
								<svg
									className="animate-spin h-4 w-4 text-gray-500"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							) : (
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							)}
							<span>Refresh</span>
						</button>
					</div>
				</div>
			</div>

			{/* Notification */}
			{notification && (
				<div
					className={`px-6 py-3 rounded-md mx-4 mt-4 flex items-center justify-between ${
						notification.type === "success"
							? "bg-green-50 text-green-800 border border-green-200"
							: "bg-red-50 text-red-800 border border-red-200"
					}`}
				>
					<div className="flex items-center">
						{notification.type === "success" ? (
							<svg
								className="h-5 w-5 text-green-500 mr-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						) : (
							<svg
								className="h-5 w-5 text-red-500 mr-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						)}
						<span className="text-sm font-medium">{notification.message}</span>
					</div>
					<button
						onClick={() => setNotification(null)}
						className="text-gray-500 hover:text-gray-700 focus:outline-none"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			)}

			{/* Content Section */}
			<div className="px-6 py-4">
				{isLoading ? (
					<div className="flex justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<svg
							className="h-12 w-12 text-red-500 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Error loading Paket
						</h3>
						<p className="text-sm text-gray-500 mb-4">{error}</p>
						<button
							onClick={onRefresh}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Coba Lagi
						</button>
					</div>
				) : packages.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<svg
							className="h-12 w-12 text-gray-400 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
							/>
						</svg>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Paket Tidak Ditemukan
						</h3>
						<p className="text-sm text-gray-500 mb-4">Buat Paket Pertama</p>
						<button
							onClick={onRefresh}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Refresh Data
						</button>
					</div>
				) : (
					<div className="space-y-4">
						{currentPackages.map((pkg) => {
							if (!pkg) return null;

							const totalAmount =
								pkg.products?.reduce((sum, product) => {
									return sum + (product?.price || 0);
								}, 0) || 0;

							return (
								<div
									key={pkg.id}
									className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
								>
									{/* Package Header */}
									<div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
										<div>
											<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
												{pkg.name || "Unnamed Package"}
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														pkg.payment_method?.toLowerCase() === "daily"
															? "bg-blue-100 text-blue-800"
															: pkg.payment_method?.toLowerCase() === "weekly"
															? "bg-purple-100 text-purple-800"
															: pkg.payment_method?.toLowerCase() === "monthly"
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{{
														daily: "Harian",
														weekly: "Mingguan",
														monthly: "Bulanan",
													}[pkg.payment_method?.toLowerCase()] ||
														"Tidak diketahui"}
												</span>
											</h3>

											{pkg.description && (
												<p className="text-sm text-gray-500 mt-1">
													{pkg.description}
												</p>
											)}
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => openEditModal(pkg)}
												className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
											>
												<svg
													className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
												Edit
											</button>
											<button
												onClick={() => openDeleteModal(pkg.id)}
												className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
											>
												<svg
													className="-ml-0.5 mr-1.5 h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
												Hapus
											</button>
										</div>
									</div>

									{/* Package Details */}
									<div className="px-5 py-4">
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											{/* Payment Info */}
											<div className="bg-blue-50 p-3 rounded-lg">
												<h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
													Pembayaran
												</h4>
												<p className="text-lg font-semibold text-gray-900">
													Rp{(pkg.payment_amount || 0).toLocaleString()}
													<span className="text-sm font-normal text-gray-500 ml-1">
														/{" "}
														{{
															daily: "Harian",
															weekly: "Mingguan",
															monthly: "Bulanan",
														}[pkg.payment_method?.toLowerCase()] ||
															"Tidak diketahui"}
													</span>
												</p>
											</div>

											{/* Products Count */}
											<div className="bg-purple-50 p-3 rounded-lg">
												<h4 className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">
													Lama Pembayaran
												</h4>
												<p className="text-lg font-semibold text-gray-900">
													{pkg.payment_months || 0}
													<span className="text-sm font-normal text-gray-500 ml-1">
														Bulan
													</span>
												</p>
											</div>

											{/* Total Value */}
											<div className="bg-green-50 p-3 rounded-lg">
												<h4 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-1">
													Total Harga Paket
												</h4>
												<p className="text-lg font-semibold text-gray-900">
													Rp{totalAmount.toLocaleString()}
												</p>
											</div>
										</div>

										{/* Products List */}
										{pkg.products?.length > 0 ? (
											<div className="mt-4">
												<h4 className="text-sm font-medium text-gray-900 mb-2">
													Produk dalam Paket
												</h4>
												<div className="overflow-hidden border border-gray-200 rounded-lg">
													<table className="min-w-full divide-y divide-gray-200">
														<thead className="bg-gray-50">
															<tr>
																<th
																	scope="col"
																	className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
																>
																	Produk
																</th>
																<th
																	scope="col"
																	className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
																>
																	Harga
																</th>
															</tr>
														</thead>
														<tbody className="bg-white divide-y divide-gray-200">
															{pkg.products.map((product) => (
																<tr key={product.id}>
																	<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
																		<div className="flex items-center justify-between">
																			{product.name || "Unnamed Product"}
																			<button
																				onClick={(e) => {
																					e.stopPropagation();
																					openProductEditModal(product);
																				}}
																				className="text-blue-600 hover:text-blue-800 ml-2"
																				title="Edit product"
																			>
																				<svg
																					className="h-4 w-4"
																					fill="none"
																					viewBox="0 0 24 24"
																					stroke="currentColor"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																					/>
																				</svg>
																			</button>
																		</div>
																	</td>
																	<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
																		Rp{(product.price || 0).toLocaleString()}
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										) : (
											<div className="mt-4 text-center py-4 bg-gray-50 rounded-lg">
												<p className="text-sm text-gray-500">
													Tidak ada produk dalam paket ini.
												</p>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Pagination */}
			{filteredPackages.length > itemsPerPage && (
				<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="text-sm text-gray-500">
							Showing{" "}
							<span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
							<span className="font-medium">
								{Math.min(indexOfLastItem, filteredPackages.length)}
							</span>{" "}
							of <span className="font-medium">{filteredPackages.length}</span>{" "}
							results
						</div>

						<nav className="flex items-center space-x-2">
							<button
								onClick={prevPage}
								disabled={currentPage === 1}
								className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="sr-only">Sebelumnya</span>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</button>

							{/* Page numbers */}
							{Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
								let pageNum;
								if (totalPages <= 5) {
									pageNum = i + 1;
								} else if (currentPage <= 3) {
									pageNum = i + 1;
								} else if (currentPage >= totalPages - 2) {
									pageNum = totalPages - 4 + i;
								} else {
									pageNum = currentPage - 2 + i;
								}

								return (
									<button
										key={pageNum}
										onClick={() => goToPage(pageNum)}
										className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
											currentPage === pageNum
												? "z-10 bg-blue-50 border-blue-500 text-blue-600"
												: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
										}`}
									>
										{pageNum}
									</button>
								);
							})}

							<button
								onClick={nextPage}
								disabled={currentPage === totalPages}
								className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="sr-only">Next</span>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</nav>
					</div>
				</div>
			)}

			{/* Edit Modal */}

			{/* Product Edit Modal */}
			<Modal
				isOpen={showProductEditModal}
				title="Edit Product"
				onClose={closeProductEditModal}
				className="max-w-lg overflow-y-auto"
			>
				<form onSubmit={handleProductFormSubmit} className="space-y-4 ">
					<div className="overflow-y-auto">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nama Produk
						</label>
						<input
							type="text"
							name="name"
							value={productFormData.name}
							onChange={handleProductFormChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Product name"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Harga
						</label>
						<div className="relative">
							<span className="absolute left-3 top-2">Rp</span>
							<input
								type="number"
								name="price"
								value={productFormData.price}
								onChange={handleProductFormChange}
								className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="0"
								min="0"
								step="any"
								required
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Deskripsi
						</label>
						<textarea
							name="description"
							value={productFormData.description}
							onChange={handleProductFormChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							rows={3}
							placeholder="Product description"
						/>
					</div>

					<div className="flex justify-end space-x-2 pt-2">
						<button
							type="button"
							onClick={closeProductEditModal}
							className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center gap-1"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>Save Produk</span>
						</button>
					</div>
				</form>
			</Modal>

			{/* Edit Package Modal */}
			<Modal isOpen={showEditModal} title="Edit Paket" onClose={closeEditModal}>
				<form onSubmit={handleFormSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nama Paket
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleFormChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Nama paket"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Deskripsi
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleFormChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							rows={3}
							placeholder="Deskripsi paket"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Metode Pembayaran
							</label>
							<select
								name="payment_method"
								value={formData.payment_method}
								onChange={handleFormChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							>
								<option value="daily">Harian</option>
								<option value="weekly">Mingguan</option>
								<option value="monthly">Bulanan</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Periode (Bulan)
							</label>
							<input
								type="number"
								name="payment_months"
								value={formData.payment_months}
								onChange={handleFormChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="0"
								min="0"
								step="1"
								required
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Harga Per Pembayaran
						</label>
						<div className="relative">
							<span className="absolute left-3 top-2">Rp</span>
							<input
								type="number"
								name="payment_amount"
								value={formData.payment_amount}
								onChange={handleFormChange}
								className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="0"
								min="0"
								step="any"
								required
							/>
						</div>
					</div>

					{/* Product Management Section */}
					<div className="mt-4">
						<div className="flex justify-between items-center mb-2">
							<h3 className="text-sm font-medium text-gray-700">
								Produk dalam paket ({formData.productIds.length})
							</h3>
							<button
								type="button"
								onClick={() => setShowAddProductModal(true)}
								className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								<svg
									className="-ml-0.5 mr-1 h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								Tambah Produk
							</button>
						</div>

						{formData.productIds.length > 0 ? (
							<div className="max-h-64 overflow-y-auto pr-2">
								<div className="space-y-2">
									{formData.productIds.map((productId) => {
										const product = allProducts.find((p) => p.id === productId);
										if (!product) return null;

										return (
											<div
												key={productId}
												className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
											>
												<div className="flex items-center space-x-3 flex-1 min-w-0">
													<div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
														<svg
															className="h-5 w-5 text-gray-500"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
															/>
														</svg>
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium text-gray-900 truncate">
															{product.name}
														</p>
														<p className="text-xs text-gray-500">
															Rp{product.price.toLocaleString()}
														</p>
													</div>
												</div>
												<div className="flex space-x-2 flex-shrink-0">
													<button
														type="button"
														onClick={() => handleRemoveProduct(productId)}
														className="text-red-500 hover:text-red-700"
														title="Remove product"
													>
														<svg
															className="h-4 w-4"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													</button>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						) : (
							<div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
								<svg
									className="mx-auto h-12 w-12 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
									/>
								</svg>
								<h3 className="mt-2 text-sm font-medium text-gray-900">
									No products added
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Click "Add Product" to include items in this package
								</p>
							</div>
						)}
					</div>

					{formError && (
						<div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-2 rounded">
							<div className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								{formError}
							</div>
						</div>
					)}

					<div className="flex justify-end space-x-2 pt-2">
						<button
							type="button"
							onClick={closeEditModal}
							className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={formLoading}
							className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm flex items-center gap-1"
						>
							{formLoading ? (
								<>
									<span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
									<span>Menyimpan...</span>
								</>
							) : (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
									<span>Simpan</span>
								</>
							)}
						</button>
					</div>
				</form>

				{/* Add Product Modal */}
				<Modal
					isOpen={showAddProductModal}
					title="Add Product to Package"
					onClose={() => {
						setShowAddProductModal(false);
						setSearchQuery("");
						setCurrentPage(1);
					}}
					size="xl"
				>
					<div className="space-y-4">
						{/* Search Input */}
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg
									className="h-5 w-5 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
							<input
								type="text"
								placeholder="Search products..."
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</div>

						{/* Product Grid */}
						<div className="border border-gray-200 rounded-xl">
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 max-h-96 overflow-y-auto">
								{currentProducts.map((product) => (
									<div
										key={product.id}
										onClick={() => setSelectedProductToAdd(product.id)}
										className={`p-3 border rounded-lg cursor-pointer transition ${
											selectedProductToAdd === product.id
												? "bg-blue-50 border-blue-300"
												: "bg-white hover:bg-gray-50"
										}`}
									>
										<div className="flex flex-col items-center text-center">
											<div className="w-10 h-10 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
												<svg
													className="h-6 w-6 text-gray-500"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
													/>
												</svg>
											</div>
											<h4 className="font-medium text-sm truncate w-full">
												{product.name}
											</h4>
											<p className="text-xs text-gray-600 mt-1">
												Rp{product.price.toLocaleString()}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Pagination Controls */}
						{totalPages > 1 && (
							<div className="flex justify-center items-center space-x-2">
								<button
									onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
									disabled={currentPage === 1}
									className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg
										className="h-5 w-5 text-gray-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 19l-7-7 7-7"
										/>
									</svg>
								</button>

								{Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
									let pageNum;
									if (totalPages <= 5) {
										pageNum = i + 1;
									} else if (currentPage <= 3) {
										pageNum = i + 1;
									} else if (currentPage >= totalPages - 2) {
										pageNum = totalPages - 4 + i;
									} else {
										pageNum = currentPage - 2 + i;
									}

									return (
										<button
											key={pageNum}
											onClick={() => setCurrentPage(pageNum)}
											className={`w-8 h-8 rounded-full text-sm ${
												currentPage === pageNum
													? "bg-blue-600 text-white"
													: "text-gray-700 hover:bg-gray-100"
											}`}
										>
											{pageNum}
										</button>
									);
								})}

								<button
									onClick={() =>
										setCurrentPage((p) => Math.min(p + 1, totalPages))
									}
									disabled={currentPage === totalPages}
									className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg
										className="h-5 w-5 text-gray-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
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
						)}

						{/* Action Buttons */}
						<div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
							<button
								type="button"
								onClick={() => {
									setShowAddProductModal(false);
									setSearchQuery("");
									setCurrentPage(1);
								}}
								className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => {
									if (selectedProductToAdd) {
										handleAddProduct(selectedProductToAdd);
										setSearchQuery("");
										setCurrentPage(1);
									}
								}}
								disabled={!selectedProductToAdd}
								className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
							>
								Add Product
							</button>
						</div>
					</div>
				</Modal>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={showDeleteModal}
				title="Confirm Deletion"
				onClose={closeDeleteModal}
			>
				<div className="sm:flex sm:items-start">
					<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
						<svg
							className="h-6 w-6 text-red-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Delete package
						</h3>
						<div className="mt-2">
							<p className="text-sm text-gray-500">
								Are you sure you want to delete this package? This action cannot
								be undone.
							</p>
						</div>
					</div>
				</div>
				<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<button
						type="button"
						onClick={handleDeleteConfirm}
						className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
					>
						Delete
					</button>
					<button
						type="button"
						onClick={closeDeleteModal}
						className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
					>
						Cancel
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default PackageList;
