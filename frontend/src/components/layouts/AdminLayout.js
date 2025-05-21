import React from "react";

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
	return (
		<div className="min-h-screen bg-gray-100">
			<div className="bg-indigo-700 text-white p-6 shadow-lg">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
			</div>

			<div className="container mx-auto p-4">
				<div className="flex mb-6 border-b border-gray-200">
					{[
						"products",
						"packages",
						"customers",
						"resellers",
						"confirmations",
					].map((tab) => (
						<button
							key={tab}
							className={`py-3 px-6 font-medium capitalize ${
								activeTab === tab
									? "text-white-600 border-b-2 border-white-600"
									: "text-white-500 hover:text-white-700"
							}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</button>
					))}
				</div>

				{children}
			</div>
		</div>
	);
};

export default AdminLayout;
