import React, { useState, useEffect, useMemo } from "react";
import PaymentConfirmationModal from "../../common/PaymentConfirmationModal";
import ExportAllFilterModal from "./ExportAllFilterModal";
import api from "../../../utils/api";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // For Indonesian date formatting
import * as XLSX from "xlsx";

const PaymentConfirmation = ({ customers, packages }) => {
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [showExportAllModal, setShowExportAllModal] = useState(false);
	const [refreshFlag, setRefreshFlag] = useState(false);
	const [customerPaidDates, setCustomerPaidDates] = useState([]);
	const [customerPaymentInfo, setCustomerPaymentInfo] = useState({});
	const [isExporting, setIsExporting] = useState(false);

	// UI state
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("name"); // name, package, lastPayment, paidAmount
	const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (selectedCustomer) {
			const pkg = packages.find((p) => p.id === selectedCustomer.package_id);
			setSelectedPackage(pkg || null);
		}
	}, [selectedCustomer, packages]);

	// Fetch payment info for all customers on component mount
	useEffect(() => {
		const fetchAllPaymentInfo = async () => {
			setLoading(true);
			try {
				const paymentInfoPromises = customers.map(async (customer) => {
					try {
						const response = await api.get(`/payments/customer/${customer.id}`);
						const payments = response.data;

						const paidDatesSet = new Set();
						let latestPaymentDate = null;
						let totalPaidAmount = 0;

						payments.forEach((payment) => {
							if (payment.payment_dates) {
								try {
									const dates = JSON.parse(payment.payment_dates);
									dates.forEach((date) => paidDatesSet.add(date));
								} catch (e) {
									console.error("Failed to parse payment_dates:", e);
								}
							}
							if (payment.payment_date) {
								const paymentDateObj = new Date(payment.payment_date);
								if (!latestPaymentDate || paymentDateObj > latestPaymentDate) {
									latestPaymentDate = paymentDateObj;
								}
							}
							if (payment.amount) {
								totalPaidAmount += payment.amount;
							}
						});

						return {
							customerId: customer.id,
							last_payment_date: latestPaymentDate?.toISOString() || null,
							paid_amount: totalPaidAmount,
							paid_dates: Array.from(paidDatesSet),
						};
					} catch (error) {
						console.error(
							`Failed to fetch payments for customer ${customer.id}:`,
							error
						);
						return {
							customerId: customer.id,
							last_payment_date: null,
							paid_amount: 0,
							paid_dates: [],
						};
					}
				});

				const paymentInfoArray = await Promise.all(paymentInfoPromises);
				const paymentInfoObj = {};
				paymentInfoArray.forEach((info) => {
					paymentInfoObj[info.customerId] = info;
				});

				setCustomerPaymentInfo(paymentInfoObj);
			} catch (error) {
				console.error("Failed to fetch payment info:", error);
			} finally {
				setLoading(false);
			}
		};

		if (customers.length > 0) {
			fetchAllPaymentInfo();
		}
	}, [customers, refreshFlag]);

	// Helper function to get payment method in Indonesian
	const getPaymentMethodIndonesian = (method) => {
		switch (method) {
			case "DAILY":
				return "Harian";
			case "WEEKLY":
				return "Mingguan";
			case "MONTHLY":
				return "Bulanan";
			default:
				return method;
		}
	};

	// Export to Excel function
	const handleExportExcel = async (customer) => {
		try {
			setIsExporting(true);

			// Fetch payment history for this specific customer
			const response = await api.get(`/payments/history/${customer.id}`);
			const paymentHistory = response.data || [];
			const customerPackage = packages.find(
				(p) => p.id === customer.package_id
			);

			// Prepare Excel data
			const excelData = [
				["RIWAYAT PEMBAYARAN"],
				[""],
				["Nama Pelanggan:", customer.name],
				["Paket:", customerPackage?.name || "Tidak diketahui"],
				[
					"Metode Pembayaran:",
					getPaymentMethodIndonesian(customerPackage?.payment_method),
				],
				[
					"Tarif:",
					`Rp ${customerPackage?.payment_amount?.toLocaleString("id-ID") || 0}`,
				],
				[
					"Tanggal Mulai Paket:",
					customer.package_start_date
						? format(new Date(customer.package_start_date), "dd MMMM yyyy", {
								locale: id,
						  })
						: "Tidak diketahui",
				],
				[""],
				["DAFTAR TANGGAL KONFIRMASI:"],
				["Tanggal", "Status", "Jumlah Pembayaran", "Tanggal Pembayaran"],
			];

			// Process payment history
			paymentHistory.forEach((payment) => {
				let dates = [];
				try {
					dates = payment.payment_dates
						? JSON.parse(payment.payment_dates)
						: [];
				} catch (e) {
					console.error("Error parsing payment dates:", e);
				}

				if (dates.length > 0) {
					dates.forEach((date) => {
						excelData.push([
							format(new Date(date), "dd MMMM yyyy", { locale: id }),
							payment.status || "-",
							`Rp ${payment.amount?.toLocaleString("id-ID") || 0}`,
							payment.payment_date
								? format(new Date(payment.payment_date), "dd MMMM yyyy", {
										locale: id,
								  })
								: "-",
						]);
					});
				} else {
					excelData.push([
						"-",
						payment.status || "-",
						`Rp ${payment.amount?.toLocaleString("id-ID") || 0}`,
						payment.payment_date
							? format(new Date(payment.payment_date), "dd MMMM yyyy", {
									locale: id,
							  })
							: "-",
					]);
				}
			});

			// Create and save Excel file
			const workbook = XLSX.utils.book_new();
			const worksheet = XLSX.utils.aoa_to_sheet(excelData);
			XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Pembayaran");

			const fileName = `Riwayat_Pembayaran_${customer.name.replace(
				/\s+/g,
				"_"
			)}_${format(new Date(), "ddMMyyyy")}.xlsx`;
			XLSX.writeFile(workbook, fileName);
		} catch (error) {
			console.error("Export failed:", error);
			alert("Gagal mengekspor data. Silakan coba lagi.");
		} finally {
			setIsExporting(false);
		}
	};

	const handleExportAllToExcel = async (filters) => {
		try {
			setLoading(true);
			const workbook = XLSX.utils.book_new();

			// Summary sheet
			const summaryData = [
				["LAPORAN PEMBAYARAN PELANGGAN"],
				["Tanggal Export", new Date().toLocaleDateString("id-ID")],
				["Total Pelanggan", 0], // Will be updated later
				[""],
				["DAFTAR PELANGGAN"],
				[
					"No",
					"Nama Pelanggan",
					"Paket",
					"Metode Pembayaran",
					"Tarif",
					"Tanggal Mulai Paket",
					"Total Pembayaran",
					"Terakhir Bayar",
				],
			];

			// Build query parameters from filters
			const queryParams = new URLSearchParams();
			if (filters) {
				if (filters.startDate)
					queryParams.append("startDate", filters.startDate);
				if (filters.endDate) queryParams.append("endDate", filters.endDate);
				if (filters.userIds?.length > 0) {
					queryParams.append("userIds", filters.userIds.join(","));
				}
			}

			// Fetch data using the constructed query parameters
			const response = await api.get(
				`/payments/export-all?${queryParams.toString()}`
			);
			const filteredCustomers = response.data || [];

			// Update total customers count
			summaryData[2][1] = filteredCustomers.length;

			// Process each customer
			filteredCustomers.forEach((customer, index) => {
				const pkg = customer.package;
				const payments = customer.payments || [];

				// Calculate total paid and last payment date
				const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
				const lastPayment = payments[0]; // Already ordered by date desc

				// Add to summary
				summaryData.push([
					index + 1,
					customer.customer_name || customer.name, // Handle both response formats
					pkg?.name || "-",
					pkg ? getPaymentMethodIndonesian(pkg.payment_method) : "-",
					pkg?.payment_amount
						? `Rp ${pkg.payment_amount.toLocaleString("id-ID")}`
						: "-",
					customer.package_start_date
						? format(new Date(customer.package_start_date), "dd/MM/yyyy")
						: "-",
					`Rp ${totalPaid.toLocaleString("id-ID")}`,
					lastPayment?.payment_date
						? format(new Date(lastPayment.payment_date), "dd/MM/yyyy")
						: "-",
				]);

				// Create detail sheet
				const detailData = [
					[`Detail Pembayaran: ${customer.customer_name || customer.name}`],
					["Paket", pkg?.name || "-"],
					[
						"Metode Pembayaran",
						pkg ? getPaymentMethodIndonesian(pkg.payment_method) : "-",
					],
					[
						"Tarif",
						pkg?.payment_amount
							? `Rp ${pkg.payment_amount.toLocaleString("id-ID")}`
							: "-",
					],
					[
						"Tanggal Mulai Paket",
						customer.package_start_date
							? format(new Date(customer.package_start_date), "dd/MM/yyyy")
							: "-",
					],
					[""],
					["RIWAYAT PEMBAYARAN"],
					["Tanggal", "Jumlah", "Status", "Tanggal Pembayaran"],
				];

				// Add payment history
				payments.forEach((payment) => {
					// Parse payment dates (from payment_dates field)
					let dates = [];
					try {
						// Handle both string and already parsed array cases
						if (payment.payment_dates) {
							dates =
								typeof payment.payment_dates === "string"
									? JSON.parse(payment.payment_dates)
									: payment.payment_dates;

							// Ensure dates is an array
							if (!Array.isArray(dates)) {
								dates = [];
							}
						}
					} catch (e) {
						console.error("Error parsing payment dates:", e);
						dates = [];
					}

					// Add each payment date as a separate row
					if (dates.length > 0) {
						dates.forEach((date) => {
							detailData.push([
								format(new Date(date), "dd/MM/yyyy"), // Format the payment date
								`Rp ${payment.amount?.toLocaleString("id-ID") || 0}`,
								payment.status || "-",
								payment.payment_date
									? format(new Date(payment.payment_date), "dd/MM/yyyy") // Format the confirmation date
									: "-",
							]);
						});
					} else {
						// If no specific dates, just show the payment record
						detailData.push([
							"-", // No specific date
							`Rp ${payment.amount?.toLocaleString("id-ID") || 0}`,
							payment.status || "-",
							payment.payment_date
								? format(new Date(payment.payment_date), "dd/MM/yyyy")
								: "-",
						]);
					}
				});

				// Add detail sheet to workbook
				const worksheet = XLSX.utils.aoa_to_sheet(detailData);
				XLSX.utils.book_append_sheet(
					workbook,
					worksheet,
					`Pelanggan ${index + 1}`.substring(0, 31)
				);
			});

			// Add summary sheet
			const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
			XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Ringkasan");

			// Generate and save file
			const fileName = `Laporan_Pembayaran_${format(
				new Date(),
				"yyyyMMdd"
			)}.xlsx`;
			XLSX.writeFile(workbook, fileName);
		} catch (error) {
			console.error("Export failed:", error);
			alert("Gagal mengekspor data. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	};

	// Filter and sort customers
	const filteredAndSortedCustomers = useMemo(() => {
		let filtered = customers.filter((customer) => {
			const pkg = packages.find((p) => p.id === customer.package_id);
			const searchLower = searchTerm.toLowerCase();

			return (
				customer.name.toLowerCase().includes(searchLower) ||
				pkg?.name.toLowerCase().includes(searchLower) ||
				false
			);
		});

		// Sort customers
		filtered.sort((a, b) => {
			let aValue, bValue;

			switch (sortBy) {
				case "name":
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case "package":
					const pkgA = packages.find((p) => p.id === a.package_id);
					const pkgB = packages.find((p) => p.id === b.package_id);
					aValue = pkgA?.name.toLowerCase() || "";
					bValue = pkgB?.name.toLowerCase() || "";
					break;
				case "lastPayment":
					aValue = customerPaymentInfo[a.id]?.last_payment_date || "";
					bValue = customerPaymentInfo[b.id]?.last_payment_date || "";
					break;
				case "paidAmount":
					aValue = customerPaymentInfo[a.id]?.paid_amount || 0;
					bValue = customerPaymentInfo[b.id]?.paid_amount || 0;
					break;
				default:
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
			}

			if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
			if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [customers, packages, customerPaymentInfo, searchTerm, sortBy, sortOrder]);

	// Pagination
	const totalPages = Math.ceil(
		filteredAndSortedCustomers.length / itemsPerPage
	);
	const paginatedCustomers = filteredAndSortedCustomers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Reset to first page when search changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, sortBy, sortOrder]);

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	const handleOpenModal = async (customer) => {
		const paymentInfo = customerPaymentInfo[customer.id];
		if (paymentInfo) {
			setCustomerPaidDates(paymentInfo.paid_dates);
			setSelectedCustomer({
				...customer,
				paid_dates: paymentInfo.paid_dates,
			});
		} else {
			setCustomerPaidDates([]);
			setSelectedCustomer({
				...customer,
				paid_dates: [],
			});
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedCustomer(null);
		setSelectedPackage(null);
	};

	const handleConfirmPayment = async (paymentData) => {
		if (!selectedCustomer) return;
		try {
			const payload = {
				customerId: selectedCustomer.id,
				packageId: selectedPackage?.id,
				amount: paymentData.amount,
				paymentDate: paymentData.paymentDate,
				selectedDates: paymentData.selectedDates,
				paymentMethod: selectedPackage?.payment_method || "DAILY",
			};
			const response = await api.post("/payments", payload);
			alert(response.data.message);
			setShowModal(false);
			setRefreshFlag(!refreshFlag);
		} catch (error) {
			alert("Failed to confirm payment: " + error.message);
		}
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "-";
		const date = new Date(dateStr);
		return date.toLocaleDateString();
	};

	const SortIcon = ({ field }) => {
		if (sortBy !== field) {
			return (
				<svg
					className="w-4 h-4 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 9l4-4 4 4m0 6l-4 4-4-4"
					/>
				</svg>
			);
		}
		return sortOrder === "asc" ? (
			<svg
				className="w-4 h-4 text-blue-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M5 15l7-7 7 7"
				/>
			</svg>
		) : (
			<svg
				className="w-4 h-4 text-blue-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		);
	};

	return (
		<div className="bg-white rounded-xl shadow-lg p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					Konfirmasi Pembayaran Pelanggan
				</h2>

				<button
					onClick={() => setShowExportAllModal(true)}
					disabled={loading || customers.length === 0}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 mb-3"
				>
					{loading ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
							Exporting...
						</>
					) : (
						<>
							<svg
								className="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							Export All
						</>
					)}
				</button>

				{/* Search and Controls */}
				<div className="flex flex-col sm:flex-row gap-4 mb-4">
					{/* Search */}
					<div className="flex-1">
						<div className="relative">
							<svg
								className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
							<input
								type="text"
								placeholder="Cari Customer atau Paket..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Items per page */}
					<div className="flex items-center gap-2">
						<label className="text-sm text-gray-600 whitespace-nowrap">
							Items per page:
						</label>
						<select
							value={itemsPerPage}
							onChange={(e) => setItemsPerPage(Number(e.target.value))}
							className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
						</select>
					</div>
				</div>

				{/* Results info */}
				{/* Results info */}
				<div className="flex justify-between items-center text-sm text-gray-600">
					<span>
						Showing{" "}
						{paginatedCustomers.length > 0
							? (currentPage - 1) * itemsPerPage + 1
							: 0}{" "}
						to{" "}
						{paginatedCustomers.length > 0
							? Math.min(
									currentPage * itemsPerPage,
									filteredAndSortedCustomers.length
							  )
							: 0}{" "}
						of {filteredAndSortedCustomers.length} entries
						{searchTerm && ` (filtered from ${customers.length} total entries)`}
					</span>
					{loading && (
						<span className="text-blue-600">Loading payment info...</span>
					)}
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto border border-gray-200 rounded-lg">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
								onClick={() => handleSort("name")}
							>
								<div className="flex items-center gap-1">
									Customer Name
									<SortIcon field="name" />
								</div>
							</th>
							<th
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
								onClick={() => handleSort("package")}
							>
								<div className="flex items-center gap-1">
									Paket
									<SortIcon field="package" />
								</div>
							</th>
							<th
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
								onClick={() => handleSort("lastPayment")}
							>
								<div className="flex items-center gap-1">
									Terakhir Bayar
									<SortIcon field="lastPayment" />
								</div>
							</th>
							<th
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
								onClick={() => handleSort("paidAmount")}
							>
								<div className="flex items-center gap-1">
									Nilai Pembayaran
									<SortIcon field="paidAmount" />
								</div>
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Aksi
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{paginatedCustomers.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-6 py-8 text-center text-gray-500">
									{loading ? (
										<div className="flex items-center justify-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
											Loading...
										</div>
									) : searchTerm ? (
										`No customers found matching "${searchTerm}"`
									) : (
										"No customers available"
									)}
								</td>
							</tr>
						) : (
							paginatedCustomers.map((customer) => {
								const pkg = packages.find((p) => p.id === customer.package_id);
								const paymentInfo = customerPaymentInfo[customer.id];
								const isPaid =
									paymentInfo?.paid_amount && paymentInfo.paid_amount > 0;

								return (
									<tr
										key={customer.id}
										className="hover:bg-gray-50 transition-colors duration-150"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
													{customer.name.charAt(0).toUpperCase()}
												</div>
												<div className="text-sm font-medium text-gray-900">
													{customer.name}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{pkg ? (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														{pkg.name}
													</span>
												) : (
													<span className="text-gray-400">Tidak ada Paket</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={`text-sm ${
													isPaid
														? "text-green-600 font-semibold"
														: "text-gray-500"
												}`}
											>
												{formatDate(paymentInfo?.last_payment_date) || "-"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{paymentInfo?.paid_amount ? (
													<span className="text-green-600">
														Rp {paymentInfo.paid_amount.toLocaleString()}
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button
												onClick={() => handleOpenModal(customer)}
												className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
											>
												<svg
													className="w-4 h-4 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
												Konfirmasi
											</button>
											<button
												onClick={() => handleExportExcel(customer)} // Pass customer here
												disabled={isExporting}
												className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ml-2"
											>
												<svg
													className="w-4 h-4 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												Export
											</button>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-6 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setCurrentPage(1)}
							disabled={currentPage === 1}
							className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							First
						</button>
						<button
							onClick={() => setCurrentPage(currentPage - 1)}
							disabled={currentPage === 1}
							className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
					</div>

					<div className="flex items-center gap-1">
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
									className={`px-3 py-2 text-sm border rounded-md ${
										currentPage === pageNum
											? "bg-blue-600 text-white border-blue-600"
											: "border-gray-300 hover:bg-gray-50"
									}`}
								>
									{pageNum}
								</button>
							);
						})}
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={() => setCurrentPage(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
						<button
							onClick={() => setCurrentPage(totalPages)}
							disabled={currentPage === totalPages}
							className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Last
						</button>
					</div>
				</div>
			)}

			{/* Modal */}
			{showModal && selectedCustomer && selectedPackage && (
				<PaymentConfirmationModal
					customer={
						selectedCustomer
							? { ...selectedCustomer, paid_dates: customerPaidDates }
							: null
					}
					packages={packages}
					onClose={handleCloseModal}
					onSubmit={handleConfirmPayment}
				/>
			)}

			{/* Export All Filter Modal */}
			{showExportAllModal && (
				<ExportAllFilterModal
					customers={customers}
					isOpen={showExportAllModal}
					onClose={() => setShowExportAllModal(false)}
					onConfirm={(filters) => {
						setShowExportAllModal(false);
						handleExportAllToExcel(filters);
					}}
				/>
			)}
		</div>
	);
};

export default PaymentConfirmation;
