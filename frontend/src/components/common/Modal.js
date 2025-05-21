import React from "react";

const Modal = ({ isOpen, title, children, onClose }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300">
			<div
				className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100 animate-fadeIn"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold text-gray-800">{title}</h3>
				</div>
				<div className="text-sm text-gray-700">{children}</div>
			</div>
		</div>
	);
};

export default Modal;
