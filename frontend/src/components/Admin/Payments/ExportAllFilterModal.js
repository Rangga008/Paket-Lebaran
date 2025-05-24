import React, { useState, useEffect } from "react";
import Modal from "../../common/Modal";

const ExportAllFilterModal = ({ customers, isOpen, onClose, onConfirm }) => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedUserIds, setSelectedUserIds] = useState([]);

	useEffect(() => {
		if (!isOpen) {
			setStartDate("");
			setEndDate("");
			setSelectedUserIds([]);
		}
	}, [isOpen]);

	const toggleUserSelection = (userId) => {
		setSelectedUserIds((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId]
		);
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

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Export All - Filter Options"
		>
			<div className="space-y-4">
				<div>
					<label className="block font-medium mb-1">Start Date</label>
					<input
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="w-full border border-gray-300 rounded px-3 py-2"
					/>
				</div>
				<div>
					<label className="block font-medium mb-1">End Date</label>
					<input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="w-full border border-gray-300 rounded px-3 py-2"
					/>
				</div>
				<div>
					<label className="block font-medium mb-1">Select Users</label>
					<div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
						{customers.map((customer) => (
							<div key={customer.id} className="flex items-center mb-1">
								<input
									type="checkbox"
									id={`user-${customer.id}`}
									checked={selectedUserIds.includes(customer.id)}
									onChange={() => toggleUserSelection(customer.id)}
									className="mr-2"
								/>
								<label htmlFor={`user-${customer.id}`}>{customer.name}</label>
							</div>
						))}
					</div>
				</div>
				<div className="flex justify-end space-x-2">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						onClick={handleConfirm}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Export
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default ExportAllFilterModal;
