import React, {
	createContext,
	useState,
	useContext,
	Suspense,
	lazy,
} from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import CustomerManagement from "./components/Admin/Resellers/CustomerManagement";

import "./App.css";

// Lazy load components for better performance
const Login = lazy(() => import("./auth/Login"));
const Register = lazy(() => import("./auth/Register"));
const AdminPanel = lazy(() => import("./components/Admin/AdminPanel"));
const ResellerPanel = lazy(() => import("./components/reseller/ResellerPanel"));
const CustomerPanel = lazy(() => import("./components/customer/CustomerPanel"));

const AuthContext = createContext(null);

function useAuth() {
	return useContext(AuthContext);
}

function RequireAuth({ children, allowedRoles }) {
	const auth = useAuth();
	if (!auth.user) {
		return <Navigate to="/login" replace />;
	}
	if (!allowedRoles.includes(auth.user.role)) {
		return <Navigate to="/login" replace />;
	}
	return children;
}

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
		try {
			const storedUser = localStorage.getItem("user");
			return storedUser ? JSON.parse(storedUser) : null;
		} catch (error) {
			console.error("Error parsing stored user data:", error);
			localStorage.removeItem("user");
			return null;
		}
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

	return (
		<AuthContext.Provider value={authContextValue}>
			<Router>
				<div className="max-h-screen flex flex-col">
					<Navbar />
					<main className="flex-grow bg-gray-50">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
							<Suspense
								fallback={
									<div className="flex justify-center items-center h-64">
										<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
									</div>
								}
							>
								<Routes>
									<Route
										path="/login"
										element={
											user ? (
												<Navigate to={`/${user.role.toLowerCase()}`} replace />
											) : (
												<div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
													<Login />
												</div>
											)
										}
									/>
									<Route
										path="/register"
										element={
											user ? (
												<Navigate to={`/${user.role.toLowerCase()}`} replace />
											) : (
												<div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
													<Register />
												</div>
											)
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
										path="/admin/resellers/:resellerId/customers"
										element={
											<RequireAuth allowedRoles={["ADMIN"]}>
												<CustomerManagement />
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
									<Route path="/" element={<Navigate to="/login" replace />} />
									<Route path="*" element={<Navigate to="/login" replace />} />
								</Routes>
							</Suspense>
						</div>
					</main>
				</div>
			</Router>
		</AuthContext.Provider>
	);
}

export { useAuth };
export default App;
