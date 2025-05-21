import React, { useState } from "react";
import Modal from "../../common/Modal";

const ProductList = ({
	products,
	onProductSelect,
	selectedProductId,
	isLoading,
	error,
	onRefresh,
	onEdit,
	onDelete,
}) => {
	const [editProduct, setEditProduct] = useState(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteProductId, setDeleteProductId] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		price: 0,
		description: "",
	});
	const [formLoading, setFormLoading] = useState(false);
	const [formError, setFormError] = useState(null);
	const [notification, setNotification] = useState(null);

	const openEditModal = (product) => {
		setEditProduct(product);
		setFormData({
			name: product.name,
			price: product.price,
			description: product.description || "",
		});
		setFormError(null);
		setShowEditModal(true);
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setEditProduct(null);
		setFormError(null);
	};

	const openDeleteModal = (productId) => {
		setDeleteProductId(productId);
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setDeleteProductId(null);
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "price" ? parseFloat(value) || 0 : value,
		}));
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setFormLoading(true);
		setFormError(null);
		try {
			await onEdit({ ...editProduct, ...formData });
			setNotification("Produk berhasil diperbarui");
			closeEditModal();
		} catch (err) {
			setFormError("Gagal memperbarui produk: " + err.message);
		} finally {
			setFormLoading(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deleteProductId) return;
		try {
			await onDelete(deleteProductId);
			setNotification("Produk berhasil dihapus");
		} catch (err) {
			setNotification("Gagal menghapus produk: " + err.message);
		} finally {
			closeDeleteModal();
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold text-gray-800 flex items-center">
					<span className="inline-block w-1 h-6 bg-indigo-500 rounded-full mr-2"></span>
					Produk Tersedia
				</h2>
				<div className="flex items-center space-x-3">
					{!isLoading && (
						<span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
							{products.length} items
						</span>
					)}
					<button
						onClick={onRefresh}
						disabled={isLoading}
						className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm transition flex items-center gap-1 disabled:opacity-50"
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
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Refresh
					</button>
				</div>
			</div>

			{notification && (
				<div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-md mb-4 flex justify-between items-center shadow-sm">
					<span className="flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 mr-2"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
						{notification}
					</span>
					<button
						onClick={() => setNotification(null)}
						className="text-sm font-bold hover:bg-green-100 rounded-full h-6 w-6 flex items-center justify-center"
					>
						×
					</button>
				</div>
			)}

			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-12">
					<div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
					<p className="text-gray-500 mt-3">Memuat produk...</p>
				</div>
			) : error ? (
				<div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 rounded-md shadow-sm">
					<div className="flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 mr-2"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						{error}
					</div>
					<button
						onClick={onRefresh}
						className="mt-2 ml-7 text-red-700 hover:text-red-800 underline font-medium flex items-center gap-1"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-3 w-3"
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
						Coba Lagi
					</button>
				</div>
			) : products.length === 0 ? (
				<div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-12 w-12 mx-auto text-gray-400 mb-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
						/>
					</svg>
					<p className="mb-3 text-gray-500">Belum ada produk ditambahkan.</p>
					<button
						className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium gap-1"
						onClick={onRefresh}
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
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Refresh Data
					</button>
				</div>
			) : (
				<div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
					{products.map((product) => (
						<div
							key={product.id}
							className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:border-indigo-200 ${
								selectedProductId === product.id
									? "ring-2 ring-indigo-500 bg-indigo-50/50 shadow-md"
									: "bg-white hover:shadow-md"
							}`}
							onClick={() => onProductSelect?.(product)}
						>
							<div className="flex justify-between gap-4 items-start">
								<div className="flex-1">
									<h3 className="font-semibold text-gray-800">
										{product.name}
									</h3>
									<p className="text-gray-600 text-sm line-clamp-2 mt-1">
										{product.description || "Tidak ada deskripsi"}
									</p>
								</div>
								<div className="text-right">
									<p className="text-indigo-600 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded-md mb-1">
										Rp{product.price.toLocaleString("id-ID")}
									</p>
									<p className="text-xs text-gray-400 mb-2">ID: {product.id}</p>
									<div className="flex justify-end space-x-2">
										<button
											onClick={(e) => {
												e.stopPropagation();
												openEditModal(product);
											}}
											className="bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-700 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 shadow-sm border border-amber-200"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-3 w-3"
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
											onClick={(e) => {
												e.stopPropagation();
												openDeleteModal(product.id);
											}}
											className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 shadow-sm border border-red-200"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-3 w-3"
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
											Delete
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Edit Modal */}
			<Modal
				isOpen={showEditModal}
				title="Edit Produk"
				onClose={closeEditModal}
			>
				<form onSubmit={handleFormSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nama Produk
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleFormChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Nama produk"
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
								value={formData.price}
								onChange={handleFormChange}
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
							value={formData.description}
							onChange={handleFormChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							rows={3}
							placeholder="Deskripsi produk"
						/>
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
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={showDeleteModal}
				title="Konfirmasi Hapus"
				onClose={closeDeleteModal}
			>
				<div className="p-1">
					<div className="flex items-center mb-4 text-red-600">
						<div className="bg-red-100 p-2 rounded-full mr-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
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
						<p className="font-medium">
							Apakah Anda yakin ingin menghapus produk ini?
						</p>
					</div>
					<p className="text-gray-500 text-sm ml-11 mb-4">
						Tindakan ini tidak dapat dibatalkan dan akan menghapus produk secara
						permanen.
					</p>
					<div className="flex justify-end space-x-2 mt-4">
						<button
							onClick={closeDeleteModal}
							className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Batal
						</button>
						<button
							onClick={handleDeleteConfirm}
							className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 shadow-sm flex items-center gap-1"
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
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Hapus
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default ProductList;
