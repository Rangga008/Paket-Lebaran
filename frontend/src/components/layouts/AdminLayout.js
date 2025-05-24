import React from "react";

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
	const tabs = [
		"products",
		"packages",
		"customers",
		"resellers",
		"confirmations",
	];

	return (
		<div className="w-full max-h-screen bg-gray-100">
			{/* Main Content Area */}
			<div className="w-full px-4 py-6">
				{/* Dashboard Header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
					<div className="flex space-x-1 mt-2">
						{tabs.map((tab) => (
							<button
								key={tab}
								className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
									activeTab === tab
										? "bg-white text-blue-600 border-t-2 border-blue-500"
										: "bg-gray-200 text-gray-600 hover:bg-gray-300"
								}`}
								onClick={() => setActiveTab(tab)}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</div>
				</div>

				{/* Full-width Content Container */}
				<div className="bg-white rounded-lg shadow p-6 w-full">{children}</div>
			</div>
		</div>
	);
};

export default AdminLayout;
