import React, { useState, useEffect } from "react";
import {
	format,
	parseISO,
	addMonths,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	startOfDay,
	isSameMonth,
	isAfter,
	isBefore,
} from "date-fns";
import { id } from "date-fns/locale"; // Import Indonesian locale
import * as XLSX from "xlsx"; // For Excel export
import api from "../../utils/api"; // Adjust the import path as necessary

const PaymentConfirmationModal = ({
	customer,
	packages,
	onClose,
	onSubmit = () => {}, // Provide default empty function to prevent errors
}) => {
	const [paymentAmount, setPaymentAmount] = useState(0);
	const [paymentDate, setPaymentDate] = useState(new Date());
	const [selectedDates, setSelectedDates] = useState([]);
	const [paidDates, setPaidDates] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
	const [isExporting, setIsExporting] = useState(false);

	const customerPackage = packages?.find((p) => p.id === customer.package_id);

	useEffect(() => {
		// Fetch paid dates from backend when modal opens or customer changes
		const fetchPaidDates = async () => {
			try {
				const response = await api.get(`/payments/paid-dates/${customer.id}`);
				if (response.data && Array.isArray(response.data.paid_dates)) {
					setPaidDates(response.data.paid_dates);
				}
			} catch (error) {
				console.error("Failed to fetch paid dates:", error);
			}
		};
		fetchPaidDates();
	}, [customer.id]);

	useEffect(() => {
		if (customerPackage) {
			calculatePaymentAmount();
		}
	}, [selectedDates, customerPackage]);

	const calculatePaymentAmount = () => {
		if (!customerPackage) return;

		let amount = 0;
		const dailyRate = customerPackage.payment_amount;

		switch (customerPackage.payment_method) {
			case "DAILY":
				amount = dailyRate * selectedDates.length;
				break;
			case "WEEKLY":
				// Calculate based on complete weeks (round up)
				amount = dailyRate * 7 * Math.ceil(selectedDates.length / 7);
				break;
			case "MONTHLY":
				// Calculate based on complete months (round up)
				amount = dailyRate * 30 * Math.ceil(selectedDates.length / 30);
				break;
			default:
				amount = dailyRate * selectedDates.length;
		}

		setPaymentAmount(amount);
	};

	const handleDateToggle = (date) => {
		if (paidDates.includes(date)) return;

		setSelectedDates((prev) =>
			prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
		);
	};

	const handleSubmit = async () => {
		if (typeof onSubmit !== "function") {
			console.error("onSubmit is not a function");
			return;
		}

		setIsSubmitting(true);
		try {
			const paymentData = {
				customerId: customer.id,
				packageId: customer.package_id,
				amount: paymentAmount,
				paymentDate: paymentDate.toISOString(),
				selectedDates,
				paymentMethod: customerPackage?.payment_method || "DAILY",
			};

			await onSubmit(paymentData);
			onClose();
		} catch (error) {
			console.error("Payment submission failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Export to Excel function
	const handleExportExcel = async () => {
		setIsExporting(true);
		try {
			// Fetch all payment history for this customer
			const response = await api.get(`/payments/history/${customer.id}`);
			const paymentHistory = response.data || [];

			// Prepare data for Excel
			const excelData = [];

			// Add customer and package info
			excelData.push(["RIWAYAT PEMBAYARAN"]);
			excelData.push([""]);
			excelData.push(["Nama Pelanggan:", customer.name]);
			excelData.push(["Paket:", customerPackage?.name || "Tidak diketahui"]);
			excelData.push([
				"Metode Pembayaran:",
				getPaymentMethodIndonesian(customerPackage?.payment_method),
			]);
			excelData.push([
				"Tarif:",
				`Rp ${
					customerPackage?.payment_amount?.toLocaleString("id-ID") || 0
				} per ${getPaymentMethodIndonesian(
					customerPackage?.payment_method
				)?.toLowerCase()}`,
			]);
			excelData.push([
				"Tanggal Mulai Paket:",
				customer.package_start_date
					? format(new Date(customer.package_start_date), "dd MMMM yyyy", {
							locale: id,
					  })
					: "Tidak diketahui",
			]);
			excelData.push([""]);
			excelData.push(["DAFTAR TANGGAL KONFIRMASI:"]);
			excelData.push([
				"Tanggal",
				"Status",
				"Jumlah Pembayaran",
				"Tanggal Pembayaran",
			]);

			// Add paid dates
			if (paidDates.length > 0) {
				paidDates.forEach((dateString) => {
					const paymentRecord = paymentHistory.find(
						(p) => p.selected_dates && p.selected_dates.includes(dateString)
					);

					excelData.push([
						format(new Date(dateString), "dd MMMM yyyy", { locale: id }),
						"Sudah Dibayar",
						paymentRecord
							? `Rp ${paymentRecord.amount?.toLocaleString("id-ID") || 0}`
							: "",
						paymentRecord && paymentRecord.payment_date
							? format(new Date(paymentRecord.payment_date), "dd MMMM yyyy", {
									locale: id,
							  })
							: "",
					]);
				});
			}

			// Add currently selected dates (if any)
			if (selectedDates.length > 0) {
				excelData.push([""]);
				excelData.push(["TANGGAL YANG DIPILIH SAAT INI:"]);
				selectedDates.forEach((dateString) => {
					excelData.push([
						format(new Date(dateString), "dd MMMM yyyy", { locale: id }),
						"Belum Dikonfirmasi",
						`Rp ${paymentAmount.toLocaleString("id-ID")}`,
						format(paymentDate, "dd MMMM yyyy", { locale: id }),
					]);
				});
			}

			// Create workbook and worksheet
			const workbook = XLSX.utils.book_new();
			const worksheet = XLSX.utils.aoa_to_sheet(excelData);

			// Set column widths
			const columnWidths = [
				{ wch: 20 }, // Date column
				{ wch: 20 }, // Status column
				{ wch: 20 }, // Amount column
				{ wch: 20 }, // Payment date column
			];
			worksheet["!cols"] = columnWidths;

			// Add worksheet to workbook
			XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Pembayaran");

			// Generate filename
			const fileName = `Riwayat_Pembayaran_${customer.name.replace(
				/\s+/g,
				"_"
			)}_${format(new Date(), "ddMMyyyy")}.xlsx`;

			// Save file
			XLSX.writeFile(workbook, fileName);
		} catch (error) {
			console.error("Export failed:", error);
			alert("Gagal mengekspor data. Silakan coba lagi.");
		} finally {
			setIsExporting(false);
		}
	};

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

	// Determine start date for calendar grid
	const startDate = customer.package_start_date
		? startOfDay(new Date(customer.package_start_date))
		: startOfDay(new Date());

	// Determine number of months to show
	const monthsToShow = customerPackage?.payment_months || 1;

	// Generate months array
	const months = Array.from({ length: monthsToShow }, (_, index) =>
		addMonths(startDate, index)
	);

	// Get current month data
	const currentMonth = months[currentMonthIndex];
	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(currentMonth);

	// Get all days in the current month view (including padding days)
	const calendarStart = startOfDay(monthStart);
	const calendarEnd = endOfMonth(monthEnd);

	// Get first day of week (0 = Sunday, 1 = Monday, etc.)
	const firstDayOfWeek = monthStart.getDay();

	// Create padding days for the start of the month
	const paddingStart = Array.from({ length: firstDayOfWeek }, (_, i) => {
		const paddingDate = new Date(monthStart);
		paddingDate.setDate(paddingDate.getDate() - (firstDayOfWeek - i));
		return paddingDate;
	});

	// Get all days in the current month
	const monthDays = eachDayOfInterval({
		start: monthStart,
		end: monthEnd,
	});

	// Create padding days for the end of the month to complete the week
	const lastDayOfWeek = monthEnd.getDay();
	const paddingEnd = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
		const paddingDate = new Date(monthEnd);
		paddingDate.setDate(paddingDate.getDate() + (i + 1));
		return paddingDate;
	});

	// Combine all days
	const allCalendarDays = [...paddingStart, ...monthDays, ...paddingEnd];

	// Check if date is within package duration
	const isDateInPackageRange = (date) => {
		const packageEndDate = addMonths(startDate, monthsToShow);
		return !isBefore(date, startDate) && isBefore(date, packageEndDate);
	};

	const navigateMonth = (direction) => {
		const newIndex = currentMonthIndex + direction;
		if (newIndex >= 0 && newIndex < monthsToShow) {
			setCurrentMonthIndex(newIndex);
		}
	};

	// Indonesian day headers
	const indonesianDayHeaders = [
		"Min",
		"Sen",
		"Sel",
		"Rab",
		"Kam",
		"Jum",
		"Sab",
	];

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				{/* Modal header */}
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">Konfirmasi Pembayaran</h2>
					<div className="flex items-center space-x-2">
						<button
							onClick={handleExportExcel}
							disabled={isExporting}
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center space-x-2"
						>
							{isExporting ? (
								<>
									<svg
										className="animate-spin h-4 w-4"
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
									<span>Mengekspor...</span>
								</>
							) : (
								<>
									<svg
										className="w-4 h-4"
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
									<span>Export Excel</span>
								</>
							)}
						</button>
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
						>
							×
						</button>
					</div>
				</div>

				{/* Customer and package info */}
				<div className="mb-4">
					<h3 className="font-medium mb-2">Pelanggan: {customer.name}</h3>
					<p className="text-sm text-gray-600 mb-1">
						Paket: {customerPackage?.name} (Rp{" "}
						{customerPackage?.payment_amount.toLocaleString("id-ID")} per{" "}
						{getPaymentMethodIndonesian(
							customerPackage?.payment_method
						)?.toLowerCase()}
						{customerPackage?.payment_months
							? ` selama ${customerPackage.payment_months} bulan`
							: ""}
						)
					</p>
				</div>

				{/* Payment date selection */}
				<div className="mb-4">
					<label className="block font-medium mb-2">Tanggal Pembayaran:</label>
					<input
						type="date"
						value={format(paymentDate, "yyyy-MM-dd")}
						onChange={(e) => setPaymentDate(new Date(e.target.value))}
						className="border border-gray-300 rounded-md px-3 py-2 w-full"
					/>
				</div>

				{/* Month navigation */}
				<div className="mb-4">
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigateMonth(-1)}
							disabled={currentMonthIndex === 0}
							className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
						>
							<svg
								className="w-5 h-5"
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

						<h3 className="text-lg font-semibold">
							{format(currentMonth, "MMMM yyyy", { locale: id })}
						</h3>

						<button
							onClick={() => navigateMonth(1)}
							disabled={currentMonthIndex === monthsToShow - 1}
							className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
						>
							<svg
								className="w-5 h-5"
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

				{/* Date selection grid */}
				<div className="mb-6">
					<h3 className="font-medium mb-2">
						Pilih Tanggal untuk Konfirmasi Pembayaran:
					</h3>

					{/* Day headers in Indonesian */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{indonesianDayHeaders.map((day) => (
							<div
								key={day}
								className="text-center text-sm font-medium text-gray-500 py-2"
							>
								{day}
							</div>
						))}
					</div>

					{/* Calendar grid */}
					<div className="grid grid-cols-7 gap-1">
						{allCalendarDays.map((date, index) => {
							const dateString = format(date, "yyyy-MM-dd");
							const isPaid = paidDates.includes(dateString);
							const isSelected = selectedDates.includes(dateString);
							const isCurrentMonth = isSameMonth(date, currentMonth);
							const isInPackageRange = isDateInPackageRange(date);
							const isClickable = isCurrentMonth && isInPackageRange && !isPaid;

							return (
								<button
									key={index}
									onClick={() => isClickable && handleDateToggle(dateString)}
									disabled={!isClickable}
									className={`
										p-2 text-center rounded text-sm transition-all duration-200 min-h-[40px] relative
										${
											!isCurrentMonth || !isInPackageRange
												? "bg-gray-50 text-gray-300 cursor-not-allowed"
												: isPaid
												? "bg-green-100 text-green-800 cursor-not-allowed"
												: isSelected
												? "bg-indigo-600 text-white shadow-md transform scale-105"
												: "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-sm"
										}
									`}
								>
									<span className="block">{format(date, "d")}</span>
									{isPaid && (
										<span className="block text-xs mt-1 font-medium">
											Lunas
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Payment summary */}
				<div className="bg-gray-50 p-4 rounded-lg mb-6">
					<h3 className="font-medium mb-2">Ringkasan Pembayaran:</h3>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">Tanggal Dipilih:</p>
							<p className="font-semibold">{selectedDates.length}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Metode Pembayaran:</p>
							<p className="font-semibold">
								{getPaymentMethodIndonesian(customerPackage?.payment_method)}
							</p>
						</div>
					</div>
					<div className="mt-3 pt-3 border-t border-gray-200">
						<p className="text-lg font-bold text-indigo-600">
							Total Jumlah: Rp {paymentAmount.toLocaleString("id-ID")}
						</p>
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
					>
						Batal
					</button>
					<button
						onClick={handleSubmit}
						disabled={selectedDates.length === 0 || isSubmitting}
						className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
					>
						{isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default PaymentConfirmationModal;
