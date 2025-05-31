import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const auth = useAuth();

	const handleLogin = (userData) => {
		login(userData);
		navigate(`/${userData.role}`);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await axios.post(
				"http://localhost:3001/api/auth/login",
				{ username, password }
			);
			const { role } = response.data;

			auth.login({ username, role });

			// Redirect based on role
			const redirectPaths = {
				admin: "/admin",
				reseller: "/reseller",
				customer: "/customer",
			};

			navigate(redirectPaths[role] || "/", { replace: true });
		} catch (err) {
			if (err.response && err.response.data && err.response.data.error) {
				setError(err.response.data.error); // tampilkan pesan asli dari backend
			} else {
				setError("Terjadi kesalahan saat registrasi.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="relative w-full max-w-md px-6 py-12 bg-white shadow-xl rounded-2xl">
				{/* Decorative elements */}
				<div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-100 rounded-full opacity-70"></div>
				<div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-100 rounded-full opacity-70"></div>

				<div className="relative z-10">
					<div className="flex justify-center mb-10">
						<div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg shadow-lg">
							<h1 className="text-3xl font-bold text-white">Toko Triani</h1>
						</div>
					</div>

					<h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
						Selamat Datang Kembali
					</h2>
					<p className="text-gray-500 text-center mb-8">
						Login Pada akun Anda untuk melanjutkan
					</p>

					{error && (
						<div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Username
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
								<input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
									className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="username"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="••••••••"
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="remember-me"
									className="ml-2 block text-sm text-gray-700"
								>
									Ingat saya
								</label>
							</div>
							<button
								type="button"
								onClick={() => navigate("/forgot-password")}
								className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
							>
								Lupa Password?
							</button>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all ${
								isLoading ? "opacity-70 cursor-not-allowed" : ""
							}`}
						>
							{isLoading ? (
								<div className="flex items-center justify-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Login...
								</div>
							) : (
								"Login"
							)}
						</button>
					</form>

					<div className="mt-8">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-200"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Baru ke Toko Triani?
								</span>
							</div>
						</div>

						<button
							onClick={() => navigate("/register")}
							className="mt-4 w-full py-2 px-4 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center"
						>
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
								/>
							</svg>
							Buat akun baru
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
