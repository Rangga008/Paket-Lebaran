import React, { useEffect } from "react";

const Notification = ({ message, type = "info", onClose }) => {
	useEffect(() => {
		if (!message) return;
		const timer = setTimeout(() => {
			onClose();
		}, 3000);
		return () => clearTimeout(timer);
	}, [message, onClose]);

	if (!message) return null;

	const bgColor =
		type === "error"
			? "bg-red-500"
			: type === "success"
			? "bg-green-500"
			: "bg-blue-500";

	return (
		<div
			className={`fixed top-4 right-4 px-4 py-2 rounded text-white shadow-lg ${bgColor} z-50`}
			role="alert"
		>
			{message}
		</div>
	);
};

export default Notification;
