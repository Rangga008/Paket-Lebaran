import React, { createContext, useState, useContext, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Navbar from "./components/layouts/Navbar";
import CustomerManagement from "./components/Admin/Resellers/CustomerManagement";

import "./App.css";

const cors = require("cors");

const AuthContext = createContext(null);

function useAuth() {
	return useContext(AuthContext);
}

function RequireAuth({ children, allowedRoles }) {
	const auth = useAuth();
	if (!auth.user) {
		// Not logged in
		return <Navigate to="/login" replace />;
	}
	if (!allowedRoles.includes(auth.user.role)) {
		// Role not allowed
		return <Navigate to="/login" replace />;
	}
	return children;
}

import AdminPanel from "./components/Admin/AdminPanel";
import ResellerPanel from "./components/reseller/ResellerPanel";
import CustomerPanel from "./components/customer/CustomerPanel";

function AdminPage() {
	return <AdminPanel />;
}

function ResellerPage() {
	return <ResellerPanel />;
}

function CustomerPage() {
	return <CustomerPanel />;
}

function App() {
	const [user, setUser] = useState(() => {
		// Initialize user from localStorage if available
		const storedUser = localStorage.getItem("user");
		return storedUser ? JSON.parse(storedUser) : null;
	});

	const login = (userData) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
	};

	const authContextValue = {
		user,
		login,
		logout,
	};

	const createProduct = async () => {
		try {
			const res = await fetch("http://localhost:3001/api/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newProduct),
			});

			if (!res.ok) {
				throw new Error("Gagal membuat produk");
			}

			const result = await res.json();
			console.log("Produk berhasil dibuat:", result);
			// Reset form atau update state produk di sini
			setNewProduct({ name: "", price: "", description: "" });
		} catch (err) {
			console.error("Error saat membuat produk:", err);
		}
	};

	return (
		<AuthContext.Provider value={authContextValue}>
			<Router>
				<Navbar />
				<Routes>
					<Route
						path="/login"
						element={
							user ? <Navigate to={`/${user.role}`} replace /> : <Login />
						}
					/>
					<Route
						path="/register"
						element={
							user ? <Navigate to={`/${user.role}`} replace /> : <Register />
						}
					/>
					<Route
						path="/admin"
						element={
							<RequireAuth allowedRoles={["ADMIN"]}>
								<AdminPage />
							</RequireAuth>
						}
					/>
					<Route
						path="/reseller"
						element={
							<RequireAuth allowedRoles={["RESELLER"]}>
								<ResellerPage />
							</RequireAuth>
						}
					/>
					<Route
						path="/customer"
						element={
							<RequireAuth allowedRoles={["CUSTOMER"]}>
								<CustomerPage />
							</RequireAuth>
						}
					/>
					<Route path="*" element={<Navigate to="/login" replace />} />
					<Route path="/admin/resellers/:resellerId/customers" element={<CustomerManagement />} />

				</Routes>
			</Router>
		</AuthContext.Provider>
	);
}

export { useAuth };
export default App;
