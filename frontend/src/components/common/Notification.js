const Notification = ({ message, type = "info", onClose, duration = 4000 }) => {
	useEffect(() => {
		if (!message) return;

		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [message, onClose, duration]);

	if (!message) return null;

	const typeConfig = {
		success: {
			bg: "bg-green-50 border-green-200",
			text: "text-green-800",
			icon: <CheckCircle className="w-5 h-5 text-green-500" />,
		},
		error: {
			bg: "bg-red-50 border-red-200",
			text: "text-red-800",
			icon: <XCircle className="w-5 h-5 text-red-500" />,
		},
		warning: {
			bg: "bg-yellow-50 border-yellow-200",
			text: "text-yellow-800",
			icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
		},
		info: {
			bg: "bg-blue-50 border-blue-200",
			text: "text-blue-800",
			icon: <Info className="w-5 h-5 text-blue-500" />,
		},
	};

	const config = typeConfig[type] || typeConfig.info;

	return (
		<div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
			<div
				className={`
        max-w-sm w-full sm:max-w-md p-4 rounded-lg border shadow-lg 
        ${config.bg} backdrop-blur-sm
      `}
			>
				<div className="flex items-start gap-3">
					<div className="flex-shrink-0 pt-0.5">{config.icon}</div>
					<div className="flex-1 min-w-0">
						<p className={`text-sm font-medium ${config.text} break-words`}>
							{message}
						</p>
					</div>
					<button
						onClick={onClose}
						className={`
              flex-shrink-0 p-1 rounded-md ${config.text} 
              hover:bg-white hover:bg-opacity-20 
              transition-colors duration-200 focus:outline-none 
              focus:ring-2 focus:ring-offset-2 focus:ring-current
            `}
						aria-label="Close notification"
					>
						<X size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};
export default Notification;
