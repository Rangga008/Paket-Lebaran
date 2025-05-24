import React from "react";

const Modal = ({ isOpen, title, children, onClose, size = "md" }) => {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300 p-4">
			<div
				className={`bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} transform transition-all duration-300 scale-100 animate-fadeIn max-h-[90vh] flex flex-col`}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header - Fixed */}
				<div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 flex-shrink-0">
					<h3 className="text-lg font-bold text-gray-800">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Content - Scrollable */}
				<div className="text-sm text-gray-700 p-6 pt-4 overflow-y-auto flex-1">
					{children}
				</div>
			</div>
		</div>
	);
};

export default Modal;
