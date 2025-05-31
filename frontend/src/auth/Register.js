import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");
	const [role, setRole] = useState("customer");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		console.log({
			username,
			password,
			name,
			phone,
			role,
		});
		try {
			await axios.post("http://localhost:3001/api/auth/register", {
				username,
				password,
				role,
				name,
				phone,
			});
			setSuccess("Registration successful! You can now login.");
			setUsername("");
			setPassword("");
			setName("");
			setPhone("");
			setRole("customer");
		} catch (err) {
			if (err.response && err.response.data && err.response.data.error) {
				setError(err.response.data.error); // tampilkan pesan asli dari backend
			} else {
				setError("Terjadi kesalahan saat registrasi.");
			}
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
			<div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
					Create an Account
				</h2>
				{error && (
					<p className="text-red-600 mb-6 text-center font-semibold">{error}</p>
				)}
				{success && (
					<p className="text-green-600 mb-6 text-center font-semibold">
						{success}
					</p>
				)}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700"
						>
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Choose a username"
						/>
					</div>
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700"
						>
							Nama
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Nama lengkap"
						/>
					</div>
					<div>
						<label
							htmlFor="phone"
							className="block text-sm font-medium text-gray-700"
						>
							Nomor Telepon
						</label>
						<input
							id="phone"
							type="number"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							required
							className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Nomor telepon"
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Create a password"
						/>
					</div>
					<div>
						<label
							htmlFor="role"
							className="block text-sm font-medium text-gray-700"
						>
							Role
						</label>
						<select
							id="role"
							value={role}
							onChange={(e) => setRole(e.target.value)}
							className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="customer">Customer</option>
							<option value="reseller">Reseller</option>
						</select>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
					>
						Register
					</button>
				</form>
				<p className="mt-6 text-center text-gray-600">
					Sudah Punya Akun?{" "}
					<button
						onClick={() => navigate("/login")}
						className="text-blue-600 font-semibold hover:underline"
					>
						Login here
					</button>
				</p>
			</div>
		</div>
	);
}

export default Register;
