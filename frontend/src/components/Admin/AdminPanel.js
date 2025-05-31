import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import PaymentCalendar from "./PaymentCalendar";

import AdminLayout from "../layouts/AdminLayout";
import ProductForm from "./Products/ProductForm";
import ProductList from "./Products/ProductList";
import PackageForm from "./Packages/PackageForm";
import PackageList from "./Packages/PackageList";
import CustomerTable from "./Customers/CustomerTable";
import ResellerTable from "./Resellers/ResellerTable";
import PaymentConfirmation from "./Payments/PaymentConfirmation";
import PaymentConfirmationModal from "../common/PaymentConfirmationModal";

import api from "../../utils/api";

function AdminPanel() {
	// State management
	const [packages, setPackages] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [products, setProducts] = useState([]);
	const [resellers, setResellers] = useState([]);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [paymentStartDate, setPaymentStartDate] = useState(new Date());
	const [paymentMonths, setPaymentMonths] = useState(1);
	const [activeTab, setActiveTab] = useState(() => {
		// Use localStorage to remember the active tab
		return localStorage.getItem("adminActiveTab") || "products";
	});
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("name");
	const [sortedProducts, setSortedProducts] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [error, setError] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [stream, setStream] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const navigate = useNavigate();

	const videoRef = useRef(null);
	const productsPerPage = 5;
	const indexOfLastProduct = currentPage * productsPerPage;
	const currentProducts = sortedProducts.slice(0, indexOfLastProduct);

	// Form states
	const [newProduct, setNewProduct] = useState({
		name: "",
		price: 0,
		description: "",
	});

	const filteredProducts = products.filter((product) =>
		product.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const [newPackage, setNewPackage] = useState({
		name: "",
		description: "",
		payment_method: "daily",
		payment_amount: 0,
		payment_months: 0,
		productIds: [],
	});

	// Save active tab to localStorage when it changes
	useEffect(() => {
		localStorage.setItem("adminActiveTab", activeTab);
	}, [activeTab]);

	// Fetch data on component mount
	useEffect(() => {
		// Fetch data immediately on component mount
		fetchData();
	}, []);

	useEffect(() => {
		fetchPackages();
		fetchProducts();
		// fetchCustomers(); // Removed because fetchCustomers is not defined
		// fetchResellers();
	}, []);

	// Media stream handler
	const getMediaStream = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: true,
			});
			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream;
			}
		} catch (err) {
			console.error("Error accessing media devices:", err);
		}
	};

	// Main fetch function - improved with better error handling
	const fetchData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await checkBackend(); // Make sure backend is reachable first

			console.log("Fetching data from all endpoints...");

			// Use Promise.allSettled to handle partial failures gracefully
			const endpoints = [
				{ name: "packages", url: "/packages" },
				{ name: "products", url: "/products" },
				{ name: "customers", url: "/users/customers" },
				{ name: "resellers", url: "/users/resellers" },
			];

			const results = await Promise.allSettled(
				endpoints.map((endpoint) => api.get(endpoint.url))
			);

			// Process each result individually
			let hasError = false;
			let errorMessages = [];

			// Handle packages result
			const packagesResult = results[0];
			if (packagesResult.status === "fulfilled") {
				console.log("Packages loaded:", packagesResult.value.data);
				setPackages(packagesResult.value.data);
			} else {
				console.error("Failed to load packages:", packagesResult.reason);
				hasError = true;
				errorMessages.push(
					`Error fetching packages: ${packagesResult.reason.message}`
				);
			}

			// Handle products result
			const productsResult = results[1];
			if (productsResult.status === "fulfilled") {
				console.log("Products loaded:", productsResult.value.data);
				setProducts(productsResult.value.data);
			} else {
				console.error("Failed to load products:", productsResult.reason);
				hasError = true;
				errorMessages.push(
					`Error fetching products: ${productsResult.reason.message}`
				);
			}

			// Handle customers result
			const customersResult = results[2];
			if (customersResult.status === "fulfilled") {
				console.log("Customers loaded:", customersResult.value.data);
				setCustomers(customersResult.value.data);
			} else {
				console.error("Failed to load customers:", customersResult.reason);
				hasError = true;
				errorMessages.push(
					`Error fetching customers: ${customersResult.reason.message}`
				);
			}

			// Handle resellers result
			const resellersResult = results[3];
			if (resellersResult.status === "fulfilled") {
				console.log("Resellers loaded:", resellersResult.value.data);
				setResellers(resellersResult.value.data);
			} else {
				console.error("Failed to load resellers:", resellersResult.reason);
				hasError = true;
				errorMessages.push(
					`Error fetching resellers: ${resellersResult.reason.message}`
				);
			}

			if (hasError) {
				setError(errorMessages.join(". "));
			}
		} catch (err) {
			console.error("Data fetch error:", err);
			setError(
				`Connection error: ${err.message}. Please check if the backend server is running.`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const checkBackend = async () => {
		try {
			const response = await fetch("http://localhost:3001/api/health-check");
			if (!response.ok) throw new Error("Backend not healthy");
			return true;
		} catch (error) {
			console.error("Backend check failed:", error);
			throw new Error(
				"Backend tidak dapat dihubungi. Silakan coba lagi nanti."
			);
		}
	};

	const fetchProducts = async () => {
		setIsLoading(true);
		try {
			const response = await api.get("/products");
			console.log("Products data:", response.data);
			setProducts(response.data);
		} catch (err) {
			console.error("Error fetching products:", err);
			setError("Failed to load products: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchPackages = async () => {
		setIsLoading(true);
		try {
			console.log("Fetching packages...");
			const response = await api.get("/packages");
			console.log("Packages data:", response.data);

			if (!Array.isArray(response.data)) {
				throw new Error("Invalid packages data format");
			}

			setPackages(response.data);
			return response.data;
		} catch (error) {
			console.error("Package fetch error:", error);
			setError(
				"Failed to load packages: " +
					(error.response?.data?.message || error.message)
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Product handlers
	const handleProductChange = (e) => {
		const { name, value } = e.target;
		setNewProduct((prev) => ({
			...prev,
			[name]: name === "price" ? parseFloat(value) || 0 : value,
		}));
	};

	const createProduct = async () => {
		setIsCreating(true);
		try {
			const response = await api.post("/products", newProduct);
			setNewProduct({ name: "", price: 0, description: "" });
			await fetchProducts(); // Refresh products after creation
			return response.data;
		} catch (err) {
			console.error("Failed to create product", err);
			setError("Failed to create product: " + err.message);
			throw err;
		} finally {
			setIsCreating(false);
		}
	};

	// Handle product edit
	const handleProductEdit = async (product) => {
		setIsLoading(true);
		setError(null);
		try {
			await api.put(`/products/${product.id}`, product);
			await fetchProducts();
		} catch (err) {
			console.error("Failed to update product", err);
			setError("Failed to update product: " + err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	// Handle product delete
	const handleProductDelete = async (productId) => {
		setIsLoading(true);
		setError(null);
		try {
			await api.delete(`/products/${productId}`);
			await fetchProducts();
		} catch (err) {
			console.error("Failed to delete product", err);
			setError("Failed to delete product: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Package handlers
	const handlePackageChange = (e) => {
		const { name, value } = e.target;
		setNewPackage((prev) => ({
			...prev,
			[name]: name === "payment_amount" ? parseFloat(value) || 0 : value,
		}));
	};

	const toggleProductInPackage = (productId) => {
		setNewPackage((prev) => {
			const productIds = prev.productIds.includes(productId)
				? prev.productIds.filter((id) => id !== productId)
				: [...prev.productIds, productId];

			// Calculate total price of selected products
			const selectedProducts = products.filter((p) =>
				productIds.includes(p.id)
			);
			const totalAmount = selectedProducts.reduce(
				(sum, product) => sum + product.price,
				0
			);

			return {
				...prev,
				productIds,
				payment_amount: totalAmount,
			};
		});
	};

	const createPackage = async () => {
		setIsCreating(true);
		try {
			const response = await api.post("/packages", {
				name: newPackage.name,
				description: newPackage.description,
				payment_method: newPackage.payment_method.toUpperCase(),
				payment_amount: parseFloat(newPackage.payment_amount),
				payment_months: parseInt(newPackage.payment_months), // Ensure it's a number
				productIds: newPackage.productIds,
			});

			console.log("Package created:", response.data);
			alert("Package created successfully!");

			// Reset form
			setNewPackage({
				name: "",
				description: "",
				payment_method: "daily",
				payment_amount: 0,
				payment_months: 0,
				productIds: [],
			});

			// Refresh data
			await fetchPackages();
		} catch (error) {
			console.error("Error creating package:", error);
			setError(
				`Failed to create package: ${
					error.response?.data?.message || error.message
				}`
			);
			alert(`Failed: ${error.response?.data?.message || error.message}`);
		} finally {
			setIsCreating(false);
		}
	};

	const createReseller = async (resellerData) => {
		setIsLoading(true);
		setError(null);
		try {
			// Ensure username is included in the resellerData
			if (!resellerData.username) {
				throw new Error("Username is required");
			}
			const response = await api.post(`/users/resellers`, resellerData);
			setResellers((prev) => [...prev, response.data]);
			return response.data;
		} catch (err) {
			console.error("Failed to create reseller", err);
			setError(err.response?.data?.message || "Failed to create reseller");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const updateReseller = async (id, updateData) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await api.put(`/users/resellers/${id}`, updateData);
			setResellers((prev) =>
				prev.map((r) => (r.id === id ? response.data : r))
			);
		} catch (err) {
			console.error("Failed to update reseller", err);
			setError("Failed to update reseller: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditPackage = async (packageData) => {
		try {
			const response = await api.put(`/packages/${packageData.id}`, {
				...packageData,
				productIds: packageData.productIds,
			});
			await fetchPackages();
			return response.data;
		} catch (error) {
			throw error;
		}
	};

	const deleteReseller = async (id) => {
		setIsLoading(true);
		setError(null);
		try {
			await api.delete(`/users/resellers/${id}`);
			setResellers((prev) => prev.filter((r) => r.id !== id));
		} catch (err) {
			console.error("Failed to delete reseller", err);
			setError("Failed to delete reseller: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle package edit
	const handlePackageEdit = async (pkg) => {
		setIsLoading(true);
		setError(null);
		try {
			await api.put(`/packages/${pkg.id}`, {
				name: pkg.name,
				description: pkg.description,
				payment_method: pkg.payment_method.toUpperCase(),
				payment_amount: parseFloat(pkg.payment_amount),
				payment_months: pkg.payment_months,
				productIds: pkg.productIds,
			});
			await fetchPackages();
		} catch (err) {
			console.error("Failed to update package", err);
			setError("Failed to update package: " + err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditProduct = async (productId, productData) => {
		try {
			const response = await api.put(`/products/${productId}`, productData);
			// Refresh your packages to show the updated product
			await fetchPackages();
			return response.data;
		} catch (error) {
			throw error;
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
			closeDeleteModal();
			await onRefresh(); // Refresh the package list
		} catch (err) {
			console.error("Delete error:", err.response?.data || err.message);
			setNotification({
				type: "error",
				message:
					err.response?.data?.message ||
					"Failed to delete package. Please try again.",
			});
		}
	};

	// Handle package delete
	const handlePackageDelete = async (packageId) => {
		setIsLoading(true);
		setError(null);
		try {
			await api.delete(`/packages/${packageId}`);
			await fetchPackages();
		} catch (err) {
			console.error("Delete error details:", err.response?.data || err.message);
			setError(
				err.response?.data?.message ||
					"Failed to delete package. It may still contain products."
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Payment confirmation
	const handleConfirmPayment = async (selectedDates) => {
		if (!selectedCustomer || !selectedPackage) {
			alert("Please select both customer and package to confirm payment.");
			return;
		}

		setIsLoading(true);
		try {
			const payments = selectedDates.map((date) => ({
				user_id: selectedCustomer.id,
				package_id: selectedPackage.id,
				payment_date: new Date(date).toISOString(),
				amount: selectedPackage.payment_amount,
				status: "confirmed",
				payment_start_date: paymentStartDate.toISOString(),
				payment_months: paymentmonths,
			}));

			await api.post("/payments/bulk", { payments });
			alert("Payments confirmed successfully!");
			await fetchData();
		} catch (err) {
			console.error("Failed to confirm payment", err);
			setError("Failed to confirm payments: " + err.message);
			alert("Failed to confirm payments: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleProductSelect = (product) => {
		setSelectedProduct(product);
		navigate(`/admin/products/${product.id}`);
	};

	const addCustomer = async (resellerId, customerData) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await api.post(
				`/resellers/${resellerId}/customers`,
				customerData
			);
			setCustomers((prev) => [...prev, response.data]);
		} catch (err) {
			console.error("Failed to add customer", err);
			setError("Failed to add customer: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const updateCustomer = async (id, updateData) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await api.put(`/customers/${id}`, updateData);
			setCustomers((prev) =>
				prev.map((c) => (c.id === id ? response.data : c))
			);
		} catch (err) {
			console.error("Failed to update customer", err);
			setError("Failed to update customer: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const deleteCustomer = async (id) => {
		setIsLoading(true);
		setError(null);
		try {
			await api.delete(`/customers/${id}`);
			setCustomers((prev) => prev.filter((c) => c.id !== id));
		} catch (err) {
			console.error("Failed to delete customer", err);
			setError("Failed to delete customer: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};
	const updateCustomerPackage = async (id, packageData) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await api.put(`/customers/${id}/package`, packageData);
			setCustomers((prev) =>
				prev.map((c) => (c.id === id ? response.data : c))
			);
		} catch (err) {
			console.error("Failed to update customer package", err);
			setError("Failed to update customer package: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const calculateDailyRate = (packageAmount, paymentMethod) => {
		switch (paymentMethod) {
			case "daily":
				return packageAmount;
			case "weekly":
				return packageAmount / 7;
			case "monthly":
				return packageAmount / 30;
			default:
				return packageAmount;
		}
	};

	const calculateTotalAmount = () => {
		if (!selectedPackage) return 0;

		const dailyRate = calculateDailyRate(
			selectedPackage.payment_amount,
			selectedPackage.payment_method
		);
		const total = selectedDates.length * dailyRate;
		setTotalAmount(total);
	};

	const handleDateSelect = (date) => {
		const dateStr = format(date, "yyyy-MM-dd");

		// Check if date is already paid
		if (currentUser && currentUser.paid_dates.includes(dateStr)) {
			return; // Already paid, can't select
		}

		setSelectedDates((prev) => {
			if (prev.includes(dateStr)) {
				return prev.filter((d) => d !== dateStr);
			} else {
				return [...prev, dateStr];
			}
		});
	};

	// Payment handlers
	const handlePaymentSubmit = async (paymentData) => {
		try {
			// 1. Send payment data to backend
			const response = await api.post("/payments", paymentData);

			// 2. Update local state
			setCustomers((prevCustomers) =>
				prevCustomers.map((c) => {
					if (c.id === paymentData.customerId) {
						return {
							...c,
							paid_amount: (c.paid_amount || 0) + paymentData.amount,
							paid_dates: [
								...(c.paid_dates || []),
								...paymentData.selectedDates,
							],
							payment_history: [
								...(c.payment_history || []),
								{
									date: format(new Date(paymentData.paymentDate)),
									amount: paymentData.amount,
									dates: paymentData.selectedDates,
								},
							],
						};
					}
					return c;
				})
			);

			// 3. Show success notification
			toast.success("Payment confirmed successfully");
		} catch (error) {
			console.error("Payment failed:", error);
			toast.error(`Payment failed: ${error.message}`);
		}
	};

	// Calculate total price for package preview
	const calculatePackageTotal = () => {
		return newPackage.productIds.reduce((total, productId) => {
			const product = products.find((p) => p.id === productId);
			return total + (product?.price || 0);
		}, 0);
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "products":
				return (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<ProductForm
							newProduct={newProduct}
							handleProductChange={handleProductChange}
							createProduct={createProduct}
							isLoading={isCreating}
						/>
						<ProductList
							products={products}
							onProductSelect={handleProductSelect}
							selectedProductId={selectedProduct?.id}
							isLoading={isLoading}
							onRefresh={fetchProducts}
							error={error}
							onEdit={handleProductEdit}
							onDelete={handleProductDelete}
						/>
					</div>
				);
			case "packages":
				return (
					<div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
						<PackageForm
							newPackage={newPackage}
							products={products}
							handlePackageChange={handlePackageChange}
							toggleProductInPackage={toggleProductInPackage}
							calculatePackageTotal={calculatePackageTotal}
							createPackage={createPackage}
							isLoading={isCreating}
						/>
						<PackageList
							packages={packages}
							products={products}
							isLoading={isLoading}
							error={error}
							onRefresh={fetchPackages}
							onEdit={handlePackageEdit} // <-- Pass the edit handler
							onEditProduct={handleEditProduct}
							onEditPackage={handleEditPackage}
							onDelete={handlePackageDelete} // <-- Pass the delete handler
						/>
					</div>
				);
			case "customers":
				return (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-2xl font-bold mb-6 text-gray-800">
							Akun Customer Management
						</h2>
						<CustomerTable
							customers={customers}
							packages={packages}
							onSelectCustomer={setSelectedCustomer}
							isLoading={isLoading}
							error={error}
							onRefresh={() => fetchData()}
						/>
					</div>
				);
			case "resellers":
				return (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h2 className="text-2xl font-bold mb-6 text-gray-800">
							Akun Reseller Management
						</h2>
						<ResellerTable
							resellers={resellers}
							customers={customers}
							packages={packages}
							onCreateReseller={createReseller}
							onUpdateReseller={updateReseller}
							onDeleteReseller={deleteReseller}
							onAddCustomer={addCustomer}
							onUpdateCustomer={updateCustomer}
							onDeleteCustomer={deleteCustomer}
							onUpdateCustomerPackage={updateCustomerPackage}
							isLoading={isLoading}
							error={error}
							onRefresh={() => fetchData()}
						/>
					</div>
				);
			case "confirmations":
				return (
					<PaymentConfirmation
						customers={customers}
						packages={packages}
						selectedCustomer={selectedCustomer}
						setSelectedCustomer={setSelectedCustomer}
						selectedPackage={selectedPackage}
						setSelectedPackage={setSelectedPackage}
						paymentStartDate={paymentStartDate}
						setPaymentStartDate={setPaymentStartDate}
						paymentMonths={paymentMonths}
						setPaymentMonths={setPaymentMonths}
						onConfirm={handleConfirmPayment}
						isLoading={isLoading}
						error={error}
						onClose={() => setShowPaymentModal(false)}
						onSubmit={handlePaymentSubmit}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
			{error && (
				<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
					<p className="font-bold">Error</p>
					<p>{error}</p>
					<button
						className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 rounded"
						onClick={() => fetchData()}
					>
						Refresh Data
					</button>
				</div>
			)}
			{isLoading && (
				<div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
					<p className="font-bold">Loading...</p>
					<p>Please wait while we fetch the data.</p>
				</div>
			)}
			{renderTabContent()}
		</AdminLayout>
	);
}

export default AdminPanel;
