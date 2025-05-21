import React, { useState } from "react";

const ProductForm = ({
	newProduct,
	handleProductChange,
	createProduct,
	isLoading,
}) => {
	const [isFocused, setIsFocused] = useState({
		name: false,
		price: false,
		description: false,
	});
	const [isSuccess, setIsSuccess] = useState(false);

	// Handler untuk input harga yang lebih baik
	const handlePriceChange = (e) => {
		// Menghapus karakter non-digit
		const value = e.target.value.replace(/[^\d]/g, "");

		// Membuat event object buatan untuk digabungkan ke handleProductChange
		const synthEvent = {
			target: {
				name: "price",
				value: value,
			},
		};

		handleProductChange(synthEvent);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await createProduct();
			// Tampilkan animasi sukses
			setIsSuccess(true);
			setTimeout(() => setIsSuccess(false), 2000);
		} catch (error) {
			console.error("Product creation failed:", error);
		}
	};

	// Format harga dengan pemisah ribuan untuk display
	const formatPrice = (price) => {
		return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};

	return (
		<div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
			<h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
				Buat Produk Baru
			</h2>

			{isSuccess && (
				<div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center transition-opacity duration-300">
					<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
					<span>Produk berhasil dibuat!</span>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
				<div className="transition-all duration-200">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Nama Produk
					</label>
					<div
						className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
							isFocused.name ? "ring-2 ring-green-500" : ""
						}`}
					>
						<input
							type="text"
							name="name"
							value={newProduct.name}
							onChange={handleProductChange}
							onFocus={() => setIsFocused({ ...isFocused, name: true })}
							onBlur={() => setIsFocused({ ...isFocused, name: false })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
							placeholder="Nama produk"
							required
						/>
					</div>
				</div>

				<div className="transition-all duration-200">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Harga
					</label>
					<div
						className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
							isFocused.price ? "ring-2 ring-green-500" : ""
						}`}
					>
						<div className="absolute left-0 top-0 h-full flex items-center justify-center px-3 bg-gray-100 border-r border-gray-300">
							<span className="text-gray-500 font-medium">Rp</span>
						</div>

						<input
							type="text"
							name="price"
							value={newProduct.price === 0 ? "" : newProduct.price}
							onChange={handlePriceChange}
							onFocus={() => setIsFocused({ ...isFocused, price: true })}
							onBlur={() => setIsFocused({ ...isFocused, price: false })}
							className="w-full pl-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none ml-11"
							placeholder="0"
							required
						/>
					</div>
					{newProduct.price > 0 && (
						<p className="text-xs text-gray-500 mt-1">
							Harga yang dimasukkan: Rp {formatPrice(newProduct.price)}
						</p>
					)}
				</div>

				<div className="transition-all duration-200">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Deskripsi
					</label>
					<div
						className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
							isFocused.description ? "ring-2 ring-green-500" : ""
						}`}
					>
						<textarea
							name="description"
							value={newProduct.description}
							onChange={handleProductChange}
							onFocus={() => setIsFocused({ ...isFocused, description: true })}
							onBlur={() => setIsFocused({ ...isFocused, description: false })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
							rows={4}
							placeholder="Deskripsi produk"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className={`w-full mt-4 py-3 rounded-lg font-medium transition-all duration-300 transform ${
						isLoading
							? "bg-gray-400 text-white cursor-not-allowed opacity-70"
							: "bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:scale-98"
					}`}
				>
					{isLoading ? (
						<div className="flex items-center justify-center">
							<svg
								className="animate-spin h-5 w-5 mr-2 text-white"
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
							<span>Sedang Membuat...</span>
						</div>
					) : (
						"Buat Produk"
					)}
				</button>
			</form>
		</div>
	);
};

export default ProductForm;
