import React, { useState } from "react";
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
	Eye: () => (
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
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
			<circle cx="12" cy="12" r="3"></circle>
		</svg>
	),
	X: () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
	),
	CheckCircle: () => (
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
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
			<polyline points="22 4 12 14.01 9 11.01"></polyline>
		</svg>
	),
	AlertCircle: () => (
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
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="12" y1="8" x2="12" y2="12"></line>
			<line x1="12" y1="16" x2="12.01" y2="16"></line>
		</svg>
	),
};

// Notification component with animation
const Notification = ({ message, type, onClose }) => {
	const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
	const textColor = type === "success" ? "text-green-800" : "text-red-800";
	const borderColor =
		type === "success" ? "border-green-400" : "border-red-400";
	const Icon = type === "success" ? Icons.CheckCircle : Icons.AlertCircle;

	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (onClose) onClose();
		}, 4000);
		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<div
			className={`fixed top-4 right-4 flex items-center p-4 mb-4 ${bgColor} ${textColor} ${borderColor} border rounded-lg shadow-lg transition-all transform animate-fade-in z-50`}
		>
			<div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2">
				<Icon />
			</div>
			<div className="ml-2 text-sm font-medium">{message}</div>
			<button
				type="button"
				onClick={onClose}
				className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-200"
			>
				<span className="sr-only">Close</span>
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
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	);
};

// Modern Modal Component with animation
const Modal = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
		>
			<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
					aria-hidden="true"
					onClick={onClose}
				></div>

				<span
					className="hidden sm:inline-block sm:align-middle sm:h-screen"
					aria-hidden="true"
				>
					&#8203;
				</span>

				<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-modal-in">
					<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div className="sm:flex sm:items-start">
							<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
								<div className="flex justify-between items-center border-b pb-3">
									<h3
										className="text-lg leading-6 font-medium text-gray-900"
										id="modal-title"
									>
										{title}
									</h3>
									<button
										onClick={onClose}
										className="text-gray-400 hover:text-gray-500"
									>
										<Icons.X />
									</button>
								</div>
								<div className="mt-4">{children}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Button component with variants
const Button = ({
	children,
	variant = "primary",
	className = "",
	onClick,
	...props
}) => {
	const baseClasses =
		"inline-flex justify-center items-center px-4 py-2 border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

	const variants = {
		primary:
			"bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500",
		secondary:
			"bg-white hover:bg-gray-50 text-gray-700 border-gray-300 focus:ring-blue-500",
		success:
			"bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500",
		danger:
			"bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500",
		warning:
			"bg-yellow-600 hover:bg-yellow-700 text-white border-transparent focus:ring-yellow-500",
		info: "bg-purple-600 hover:bg-purple-700 text-white border-transparent focus:ring-purple-500",
	};

	const variantClasses = variants[variant] || variants.primary;

	return (
		<button
			className={`${baseClasses} ${variantClasses} ${className}`}
			onClick={onClick}
			{...props}
		>
			{children}
		</button>
	);
};

// Input component
const Input = ({ label, id, error, ...props }) => {
	return (
		<div className="mb-4">
			{label && (
				<label
					htmlFor={id}
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					{label}
				</label>
			)}
			<input
				id={id}
				className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border ${
					error
						? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
						: ""
				}`}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};

// Select component
const Select = ({ label, id, children, ...props }) => {
	return (
		<div className="mb-4">
			{label && (
				<label
					htmlFor={id}
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					{label}
				</label>
			)}
			<select
				id={id}
				className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
				{...props}
			>
				{children}
			</select>
		</div>
	);
};

// Badge component
const Badge = ({ children, variant = "success" }) => {
	const variants = {
		success: "bg-green-100 text-green-800",
		warning: "bg-yellow-100 text-yellow-800",
		danger: "bg-red-100 text-red-800",
		info: "bg-blue-100 text-blue-800",
	};

	const variantClasses = variants[variant] || variants.success;

	return (
		<span
			className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${variantClasses}`}
		>
			{children}
		</span>
	);
};

// Customer Table Component
const CustomerTable = ({
	customers,
	packages,
	onSelectCustomer,
	onRefresh,
}) => {
	const [editingCustomer, setEditingCustomer] = useState(null);
	const [newCustomerData, setNewCustomerData] = useState({
		username: "",
		password: "",
		name: "",
		phone: "",
		role: "customer",
		package_id: null,
	});
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [resetPasswordCustomerId, setResetPasswordCustomerId] = useState(null);
	const [newPassword, setNewPassword] = useState("");
	const [notification, setNotification] = useState(null);
	const [errors, setErrors] = useState({});

	const currentUser = JSON.parse(localStorage.getItem("user"));

	// Form validation
	const validateForm = (data, isCreate = false) => {
		const errors = {};

		if (!data.name.trim()) errors.name = "Name is required";

		if (isCreate) {
			if (!data.username.trim()) errors.username = "Username is required";
			if (!data.password.trim()) errors.password = "Password is required";
			else if (data.password.length < 6)
				errors.password = "Password must be at least 6 characters";
		}

		return errors;
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewCustomerData((prev) => ({ ...prev, [name]: value }));

		// Clear specific error when field is changed
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const openCreateModal = () => {
		setNewCustomerData({
			username: "",
			password: "",
			name: "",
			phone: "",
			role: "customer",
			package_id: null,
		});
		setErrors({});
		setShowCreateModal(true);
	};

	const openEditModal = (customer) => {
		if (customer.id === currentUser?.id) return;
		setEditingCustomer(customer);
		setNewCustomerData({
			username: customer.username || "",
			name: customer.name || "",
			phone: customer.phone || "",
			password: "",
			role: customer.role || "customer",
			package_id: customer.package_id || null,
		});
		setErrors({});
		setShowEditModal(true);
	};

	const closeModals = () => {
		setShowCreateModal(false);
		setShowEditModal(false);
		setShowResetPasswordModal(false);
		setEditingCustomer(null);
		setResetPasswordCustomerId(null);
		setNewPassword("");
		setErrors({});
	};

	const createCustomer = async () => {
		try {
			const validationErrors = validateForm(newCustomerData, true);
			if (Object.keys(validationErrors).length > 0) {
				setErrors(validationErrors);
				return;
			}

			// Check if username already exists
			const usernameExists = customers.some(
				(customer) => customer.username === newCustomerData.username
			);
			if (usernameExists) {
				setErrors({
					username: "Username already exists. Please choose another.",
				});
				return;
			}

			const payload = {
				username: newCustomerData.username,
				password: newCustomerData.password,
				name: newCustomerData.name,
				phone: newCustomerData.phone || null,
				role: "CUSTOMER",
				package_id: newCustomerData.package_id || null,
			};

			await api.post("/users/customers", payload);

			setNotification({
				message: "Customer created successfully",
				type: "success",
			});
			closeModals();
			onRefresh();
		} catch (error) {
			console.error("Create customer error:", error.response?.data || error);
			setNotification({
				message:
					"Failed to create customer: " +
					(error.response?.data?.message || error.message),
				type: "error",
			});
		}
	};

	const updateCustomer = async () => {
		try {
			if (!editingCustomer) return;

			const validationErrors = validateForm(newCustomerData, false);
			if (Object.keys(validationErrors).length > 0) {
				setErrors(validationErrors);
				return;
			}

			await api.put(`/users/customers/${editingCustomer.id}`, newCustomerData);

			setNotification({
				message: "Customer updated successfully",
				type: "success",
			});
			closeModals();
			onRefresh();
		} catch (error) {
			setNotification({
				message:
					"Failed to update customer: " +
					(error.response?.data?.message || error.message),
				type: "error",
			});
		}
	};

	const deleteCustomer = async (customerId) => {
		try {
			await api.delete(`/users/customers/${customerId}`);

			setNotification({
				message: "Customer deleted successfully",
				type: "success",
			});
			onRefresh();
		} catch (error) {
			setNotification({
				message:
					"Failed to delete customer: " +
					(error.response?.data?.message || error.message),
				type: "error",
			});
		}
	};

	const confirmDelete = (customerId) => {
		if (window.confirm("Are you sure you want to delete this customer?")) {
			deleteCustomer(customerId);
		}
	};

	const openResetPasswordModal = (customerId) => {
		setResetPasswordCustomerId(customerId);
		setNewPassword("");
		setShowResetPasswordModal(true);
		setErrors({});
	};

	const resetPassword = async () => {
		if (!newPassword) {
			setErrors({ password: "New password is required" });
			return;
		}

		if (newPassword.length < 6) {
			setErrors({ password: "Password must be at least 6 characters" });
			return;
		}

		try {
			await api.post(
				`/users/customers/${resetPasswordCustomerId}/reset-password`,
				{
					newPassword,
				}
			);

			setNotification({
				message: "Password reset successfully",
				type: "success",
			});
			closeModals();
			console.log("ID yang dikirim:", resetPasswordCustomerId);
		} catch (error) {
			setNotification({
				message:
					"Failed to reset password: " +
					(error.response?.data?.message || error.message),
				type: "error",
			});
		}
	};

	const customerPackageName = (customer) => {
		const pkg = packages.find((p) => p.id === customer.package_id);
		return pkg ? pkg.name : "No package";
	};

	const filteredCustomers = customers.filter(
		(customer) => !["ADMIN", "RESELLER"].includes(customer.role)
	);

	const closeNotification = () => {
		setNotification(null);
	};

	// Animation CSS
	const style = document.createElement("style");
	style.innerText = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideDown {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .animate-slide-down {
      animation: slideDown 0.3s ease-in-out;
    }
    
    .animate-modal-in {
      animation: modalIn 0.3s ease-out;
    }
  `;
	document.head.appendChild(style);

	return (
		<div className="bg-white shadow-lg rounded-lg p-6">
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={closeNotification}
				/>
			)}

			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold text-gray-800">
					Customer Management
				</h2>
				<Button onClick={openCreateModal} className="flex items-center gap-2">
					<Icons.Plus />
					<span>Add Customer</span>
				</Button>
			</div>

			{/* Create Customer Modal */}
			<Modal
				isOpen={showCreateModal}
				onClose={closeModals}
				title="Create New Customer"
			>
				<div className="space-y-4">
					<Input
						label="Name"
						id="create-name"
						name="name"
						placeholder="Customer name"
						value={newCustomerData.name}
						onChange={handleInputChange}
						error={errors.name}
					/>

					<Input
						label="Username"
						id="create-username"
						name="username"
						placeholder="Login username"
						value={newCustomerData.username}
						onChange={handleInputChange}
						error={errors.username}
					/>

					<Input
						label="Phone"
						id="create-phone"
						name="phone"
						type="tel"
						placeholder="Phone number"
						value={newCustomerData.phone}
						onChange={handleInputChange}
					/>

					<Input
						label="Password"
						id="create-password"
						name="password"
						type="password"
						placeholder="Set password"
						value={newCustomerData.password}
						onChange={handleInputChange}
						error={errors.password}
					/>

					{packages.length > 0 && (
						<Select
							label="Package"
							id="create-package"
							name="package_id"
							value={newCustomerData.package_id || ""}
							onChange={handleInputChange}
						>
							<option value="">Select a package</option>
							{packages.map((pkg) => (
								<option key={pkg.id} value={pkg.id}>
									{pkg.name}
								</option>
							))}
						</Select>
					)}
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button variant="success" onClick={createCustomer}>
						Create Customer
					</Button>
				</div>
			</Modal>

			{/* Edit Customer Modal */}
			<Modal isOpen={showEditModal} onClose={closeModals} title="Edit Customer">
				<div className="space-y-4">
					<Input
						label="Name"
						id="edit-name"
						name="name"
						placeholder="Customer name"
						value={newCustomerData.name}
						onChange={handleInputChange}
						error={errors.name}
					/>

					<Input
						label="Username"
						id="edit-username"
						name="username"
						placeholder="Login username"
						value={newCustomerData.username}
						onChange={handleInputChange}
						disabled
					/>

					<Input
						label="Phone"
						id="edit-phone"
						name="phone"
						placeholder="Phone number"
						value={newCustomerData.phone}
						onChange={handleInputChange}
					/>

					{packages.length > 0 && (
						<Select
							label="Package"
							id="edit-package"
							name="package_id"
							value={newCustomerData.package_id || ""}
							onChange={handleInputChange}
						>
							<option value="">Select a package</option>
							{packages.map((pkg) => (
								<option key={pkg.id} value={pkg.id}>
									{pkg.name}
								</option>
							))}
						</Select>
					)}
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button variant="warning" onClick={updateCustomer}>
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
				<Input
					label="New Password"
					id="reset-password"
					type="password"
					placeholder="Enter new password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					error={errors.password}
				/>

				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={closeModals}>
						Cancel
					</Button>
					<Button variant="info" onClick={resetPassword}>
						Reset Password
					</Button>
				</div>
			</Modal>

			{/* Customer Table */}
			<div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Customer Nama
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Paket
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Status
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Aksi
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{filteredCustomers.length === 0 ? (
							<tr>
								<td
									colSpan="4"
									className="px-6 py-4 text-sm text-gray-500 text-center"
								>
									No customers found
								</td>
							</tr>
						) : (
							filteredCustomers.map((customer) => (
								<tr
									key={customer.id}
									className="hover:bg-gray-50 transition-colors duration-150"
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
												{customer.name.charAt(0).toUpperCase()}
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">
													@{customer.username}
												</div>
												{customer.phone && (
													<div className="text-xs text-gray-500">
														No hp:{customer.phone}
													</div>
												)}
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{customerPackageName(customer)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<Badge variant="success">Active</Badge>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										<div className="flex space-x-3">
											<button
												onClick={() => onSelectCustomer(customer)}
												className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
												title="View Payments"
											>
												<Icons.Eye />
											</button>

											{customer.id === currentUser?.id ? (
												<span
													className="text-gray-400 cursor-not-allowed flex items-center gap-1"
													title="You cannot edit your own account here"
												>
													<Icons.Edit />
												</span>
											) : (
												<button
													onClick={() => openEditModal(customer)}
													className="text-yellow-600 hover:text-yellow-900 flex items-center gap-1"
													title="Edit Customer"
												>
													<Icons.Edit />
												</button>
											)}

											<button
												onClick={() => openResetPasswordModal(customer.id)}
												className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
												title="Reset Password"
											>
												<Icons.Key />
											</button>

											<button
												onClick={() => confirmDelete(customer.id)}
												className="text-red-600 hover:text-red-900 flex items-center gap-1"
												title="Delete Customer"
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
		</div>
	);
};

export default CustomerTable;
