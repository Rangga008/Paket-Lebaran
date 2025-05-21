import React, { useState } from "react";
import api from "../../../utils/api";

const CustomerDetailView = ({ customer, packages, onClose }) => {
	const customerPackage = packages.find((p) => p.id === customer.package_id);

	if (!customerPackage) return null;

	const totalDays = customer.payment_days;
	const paidDays = customer.paid_dates.length;
	const remainingDays = totalDays - paidDays;

	const dailyRate =
		customerPackage.payment_method === "daily"
			? customerPackage.payment_amount
			: customerPackage.payment_method === "weekly"
			? customerPackage.payment_amount / 7
			: customerPackage.payment_amount / 30;

	const totalAmount = dailyRate * totalDays;
	const paidAmount = customer.paid_amount;
	const remainingAmount = totalAmount - paidAmount;

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">Customer Details</h2>
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div>
						<h3 className="font-semibold text-lg mb-2">Customer Information</h3>
						<p>
							<span className="font-medium">Name:</span> {customer.name}
						</p>
						<p>
							<span className="font-medium">Email:</span> {customer.email}
						</p>
						<p>
							<span className="font-medium">Package:</span>{" "}
							{customerPackage.name}
						</p>
						<p>
							<span className="font-medium">Payment Method:</span>{" "}
							{customerPackage.payment_method}
						</p>
					</div>

					<div>
						<h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
						<p>
							<span className="font-medium">Total Days:</span> {totalDays}
						</p>
						<p>
							<span className="font-medium">Paid Days:</span> {paidDays}
						</p>
						<p>
							<span className="font-medium">Remaining Days:</span>{" "}
							{remainingDays}
						</p>
						<p>
							<span className="font-medium">Daily Rate:</span> Rp
							{dailyRate.toLocaleString()}
						</p>
						<p>
							<span className="font-medium">Total Amount:</span> Rp
							{totalAmount.toLocaleString()}
						</p>
						<p>
							<span className="font-medium">Paid Amount:</span> Rp
							{paidAmount.toLocaleString()}
						</p>
						<p>
							<span className="font-medium">Remaining Amount:</span> Rp
							{remainingAmount.toLocaleString()}
						</p>
					</div>
				</div>

				<div className="mb-6">
					<h3 className="font-semibold text-lg mb-2">Payment History</h3>
					{customer.payment_history.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Amount
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{customer.payment_history.map((payment, index) => (
										<tr key={index}>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{payment.date}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												Rp{payment.amount.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-gray-500">No payment history available</p>
					)}
				</div>

				<div>
					<h3 className="font-semibold text-lg mb-2">Paid Dates</h3>
					<div className="grid grid-cols-7 gap-2">
						{Array.from({ length: totalDays }).map((_, index) => {
							const isPaid = index < paidDays;
							return (
								<div
									key={index}
									className={`p-2 text-center rounded ${
										isPaid
											? "bg-green-100 text-green-800"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									Day {index + 1}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};
