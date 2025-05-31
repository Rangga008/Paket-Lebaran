import React, { useState, useEffect } from "react";
import {
	Calendar,
	Users,
	Download,
	X,
	CheckCircle2,
	Search,
} from "lucide-react";
import Modal from "../../common/Modal";

const ExportAllFilterModal = ({ customers, isOpen, onClose, onConfirm }) => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedUserIds, setSelectedUserIds] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectAll, setSelectAll] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setStartDate("");
			setEndDate("");
			setSelectedUserIds([]);
			setSearchTerm("");
			setSelectAll(false);
		}
	}, [isOpen]);

	// Filter customers based on search
	const filteredCustomers = customers.filter((customer) =>
		customer.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const toggleUserSelection = (userId) => {
		setSelectedUserIds((prev) => {
			const newSelection = prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId];

			setSelectAll(newSelection.length === filteredCustomers.length);
			return newSelection;
		});
	};

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedUserIds([]);
			setSelectAll(false);
		} else {
			setSelectedUserIds(filteredCustomers.map((customer) => customer.id));
			setSelectAll(true);
		}
	};

	const handleConfirm = () => {
		if (!startDate || !endDate) {
			alert("Please select both start and end dates.");
			return;
		}
		if (new Date(startDate) > new Date(endDate)) {
			alert("Start date cannot be after end date.");
			return;
		}
		onConfirm({ startDate, endDate, userIds: selectedUserIds });
	};

	const setQuickDateRange = (days) => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - days);

		setEndDate(endDate.toISOString().split("T")[0]);
		setStartDate(startDate.toISOString().split("T")[0]);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="">
			<div className="relative">
				{/* Modern Header */}
				<div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white rounded-t-2xl">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
					>
						<X size={20} />
					</button>
					<div className="flex items-center space-x-3">
						<div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
							<Download size={24} />
						</div>
						<div>
							<h2 className="text-2xl font-bold">Export Data</h2>
							<p className="text-blue-100 mt-1">
								Configure your export settings
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="px-8 py-6 space-y-8 bg-white">
					{/* Date Range Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2 mb-4">
							<Calendar className="text-blue-600" size={20} />
							<h3 className="text-lg font-semibold text-gray-800">
								Date Range
							</h3>
						</div>

						{/* Quick Date Buttons */}
						<div className="flex flex-wrap gap-2 mb-4">
							<button
								onClick={() => setQuickDateRange(7)}
								className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
							>
								Last 7 days
							</button>
							<button
								onClick={() => setQuickDateRange(30)}
								className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
							>
								Last 30 days
							</button>
							<button
								onClick={() => setQuickDateRange(90)}
								className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
							>
								Last 90 days
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									Start Date
								</label>
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									End Date
								</label>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
								/>
							</div>
						</div>
					</div>

					{/* Users Selection Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Users className="text-blue-600" size={20} />
								<h3 className="text-lg font-semibold text-gray-800">
									Select Users
								</h3>
							</div>
							<div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
								{selectedUserIds.length} of {filteredCustomers.length} selected
							</div>
						</div>

						{/* Search */}
						<div className="relative">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								type="text"
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
							/>
						</div>

						{/* Select All */}
						<div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
							<div className="flex items-center space-x-3">
								<input
									type="checkbox"
									id="select-all"
									checked={selectAll}
									onChange={handleSelectAll}
									className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
								/>
								<label
									htmlFor="select-all"
									className="font-medium text-gray-700 cursor-pointer"
								>
									Select All Users
								</label>
							</div>
							<span className="text-sm text-gray-500 font-medium">
								({filteredCustomers.length} users)
							</span>
						</div>

						{/* Users List */}
						<div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl shadow-inner bg-gray-50/50">
							{filteredCustomers.length === 0 ? (
								<div className="p-8 text-center text-gray-500">
									<Users size={48} className="mx-auto mb-4 text-gray-300" />
									<p className="font-medium">No users found</p>
									<p className="text-sm text-gray-400 mt-1">
										Try adjusting your search
									</p>
								</div>
							) : (
								<div className="p-2">
									{filteredCustomers.map((customer, index) => (
										<div
											key={customer.id}
											className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer group ${
												selectedUserIds.includes(customer.id)
													? "bg-blue-50 border border-blue-200"
													: "bg-white/70"
											} ${
												index !== filteredCustomers.length - 1 ? "mb-2" : ""
											}`}
											onClick={() => toggleUserSelection(customer.id)}
										>
											<input
												type="checkbox"
												id={`user-${customer.id}`}
												checked={selectedUserIds.includes(customer.id)}
												onChange={() => toggleUserSelection(customer.id)}
												className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
											/>
											<div className="flex-1 min-w-0">
												<label
													htmlFor={`user-${customer.id}`}
													className="block text-sm font-medium text-gray-800 cursor-pointer truncate group-hover:text-blue-600 transition-colors"
												>
													{customer.name}
												</label>
											</div>
											{selectedUserIds.includes(customer.id) && (
												<CheckCircle2
													size={16}
													className="text-blue-500 flex-shrink-0"
												/>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Modern Footer */}
				<div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 rounded-b-2xl">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-600">
							<span className="font-medium">Ready to export:</span>{" "}
							{selectedUserIds.length > 0 ? (
								<span className="text-blue-600 font-semibold">
									{selectedUserIds.length} user
									{selectedUserIds.length !== 1 ? "s" : ""}
								</span>
							) : (
								<span className="text-gray-500">All users</span>
							)}
							{startDate && endDate && (
								<span className="text-gray-500">
									{" "}
									from <span className="font-medium">{startDate}</span> to{" "}
									<span className="font-medium">{endDate}</span>
								</span>
							)}
						</div>
						<div className="flex space-x-3">
							<button
								onClick={onClose}
								className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirm}
								disabled={!startDate || !endDate}
								className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
							>
								<Download size={16} />
								<span>Export</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ExportAllFilterModal;
