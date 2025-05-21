import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	format,
	addDays,
	addMonths,
	eachDayOfInterval,
	isSameDay,
} from "date-fns";
import { id } from "date-fns/locale";

function CustomerPanel() {
	const [packages, setPackages] = useState([]);
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [paymentStartDate, setPaymentStartDate] = useState(new Date());
	const [paymentDuration, setPaymentDuration] = useState(1);
	const [selectedDates, setSelectedDates] = useState([]);
	const [totalAmount, setTotalAmount] = useState(0);

	useEffect(() => {
		fetchPackages();
	}, []);

	useEffect(() => {
		if (selectedPackage) {
			calculateTotalAmount();
		}
	}, [selectedDates, selectedPackage]);

	const fetchPackages = async () => {
		try {
			const response = await axios.get("http://localhost:3001/api/packages");
			setPackages(response.data);
		} catch (err) {
			console.error("Failed to fetch packages", err);
		}
	};

	const handlePackageSelect = (pkg) => {
		setSelectedPackage(pkg);
		setSelectedDates([]);
		setPaymentStartDate(new Date());
		setPaymentDuration(1);
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
		setSelectedDates((prev) => {
			if (prev.includes(dateStr)) {
				return prev.filter((d) => d !== dateStr);
			} else {
				return [...prev, dateStr];
			}
		});
	};

	const handleConfirmPayment = () => {
		if (selectedDates.length === 0) {
			alert("Pilih setidaknya satu tanggal pembayaran");
			return;
		}

		const paymentData = {
			packageId: selectedPackage.id,
			dates: selectedDates,
			totalAmount: totalAmount,
			paymentMethod: selectedPackage.payment_method,
		};

		console.log("Payment confirmed:", paymentData);
		alert(
			`Pembayaran dikonfirmasi untuk ${
				selectedDates.length
			} hari\nTotal: Rp ${totalAmount.toLocaleString("id-ID")}`
		);
	};

	const renderCalendar = () => {
		if (!selectedPackage) return null;

		const endDate =
			selectedPackage.payment_method === "monthly"
				? addMonths(paymentStartDate, paymentDuration)
				: addDays(
						paymentStartDate,
						paymentDuration *
							(selectedPackage.payment_method === "weekly" ? 7 : 30)
				  );

		const daysInMonth = eachDayOfInterval({
			start: paymentStartDate,
			end: endDate,
		});

		return (
			<div className="mt-6">
				<h3 className="text-lg font-semibold mb-4">
					Pilih Tanggal Pembayaran:
				</h3>
				<div className="grid grid-cols-7 gap-1 mb-4">
					{["M", "S", "S", "R", "K", "J", "S"].map((day) => (
						<div key={day} className="text-center font-semibold text-sm py-1">
							{day}
						</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-1">
					{daysInMonth.map((day) => {
						const dateStr = format(day, "yyyy-MM-dd");
						const isSelected = selectedDates.includes(dateStr);
						const isCurrentMonth =
							day.getMonth() === paymentStartDate.getMonth();

						return (
							<button
								key={dateStr}
								onClick={() => handleDateSelect(day)}
								className={`p-2 rounded-full text-sm ${
									isSelected
										? "bg-indigo-600 text-white"
										: isCurrentMonth
										? "bg-white text-gray-800"
										: "bg-gray-100 text-gray-400"
								} ${isCurrentMonth ? "hover:bg-indigo-100" : ""}`}
								disabled={!isCurrentMonth}
							>
								{format(day, "d")}
							</button>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="p-4 max-w-5xl mx-auto bg-gray-50 min-h-screen">
			<h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
				Panel Pelanggan
			</h1>

			{/* Package Selection */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Pilih Paket</h2>
				{packages.length === 0 ? (
					<p className="text-gray-600">Tidak ada paket tersedia.</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{packages.map((pkg) => (
							<div
								key={pkg.id}
								onClick={() => handlePackageSelect(pkg)}
								className={`p-4 border rounded-lg cursor-pointer transition-all ${
									selectedPackage?.id === pkg.id
										? "border-indigo-500 bg-indigo-50"
										: "border-gray-200 hover:border-indigo-300"
								}`}
							>
								<h3 className="font-bold text-lg text-gray-800">{pkg.name}</h3>
								<p className="text-gray-600 text-sm mb-2">{pkg.description}</p>
								<div className="flex justify-between items-center mt-2">
									<span className="font-semibold text-indigo-600">
										Rp {pkg.payment_amount.toLocaleString("id-ID")}
									</span>
									<span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
										{pkg.payment_method === "daily"
											? "Harian"
											: pkg.payment_method === "weekly"
											? "Mingguan"
											: "Bulanan"}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Payment Section */}
			{selectedPackage && (
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">Konfirmasi Pembayaran</h2>
					<div className="mb-4">
						<h3 className="font-medium mb-2">
							Paket Terpilih: {selectedPackage.name}
						</h3>
						<p className="text-gray-600 mb-1">
							Metode Pembayaran:{" "}
							{selectedPackage.payment_method === "daily"
								? "Harian"
								: selectedPackage.payment_method === "weekly"
								? "Mingguan"
								: "Bulanan"}
						</p>
						<p className="text-gray-600">
							Harga Paket: Rp{" "}
							{selectedPackage.payment_amount.toLocaleString("id-ID")}
						</p>
					</div>

					<div className="mb-4">
						<label className="block font-medium mb-2">Mulai Tanggal:</label>
						<input
							type="date"
							value={format(paymentStartDate, "yyyy-MM-dd")}
							onChange={(e) => setPaymentStartDate(new Date(e.target.value))}
							className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div className="mb-4">
						<label className="block font-medium mb-2">
							Durasi (
							{selectedPackage.payment_method === "daily"
								? "Hari"
								: selectedPackage.payment_method === "weekly"
								? "Minggu"
								: "Bulan"}
							):
						</label>
						<input
							type="number"
							min="1"
							max={selectedPackage.payment_method === "monthly" ? "12" : "31"}
							value={paymentDuration}
							onChange={(e) =>
								setPaymentDuration(parseInt(e.target.value) || 1)
							}
							className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					{renderCalendar()}

					{selectedDates.length > 0 && (
						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<h3 className="font-semibold mb-2">Rincian Pembayaran:</h3>
							<p>Jumlah Hari: {selectedDates.length}</p>
							<p>
								Harga per Hari: Rp{" "}
								{calculateDailyRate(
									selectedPackage.payment_amount,
									selectedPackage.payment_method
								).toLocaleString("id-ID")}
							</p>
							<p className="font-bold mt-2">
								Total Pembayaran: Rp {totalAmount.toLocaleString("id-ID")}
							</p>
						</div>
					)}

					<button
						onClick={handleConfirmPayment}
						className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Konfirmasi Pembayaran
					</button>
				</div>
			)}
		</div>
	);
}

export default CustomerPanel;
