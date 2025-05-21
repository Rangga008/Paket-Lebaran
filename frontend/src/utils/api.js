import axios from "axios";

// Create instance with correct base URL
const api = axios.create({
	baseURL: "http://localhost:3001/api", // Ensure this matches your backend
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Add request interceptor for logging
api.interceptors.request.use((config) => {
	console.log("Request to:", config.url);
	return config;
});

// Add response interceptor
api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", {
			URL: error.config?.url,
			Status: error.response?.status,
			Message: error.message,
			Response: error.response?.data,
		});
		return Promise.reject(error);
	}
);

export default api;
