import React from "react";

const CustomerPaymentTable = ({
	customers,
	packages,
	onSelectCustomer,
	onConfirmPayment,
}) => {
	const calculateTotalAmount = (customer) => {
		const pkg = packages.find((p) => p.id === customer.package_id);
		if (!pkg) return 0;

		if (pkg.payment_method === "daily") {
			return pkg.payment_amount * customer.payment_days;
		} else if (pkg.payment_method === "weekly") {
			return pkg.payment_amount * Math.ceil(customer.payment_days / 7);
		} else {
			// monthly
			return pkg.payment_amount * Math.ceil(customer.payment_days / 30);
		}
	};

	return (
		<div className="overflow-x-auto bg-white rounded-lg shadow">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Customer
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Package
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Payment Details
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{customers.map((customer) => {
						const customerPackage = packages.find(
							(pkg) => pkg.id === customer.package_id
						);
						const totalAmount = calculateTotalAmount(customer);
						const paidAmount = customer.paid_amount || 0;
						const remainingAmount = totalAmount - paidAmount;
						const paidPercentage =
							totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

						return (
							<tr key={customer.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										<div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
											<span className="text-indigo-600 font-medium">
												{customer.name.charAt(0)}
											</span>
										</div>
										<div className="ml-4">
											<div className="text-sm font-medium text-gray-900">
												{customer.name}
											</div>
											<div className="text-sm text-gray-500">
												{customer.email}
											</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{customerPackage ? (
										<div>
											<div className="text-sm text-gray-900">
												{customerPackage.name}
											</div>
											<div className="text-sm text-gray-500">
												Rp{customerPackage.payment_amount?.toLocaleString()} per{" "}
												{customerPackage.payment_method}
											</div>
										</div>
									) : (
										<span className="text-sm text-gray-500">No package</span>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">
										<div>Total: Rp{totalAmount.toLocaleString()}</div>
										<div>Paid: Rp{paidAmount.toLocaleString()}</div>
										<div>Remaining: Rp{remainingAmount.toLocaleString()}</div>
										<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
											<div
												className="bg-green-600 h-2 rounded-full"
												style={{ width: `${paidPercentage}%` }}
											></div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											remainingAmount <= 0
												? "bg-green-100 text-green-800"
												: paidAmount > 0
												? "bg-yellow-100 text-yellow-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{remainingAmount <= 0
											? "Lunas"
											: paidAmount > 0
											? "Sebagian"
											: "Belum Bayar"}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => onSelectCustomer(customer)}
											className="text-indigo-600 hover:text-indigo-900"
										>
											View
										</button>
										<button
											onClick={() => onConfirmPayment(customer)}
											className="text-green-600 hover:text-green-900"
											disabled={remainingAmount <= 0}
										>
											Confirm Payment
										</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default CustomerPaymentTable;
