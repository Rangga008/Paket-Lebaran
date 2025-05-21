import React, { useState, useEffect } from "react";
import axios from "axios";
import PaymentCalendar from "../Admin/PaymentCalendar";

function ResellerPanel() {
	const [packages, setPackages] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [paymentStartDate, setPaymentStartDate] = useState(new Date());
	const [paymentMonths, setPaymentMonths] = useState(1);

	useEffect(() => {
		fetchPackages();
		fetchCustomers();
	}, []);

	const fetchPackages = async () => {
		try {
			const response = await axios.get("http://localhost:3001/api/packages");
			setPackages(response.data);
		} catch (err) {
			console.error("Failed to fetch packages", err);
		}
	};

	const fetchCustomers = async () => {
		try {
			// For demo, fetch all customers (in real app, filter by reseller)
			const response = await axios.get(
				"http://localhost:3001/api/users?role=customer"
			);
			setCustomers(response.data);
		} catch (err) {
			console.error("Failed to fetch customers", err);
		}
	};

	const selectCustomer = (customer) => {
		setSelectedCustomer(customer);
	};

	const handleConfirmPayment = (selectedDates) => {
		// For demo, just log the selected dates
		console.log("Confirmed payment dates for customer:", selectedDates);
		// TODO: Call backend API to save payment confirmation for selectedCustomer
		alert(
			"Payment confirmed for customer " +
				(selectedCustomer ? selectedCustomer.username : "") +
				" on dates: " +
				selectedDates.join(", ")
		);
	};

	return (
		<div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
			<h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
				Reseller Panel
			</h1>

			<div className="mb-10 p-6 border rounded-lg bg-white shadow-md">
				<h2 className="text-2xl font-semibold mb-6">Customers</h2>
				{customers.length === 0 ? (
					<p className="text-gray-600">No customers available.</p>
				) : (
					<ul className="list-disc list-inside max-h-64 overflow-y-auto text-gray-700">
						{customers.map((customer) => (
							<li
								key={customer.id}
								className={`cursor-pointer px-3 py-2 rounded-md hover:bg-indigo-100 ${
									selectedCustomer && selectedCustomer.id === customer.id
										? "font-bold text-indigo-700 bg-indigo-200"
										: ""
								}`}
								onClick={() => selectCustomer(customer)}
							>
								{customer.username}
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="mb-10 p-6 border rounded-lg bg-white shadow-md">
				<h2 className="text-2xl font-semibold mb-6">Packages</h2>
				{packages.length === 0 ? (
					<p className="text-gray-600">No packages available.</p>
				) : (
					packages.map((pkg) => (
						<div
							key={pkg.id}
							className="mb-6 p-6 border rounded-lg bg-gray-50 shadow-sm"
						>
							<h3 className="text-xl font-bold mb-2 text-gray-900">
								{pkg.name}
							</h3>
							<p className="mb-2 text-gray-700">{pkg.description}</p>
							<p className="mb-1">
								Payment Method:{" "}
								<span className="font-semibold text-indigo-600">
									{pkg.payment_method}
								</span>
							</p>
							<p className="mb-2">
								Payment Amount:{" "}
								<span className="font-semibold text-indigo-600">
									${pkg.payment_amount}
								</span>
							</p>
							<div>
								<h4 className="font-semibold mb-2">Products:</h4>
								<ul className="list-disc list-inside text-gray-700">
									{pkg.products.map((product, index) => (
										<li key={index}>
											{product.name} - ${product.price}
										</li>
									))}
								</ul>
							</div>
						</div>
					))
				)}
			</div>

			{selectedCustomer && (
				<div className="mb-10 p-6 border rounded-lg bg-white shadow-md">
					<h2 className="text-2xl font-semibold mb-6">
						Payment Confirmation Calendar for {selectedCustomer.username}
					</h2>
					<label className="block mb-2 font-semibold">Start Date:</label>
					<input
						type="date"
						value={paymentStartDate.toISOString().substr(0, 10)}
						onChange={(e) => setPaymentStartDate(new Date(e.target.value))}
						className="mb-4 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<label className="block mb-2 font-semibold">Number of Months:</label>
					<input
						type="number"
						min="1"
						max="12"
						value={paymentMonths}
						onChange={(e) => setPaymentMonths(parseInt(e.target.value) || 1)}
						className="mb-4 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<PaymentCalendar
						startDate={paymentStartDate}
						months={paymentMonths}
						paymentMethod={
							packages.length > 0 ? packages[0].payment_method : "daily"
						}
						onConfirm={handleConfirmPayment}
					/>
				</div>
			)}
		</div>
	);
}

export default ResellerPanel;
