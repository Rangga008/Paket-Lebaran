import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";

// Icons component
const Icons = {
	Plus: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="12" y1="5" x2="12" y2="19"></line>
			<line x1="5" y1="12" x2="19" y2="12"></line>
		</svg>
	),
	Edit: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
		</svg>
	),
	Delete: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="3 6 5 6 21 6"></polyline>
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
		</svg>
	),
	Key: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
		</svg>
	),
	UserPlus: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
			<circle cx="8.5" cy="7" r="4"></circle>
			<line x1="20" y1="8" x2="20" y2="14"></line>
			<line x1="23" y1="11" x2="17" y2="11"></line>
		</svg>
	),
	ArrowLeft: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="19" y1="12" x2="5" y2="12"></line>
			<polyline points="12 19 5 12 12 5"></polyline>
		</svg>
	),
};

// Notification component
const Notification = ({ message, type, onClose }) => {
	const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
	const textColor = type === "success" ? "text-green-800" : "text-red-800";
	const borderColor =
		type === "success" ? "border-green-400" : "border-red-400";

	return (
		<div
			className={`fixed top-4 right-4 p-4 mb-4 ${bgColor} ${textColor} ${borderColor} border rounded-lg shadow-lg z-50 flex items-center justify-between`}
		>
			<div className="flex items-center">
				<span className="mr-2">{message}</span>
			</div>
			<button
				onClick={onClose}
				className="ml-4 text-gray-500 hover:text-gray-700"
			>
				&times;
			</button>
		</div>
	);
};

// Modal component
const Modal = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
				<div className="border-b px-6 py-4 flex justify-between items-center">
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500"
					>
						<svg
							className="h-6 w-6"
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
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};

// Button component
const Button = ({
	children,
	variant = "primary",
	onClick,
	className = "",
	...props
}) => {
	const variants = {
		primary: "bg-blue-600 hover:bg-blue-700 text-white",
		secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
		danger: "bg-red-600 hover:bg-red-700 text-white",
		success: "bg-green-600 hover:bg-green-700 text-white",
		warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
		info: "bg-purple-600 hover:bg-purple-700 text-white",
	};

	return (
		<button
			className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${variants[variant]} ${className}`}
			onClick={onClick}
			{...props}
		>
			{children}
		</button>
	);
};

function CustomerManagement() {
	const { resellerId } = useParams();
	const navigate = useNavigate();

	const [reseller, setReseller] = useState(null);
	const [customers, setCustomers] = useState([]);
	const [allCustomers, setAllCustomers] = useState([]);
	const [packages, setPackages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [notification, setNotification] = useState(null);
	const [showUnassignModal, setShowUnassignModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [selectedCustomerForAction, setSelectedCustomerForAction] =
		useState(null);

	// Modal states
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [showAssignCustomerModal, setShowAssignCustomerModal] = useState(false);
	const [selectedPackage, setSelectedPackage] = useState("");
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
	const selectedPkg = packages.find((pkg) => pkg.id === selectedPackage);
	const paymentMethod = selectedPkg ? selectedPkg.payment_method : "";

	// Form states
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [selectedCustomerToAssign, setSelectedCustomerToAssign] =
		useState(null);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		name: "",
		phone: "",
		package_id: null,
		payment_method: null,
		package_start_date: "", // new field for package start date
	});
	const [assignPackageStartDate, setAssignPackageStartDate] = useState("");
	const [newPassword, setNewPassword] = useState("");

	// Fetch reseller data
	useEffect(() => {
		const fetchReseller = async () => {
			try {
				const response = await api.get(`/users/resellers/${resellerId}`);
				setReseller(response.data);
			} catch (err) {
				setError("Failed to fetch reseller: " + err.message);
			}
		};
		fetchReseller();
	}, [resellerId]);

	// Fetch data
	const fetchCustomers = async () => {
		setIsLoading(true);
		try {
			const response = await api.get(
				`/users/customers?reseller_id=${resellerId}&role=CUSTOMER`
			);
			setCustomers(response.data);
		} catch (err) {
			showNotification("Failed to fetch customers: " + err.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAllCustomers = async () => {
		try {
			const response = await api.get("/users/customers?role=CUSTOMER");
			setAllCustomers(response.data);
		} catch (err) {
			showNotification(
				"Failed to fetch all customers: " + err.message,
				"error"
			);
		}
	};

	const fetchPackages = async () => {
		try {
			const response = await api.get("/packages");
			setPackages(response.data);
		} catch (err) {
			showNotification("Failed to fetch packages: " + err.message, "error");
		}
	};

	useEffect(() => {
		if (selectedPackage) {
			const pkg = packages.find((p) => p.id === selectedPackage);
			if (pkg) {
				setSelectedPaymentMethod(pkg.payment_method);
			} else {
				setSelectedPaymentMethod("");
			}
		} else {
			setSelectedPaymentMethod("");
		}
	}, [selectedPackage]);

	useEffect(() => {
		const validId = parseInt(formData.package_id);
		if (validId) {
			const selected = packages.find((pkg) => pkg.id === validId);
			if (selected) {
				setFormData((prev) => ({
					...prev,
					payment_method: selected.payment_method,
				}));
			}
		} else {
			// Reset payment_method kalau belum ada paket valid
			setFormData((prev) => ({
				...prev,
				payment_method: null,
			}));
		}
	}, [formData.package_id]);

	const handlePackageChange = (e) => {
		const value = e.target.value;
		const selected = packages.find((pkg) => pkg.id === parseInt(value));

		setFormData((prev) => ({
			...prev,
			package_id: value,
			payment_method: selected ? selected.payment_method : null,
		}));
	};

	useEffect(() => {
		fetchCustomers();
		fetchPackages();
		fetchAllCustomers();
	}, [resellerId]);

	// Notification handler
	const showNotification = (message, type) => {
		setNotification({ message, type });
		setTimeout(() => setNotification(null), 5000);
	};

	// Modal handlers
	const openCreateModal = () => {
		setFormData({
			username: "",
			password: "",
			name: "",
			phone: "",
			package_id: null,
			payment_method: null,
		});
		setSelectedCustomer(null);
		setShowCreateModal(true);
	};

	const openEditModal = (customer) => {
		setSelectedCustomer(customer);
		setFormData({
			username: customer.username || "",
			password: "",
			name: customer.name || "",
			phone: customer.phone || "",
			package_id: customer.package_id || null,
			payment_method: customer.payment_method || null,
			package_start_date: customer.package_start_date
				? new Date(customer.package_start_date).toISOString().split("T")[0]
				: "",
		});
		setShowEditModal(true);
	};

	const openResetPasswordModal = (customer) => {
		setSelectedCustomer(customer);
		setNewPassword("");
		setShowResetPasswordModal(true);
	};

	const openAssignCustomerModal = () => {
		setSelectedCustomerToAssign(null);
		setShowAssignCustomerModal(true);
	};

	const openUnassignModal = (customer) => {
		setSelectedCustomerForAction(customer);
		setShowUnassignModal(true);
	};

	const openDeleteModal = (customer) => {
		setSelectedCustomerForAction(customer);
		setShowDeleteModal(true);
	};

	const closeModals = () => {
		setShowUnassignModal(false);
		setShowDeleteModal(false);
		setSelectedCustomerForAction(null);
		setShowCreateModal(false);
		setShowEditModal(false);
		setShowResetPasswordModal(false);
		setShowAssignCustomerModal(false);
		setSelectedCustomer(null);
		setSelectedCustomerToAssign(null);
		setFormData({
			username: "",
			password: "",
			name: "",
			phone: "",
			package_id: null,
			payment_method: null,
		});
		setNewPassword("");
	};

	// Form handlers
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "package_id" ? (value ? parseInt(value) : null) : value,
		}));
	};

	// New handler for date input change
	const handleDateChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// API operations
	const createCustomer = async () => {
		if (!formData.username || !formData.password) {
			showNotification("Username and password are required", "error");
			return;
		}

		setIsLoading(true);
		try {
			await api.post("/users/customers", {
				...formData,
				role: "CUSTOMER",
				reseller_id: parseInt(resellerId),
				package_start_date: formData.package_start_date || null,
			});
			showNotification("Customer created successfully", "success");
			closeModals();
			await fetchCustomers(); // Auto-refresh
			await fetchAllCustomers(); // Refresh the unassigned list too
		} catch (err) {
			showNotification(
				"Failed to create customer: " +
					(err.response?.data?.message || err.message),
				"error"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const updateCustomer = async () => {
		if (!selectedCustomer) return;
		setIsLoading(true);
		try {
			await api.put(`/users/customers/${selectedCustomer.id}`, {
				username: formData.username,
				name: formData.name,
				phone: formData.phone,
				package_id: formData.package_id,
				payment_method: formData.payment_method,
				package_start_date: formData.package_start_date || null,
			});
			showNotification("Customer updated successfully", "success");
			closeModals();
			fetchCustomers();
			await fetchCustomers(); // Auto-refresh
		} catch (err) {
			showNotification(
				"Failed to update customer: " +
					(err.response?.data?.message || err.message),
				"error"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const deleteCustomer = async (customerId) => {
		setIsLoading(true);
		try {
			await api.delete(`/users/customers/${customerId}`);
			setNotification({
				message: "Customer deleted successfully!",
				type: "success",
			});
			closeModals();
			fetchCustomers(); // Refresh the customer list
		} catch (error) {
			console.error("Delete Error:", error);
			setNotification({
				message:
					"Failed to delete customer: " +
					(error.response?.data?.message || error.message),
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const unassignCustomer = async (customerId) => {
		setIsLoading(true);
		try {
			const response = await api.put(`/users/${customerId}/unassign`);

			setNotification({
				message: response.data?.message || "Customer unassigned successfully!",
				type: "success",
			});

			closeModals();
			await fetchCustomers(); // Refresh the customer list
			await fetchAllCustomers(); // Refresh the unassigned customers list
		} catch (error) {
			console.error("Unassign Error:", error);

			let errorMessage = "Failed to unassign customer";
			if (error.response) {
				errorMessage += `: ${
					error.response.data?.message || error.response.statusText
				}`;
			} else {
				errorMessage += `: ${error.message}`;
			}

			setNotification({
				message: errorMessage,
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const resetPassword = async () => {
		if (!newPassword) {
			showNotification("New password is required", "error");
			return;
		}
		if (!selectedCustomer) return;

		if (newPassword.length < 6) {
			showNotification("Password must be at least 6 characters", "error");
			return;
		}

		setIsLoading(true);
		try {
			await api.post(`/users/customers/${selectedCustomer.id}/reset-password`, {
				newPassword,
			});
			showNotification("Password reset successfully", "success");
			closeModals();
		} catch (err) {
			showNotification(
				"Failed to reset password: " +
					(err.response?.data?.message || err.message),
				"error"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const assignCustomer = async () => {
		if (!selectedCustomerToAssign) {
			setNotification({ message: "Please select a customer", type: "error" });
			return;
		}
		console.log("selectedPackage:", selectedPackage);
		console.log("selectedPaymentMethod:", selectedPaymentMethod);

		if (!selectedPackage || !selectedPaymentMethod) {
			setNotification({
				message: "Package and payment method are required",
				type: "error",
			});
			return;
		}

		setIsLoading(true);
		try {
			await api.put(`/users/${selectedCustomerToAssign}/resellers`, {
				reseller_id: resellerId, // id reseller yang login/aktif
				package_id: selectedPackage,
				payment_method: selectedPaymentMethod,
				package_start_date: assignPackageStartDate || null,
			});

			setNotification({
				message: "Customer assigned successfully!",
				type: "success",
			});
			closeModals();
			await fetchCustomers(); // Refresh assigned customers
			await fetchAllCustomers(); // Refresh unassigned customers
			// Optionally refresh data here
		} catch (error) {
			console.error("Assign Error:", error);
			setNotification({
				message:
					"Failed to assign customer: " +
					(error.response?.data?.message || error.message),
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Helper functions
	const getPackageName = (packageId) => {
		const pkg = packages.find((p) => p.id === packageId);
		return pkg ? pkg.name : "No package";
	};

	const getUnassignedCustomers = () => {
		return allCustomers.filter(
			(customer) =>
				!customer.reseller_id && !customers.some((c) => c.id === customer.id)
		);
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={() => setNotification(null)}
				/>
			)}

			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-2xl font-semibold text-gray-800">
						{reseller ? reseller.name : "Loading..."} Customers
					</h2>
					{reseller && (
						<p className="text-sm text-gray-500">
							Phone: {reseller.phone || "N/A"} | Username: @{reseller.username}
						</p>
					)}
				</div>
				<Button
					variant="secondary"
					onClick={() => navigate(-1)}
					className="flex items-center gap-2"
				>
					<Icons.ArrowLeft />
					Back to Resellers
				</Button>
				<Button
					onClick={fetchCustomers}
					variant="secondary"
					className="flex items-center gap-2"
					disabled={isLoading}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className={`${isLoading ? "animate-spin" : ""}`}
					>
						<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
						<path d="M3 3v5h5" />
						<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
						<path d="M16 16h5v5" />
					</svg>
					Refresh Data
				</Button>
			</div>

			<div className="flex flex-wrap gap-3 mb-6">
				<Button onClick={openCreateModal} className="flex items-center gap-2">
					<Icons.Plus />
					Create New Customer
				</Button>
				<Button
					onClick={openAssignCustomerModal}
					variant="info"
					className="flex items-center gap-2"
				>
					<Icons.UserPlus />
					Assign Existing Customer
				</Button>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Customer
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								No hp
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Paket
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Method Pembayaran
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Aksi
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{customers.length === 0 ? (
							<tr>
								<td colSpan="5" className="px-6 py-4 text-center text-gray-500">
									No customers found
								</td>
							</tr>
						) : (
							customers.map((customer) => (
								<tr key={customer.id} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
												{customer.name.charAt(0).toUpperCase()}
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">
													{customer.name}
												</div>
												<div className="text-sm text-gray-500">
													@{customer.username}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{customer.phone || "N/A"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{getPackageName(customer.package_id)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{customer.payment_method || "N/A"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex space-x-2">
											<button
												onClick={() => openEditModal(customer)}
												className="text-yellow-600 hover:text-yellow-900 flex items-center gap-1"
												title="Edit"
											>
												<Icons.Edit />
											</button>
											<button
												onClick={() => openResetPasswordModal(customer)}
												className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
												title="Reset Password"
											>
												<Icons.Key />
											</button>
											<button
												onClick={() => openUnassignModal(customer)}
												className="text-green-600 hover:text-green-100 flex items-center gap-1"
											>
												<Icons.Key />
											</button>
											<button
												onClick={() => openDeleteModal(customer)}
												className="text-red-600 hover:text-red-900 flex items-center gap-1"
												title="Delete"
											>
												<Icons.Delete />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Create Customer Modal */}
			<Modal
				isOpen={showCreateModal}
				onClose={closeModals}
				title="Create New Customer"
			>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Username
							</label>
							<input
								type="text"
								name="username"
								placeholder="Username"
								value={formData.username}
								onChange={handleInputChange}
								className="w-full border border-gray-300 rounded-md p-2"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Password
							</label>
							<input
								type="password"
								name="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleInputChange}
								className="w-full border border-gray-300 rounded-md p-2"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nama
						</label>
						<input
							type="text"
							name="name"
							placeholder="Nama"
							value={formData.name}
							onChange={handleInputChange}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<input
							type="text"
							name="phone"
							placeholder="Phone Number"
							value={formData.phone}
							onChange={handleInputChange}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Package
							</label>
							<select
								name="package_id"
								onChange={(e) => {
									const value = e.target.value;
									handleInputChange(e);

									if (value === "") {
										// Kalau balik ke 'Select Package', kosongkan payment method
										setFormData((prev) => ({
											...prev,
											payment_method: "",
										}));
									} else {
										const selectedPkg = packages.find(
											(pkg) => pkg.id === parseInt(value)
										);
										setFormData((prev) => ({
											...prev,
											payment_method: selectedPkg?.payment_method || "",
										}));
									}
								}}
								className="w-full border border-gray-300 rounded-md p-2"
							>
								<option value="">Select Package</option>
								{packages.map((pkg) => (
									<option key={pkg.id} value={pkg.id}>
										{pkg.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Payment Method
							</label>
							<div className="p-2 border border-gray-300 rounded-md bg-gray-100">
								{!formData.payment_method && "Pilih paket dulu ya~"}
								{formData.payment_method === "DAILY" && "Harian"}
								{formData.payment_method === "WEEKLY" && "Mingguan"}
								{formData.payment_method === "MONTHLY" && "Bulanan"}
							</div>
						</div>
					</div>
					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Package Start Date
						</label>
						<input
							type="date"
							name="package_start_date"
							value={formData.package_start_date}
							onChange={handleDateChange}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button onClick={createCustomer} disabled={isLoading}>
						Create Customer
					</Button>
				</div>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={showDeleteModal}
				onClose={closeModals}
				title="Confirm Deletion"
			>
				<div className="space-y-4">
					<p className="text-gray-700">
						Are you sure you want to delete customer{" "}
						<span className="font-semibold">
							{selectedCustomerForAction?.name || "this customer"}?
						</span>
					</p>
					<p className="text-sm text-red-600">
						Warning: This action cannot be undone. All customer data will be
						permanently removed.
					</p>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={() => {
							if (selectedCustomerForAction) {
								deleteCustomer(selectedCustomerForAction.id);
							}
						}}
						disabled={isLoading}
					>
						{isLoading ? "Deleting..." : "Delete Permanently"}
					</Button>
				</div>
			</Modal>

			{/* Unassign Confirmation Modal */}
			<Modal
				isOpen={showUnassignModal}
				onClose={closeModals}
				title="Confirm Unassign"
			>
				<div className="space-y-4">
					<p className="text-gray-700">
						Are you sure you want to unassign customer{" "}
						<span className="font-semibold">
							{selectedCustomerForAction?.name || "this customer"}?
						</span>
					</p>
					<p className="text-sm text-yellow-600">
						Note: The customer will be removed from this reseller but their
						account will remain active.
					</p>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button
						variant="warning"
						onClick={() => {
							if (selectedCustomerForAction) {
								unassignCustomer(selectedCustomerForAction.id);
							}
						}}
						disabled={isLoading}
					>
						{isLoading ? "Processing..." : "Confirm Unassign"}
					</Button>
				</div>
			</Modal>

			{/* Edit Customer Modal */}
			<Modal isOpen={showEditModal} onClose={closeModals} title="Edit Customer">
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Username
						</label>
						<input
							type="text"
							name="username"
							placeholder="Username"
							value={formData.username}
							onChange={handleInputChange}
							className="w-full border border-gray-300 rounded-md p-2"
							disabled
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							type="text"
							name="name"
							placeholder="Full Name"
							value={formData.name}
							onChange={handleInputChange}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<input
							type="text"
							name="phone"
							placeholder="Phone Number"
							value={formData.phone}
							onChange={handleInputChange}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Package
							</label>
							<select
								name="package_id"
								value={formData.package_id || ""}
								onChange={(e) => {
									const value = e.target.value;
									handleInputChange(e);

									const selectedPkg = packages.find(
										(pkg) => pkg.id === parseInt(value)
									);
									setFormData((prev) => ({
										...prev,
										payment_method: selectedPkg?.payment_method || "",
									}));
								}}
								className="w-full border border-gray-300 rounded-md p-2"
							>
								<option value="">Select Package</option>
								{packages.map((pkg) => (
									<option key={pkg.id} value={pkg.id}>
										{pkg.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Payment Method
							</label>
							<div className="p-2 border border-gray-300 rounded-md bg-gray-100">
								{formData.payment_method === "DAILY" && "Harian"}
								{formData.payment_method === "WEEKLY" && "Mingguan"}
								{formData.payment_method === "MONTHLY" && "Bulanan"}
								{!formData.payment_method && "Pilih paket dulu ya~"}
							</div>
						</div>
					</div>
					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Package Start Date
						</label>
						<input
							type="date"
							name="package_start_date"
							value={formData.package_start_date}
							onChange={handleDateChange}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button
						variant="warning"
						onClick={updateCustomer}
						disabled={isLoading}
					>
						Update Customer
					</Button>
				</div>
			</Modal>

			{/* Reset Password Modal */}
			<Modal
				isOpen={showResetPasswordModal}
				onClose={closeModals}
				title="Reset Password"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							New Password
						</label>
						<input
							type="password"
							placeholder="New Password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button variant="info" onClick={resetPassword} disabled={isLoading}>
						Reset Password
					</Button>
				</div>
			</Modal>

			{/* Assign Customer Modal */}
			<Modal
				isOpen={showAssignCustomerModal}
				onClose={closeModals}
				title="Assign Existing Customer"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Select Customer
						</label>
						<select
							value={selectedCustomerToAssign || ""}
							onChange={(e) => setSelectedCustomerToAssign(e.target.value)}
							className="w-full border border-gray-300 rounded-md p-2"
						>
							<option value="">Select a customer</option>
							{getUnassignedCustomers().map((customer) => (
								<option key={customer.id} value={customer.id}>
									{customer.name} (@{customer.username})
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Pilih Paket
						</label>
						<select
							value={selectedPackage || ""}
							onChange={(e) => setSelectedPackage(parseInt(e.target.value))}
							className="w-full border border-gray-300 rounded-md p-2"
						>
							<option value="">Pilih paket</option>
							{packages.map((pkg) => (
								<option key={pkg.id} value={pkg.id}>
									{pkg.name} ({pkg.payment_amount} IDR)
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Metode Pembayaran
						</label>
						<div className="p-2 border border-gray-300 rounded-md bg-gray-100">
							{paymentMethod === "DAILY" && "Harian"}
							{paymentMethod === "WEEKLY" && "Mingguan"}
							{paymentMethod === "MONTHLY" && "Bulanan"}
							{!paymentMethod && "Pilih paket dulu ya~"}
						</div>
					</div>
					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Package Start Date
						</label>
						<input
							type="date"
							name="package_start_date"
							value={assignPackageStartDate}
							onChange={(e) => setAssignPackageStartDate(e.target.value)}
							className="w-full border border-gray-300 rounded-md p-2"
						/>
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button onClick={assignCustomer} disabled={isLoading}>
						Assign Customer
					</Button>
				</div>
			</Modal>
		</div>
	);
}

export default CustomerManagement;
