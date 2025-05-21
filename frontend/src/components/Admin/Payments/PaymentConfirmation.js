import React, { useState, useEffect } from "react";
import PaymentConfirmationModal from "../../common/PaymentConfirmationModal";
import api from "../../../utils/api";

const PaymentConfirmation = ({ customers, packages }) => {
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [paymentStartDate, setPaymentStartDate] = useState("");
	const [paymentMonths, setPaymentMonths] = useState(1);
	const [refreshFlag, setRefreshFlag] = useState(false);

	useEffect(() => {
		if (selectedCustomer) {
			const pkg = packages.find((p) => p.id === selectedCustomer.package_id);
			setSelectedPackage(pkg || null);
		}
	}, [selectedCustomer, packages]);

	const handleOpenModal = (customer) => {
		setSelectedCustomer(customer);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedCustomer(null);
		setSelectedPackage(null);
	};

	const handleConfirmPayment = async ({ amount, paymentDate }) => {
		if (!selectedCustomer) return;
		try {
			const response = await api.post(
				`/users/${selectedCustomer.id}/confirm-payment`,
				{
					amount,
					paymentDate,
					packageId: selectedPackage?.id,
				}
			);
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

	return (
		<div className="bg-white rounded-xl shadow-md p-6">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">
				Payment Confirmation
			</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Customer Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Package
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Last Payment Date
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Paid Amount
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Confirm Payment
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{customers.map((customer) => {
							const pkg = packages.find((p) => p.id === customer.package_id);
							const isPaid = customer.paid_amount && customer.paid_amount > 0;
							return (
								<tr key={customer.id}>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{customer.name}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{pkg ? pkg.name : "-"}
									</td>
									<td
										className={`px-6 py-4 whitespace-nowrap text-sm cursor-pointer ${
											isPaid ? "text-green-600 font-semibold" : "text-gray-500"
										}`}
										onClick={() => handleOpenModal(customer)}
										title="Click to confirm payment"
									>
										{formatDate(customer.last_payment_date)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{customer.paid_amount
											? `Rp${customer.paid_amount.toLocaleString()}`
											: "-"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										<button
											onClick={() => handleOpenModal(customer)}
											className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
										>
											Confirm
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{showModal && selectedCustomer && selectedPackage && (
				<PaymentConfirmationModal
					customer={selectedCustomer}
					pkg={selectedPackage}
					onClose={handleCloseModal}
					onConfirm={handleConfirmPayment}
				/>
			)}
		</div>
	);
};

export default PaymentConfirmation;
