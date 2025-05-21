import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../App";
import { FiLogOut, FiUser } from "react-icons/fi";

function Navbar() {
	const auth = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		auth.logout();
		navigate("/login");
	};

	if (!auth.user) return null;

	return (
		<nav>
			<header className="bg-gradient-to-r from-purple-700 to-green-900 shadow-md rounded-b-lg px-6 py-3 flex justify-between items-center">
				<div className="text-white font-extrabold text-2xl leading-tight select-none cursor-default">
					Ramadhan
					<br />
					Package
				</div>

				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2 text-white cursor-default select-none">
						<FiUser className="w-6 h-6" />
						<span className="font-medium">{auth.user.name || "User"}</span>
					</div>

					<button
						onClick={handleLogout}
						className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-md text-white font-semibold"
						title="Logout"
						aria-label="Logout"
					>
						<FiLogOut className="w-5 h-5" />
						Logout
					</button>
				</div>
			</header>
		</nav>
	);
}

export default Navbar;
