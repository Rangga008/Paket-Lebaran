import React from "react";
import { format } from "date-fns";

const CustomerPaymentTable = ({ customers, packages, onSelectCustomer }) => {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Name
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Package
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Reseller
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Payment Status
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
						return (
							<tr key={customer.id} className="hover:bg-gray-50">
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
									<span className="text-sm text-gray-900">
										{customer.reseller?.name || "Direct"}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
										{/* TODO: Add actual payment status */}
										Active
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button
										onClick={() => onSelectCustomer(customer)}
										className="text-indigo-600 hover:text-indigo-900 mr-4"
									>
										View Payments
									</button>
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
