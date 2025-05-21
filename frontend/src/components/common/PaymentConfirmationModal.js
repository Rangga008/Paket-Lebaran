import React, { useState } from "react";

const PaymentConfirmationModal = ({
	customer,
	packages,
	onClose,
	onSubmit,
}) => {
	const [paymentAmount, setPaymentAmount] = useState(0);
	const [paymentDate, setPaymentDate] = useState(new Date());
	const [selectedDates, setSelectedDates] = useState([]);

	const customerPackage = packages.find((p) => p.id === customer.package_id);

	useEffect(() => {
		if (customerPackage) {
			calculatePaymentAmount();
		}
	}, [selectedDates]);

	const calculatePaymentAmount = () => {
		if (!customerPackage) return;

		let amount = 0;
		if (customerPackage.payment_method === "daily") {
			amount = customerPackage.payment_amount * selectedDates.length;
		} else if (customerPackage.payment_method === "weekly") {
			// Calculate how many complete weeks
			amount =
				customerPackage.payment_amount * Math.ceil(selectedDates.length / 7);
		} else {
			// Monthly
			amount =
				customerPackage.payment_amount * Math.ceil(selectedDates.length / 30);
		}

		setPaymentAmount(amount);
	};

	const handleDateToggle = (date) => {
		// Check if already in the paid dates
		if (customer.paid_dates.includes(date)) {
			return; // Already paid
		}

		setSelectedDates((prev) => {
			if (prev.includes(date)) {
				return prev.filter((d) => d !== date);
			} else {
				return [...prev, date];
			}
		});
	};

	const handleSubmit = () => {
		onSubmit(customer.id, paymentAmount, paymentDate);
	};

	// Generate calendar days (simplified for demo)
	const calendarDays = Array.from({ length: 30 }, (_, i) => {
		const date = new Date();
		date.setDate(date.getDate() - 15 + i);
		return format(date, "yyyy-MM-dd");
	});

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">Confirm Payment</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-800"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
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

				<div className="mb-4">
					<h3 className="font-medium mb-2">Customer: {customer.name}</h3>
					<p className="text-sm text-gray-600 mb-1">
						Package: {customerPackage?.name} (Rp
						{customerPackage?.payment_amount.toLocaleString()} per{" "}
						{customerPackage?.payment_method})
					</p>
				</div>

				<div className="mb-4">
					<label className="block font-medium mb-2">Payment Date:</label>
					<input
						type="date"
						value={format(paymentDate, "yyyy-MM-dd")}
						onChange={(e) => setPaymentDate(new Date(e.target.value))}
						className="border border-gray-300 rounded-md px-3 py-2 w-full"
					/>
				</div>

				<div className="mb-6">
					<h3 className="font-medium mb-2">Select Dates to Confirm Payment:</h3>
					<div className="grid grid-cols-7 gap-2">
						{calendarDays.map((date) => {
							const isPaid = customer.paid_dates.includes(date);
							const isSelected = selectedDates.includes(date);

							return (
								<button
									key={date}
									onClick={() => handleDateToggle(date)}
									disabled={isPaid}
									className={`p-2 text-center rounded text-sm ${
										isPaid
											? "bg-green-100 text-green-800"
											: isSelected
											? "bg-indigo-600 text-white"
											: "bg-gray-100 text-gray-800 hover:bg-gray-200"
									}`}
								>
									{format(parseISO(date), "d MMM")}
									{isPaid && <span className="block text-xs">Paid</span>}
								</button>
							);
						})}
					</div>
				</div>

				<div className="bg-gray-50 p-4 rounded-lg mb-6">
					<h3 className="font-medium mb-2">Payment Summary:</h3>
					<p>Selected Dates: {selectedDates.length}</p>
					<p>Payment Method: {customerPackage?.payment_method}</p>
					<p className="font-bold mt-2">
						Total Amount: Rp{paymentAmount.toLocaleString()}
					</p>
				</div>

				<div className="flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={selectedDates.length === 0}
						className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
					>
						Confirm Payment
					</button>
				</div>
			</div>
		</div>
	);
};

export default PaymentConfirmationModal;
