import React, { useState } from "react";

function PaymentCalendar({ startDate, months, paymentMethod, onConfirm }) {
	const [selectedDates, setSelectedDates] = useState([]);

	// Helper functions
	const addDays = (date, days) => {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	};

	const generateCalendar = () => {
		const calendar = [];
		const start = new Date(startDate);

		for (let m = 0; m < months; m++) {
			const currentMonth = new Date(
				start.getFullYear(),
				start.getMonth() + m,
				1
			);
			const monthData = {
				month: currentMonth,
				monthName: currentMonth.toLocaleString("default", { month: "long" }),
				year: currentMonth.getFullYear(),
				weeks: [],
				days: [],
			};

			if (paymentMethod === "weekly") {
				let currentWeekStart = new Date(currentMonth);
				while (currentWeekStart.getMonth() === currentMonth.getMonth()) {
					monthData.weeks.push(new Date(currentWeekStart));
					currentWeekStart = addDays(currentWeekStart, 7);
				}
			} else if (paymentMethod === "daily") {
				const daysInMonth = new Date(
					currentMonth.getFullYear(),
					currentMonth.getMonth() + 1,
					0
				).getDate();

				for (let d = 1; d <= daysInMonth; d++) {
					monthData.days.push(
						new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d)
					);
				}
			}

			calendar.push(monthData);
		}

		return calendar;
	};

	const calendar = generateCalendar();

	const toggleDate = (date) => {
		const dateStr = date.toISOString().split("T")[0];
		setSelectedDates((prev) =>
			prev.includes(dateStr)
				? prev.filter((d) => d !== dateStr)
				: [...prev, dateStr]
		);
	};

	const handleConfirm = () => {
		if (selectedDates.length === 0) {
			alert("Please select at least one payment date");
			return;
		}
		onConfirm(selectedDates);
		setSelectedDates([]);
	};

	return (
		<div className="p-4 border rounded-lg bg-white shadow-sm">
			{calendar.map(({ month, monthName, year, weeks, days }, idx) => (
				<div key={idx} className="mb-6">
					<h3 className="text-lg font-semibold mb-3">
						{monthName} {year}
					</h3>

					{weeks.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-medium mb-2">Weekly Payments:</h4>
							<div className="flex flex-wrap gap-2">
								{weeks.map((week, i) => {
									const dateStr = week.toISOString().split("T")[0];
									return (
										<button
											key={i}
											onClick={() => toggleDate(week)}
											className={`px-3 py-1 rounded-md border text-sm ${
												selectedDates.includes(dateStr)
													? "bg-blue-600 text-white border-blue-700"
													: "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
											}`}
										>
											Week {i + 1}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{days.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-medium mb-2">Daily Payments:</h4>
							<div className="grid grid-cols-7 gap-1">
								{days.map((day, i) => {
									const dateStr = day.toISOString().split("T")[0];
									return (
										<button
											key={i}
											onClick={() => toggleDate(day)}
											className={`p-1 rounded-md text-xs text-center ${
												selectedDates.includes(dateStr)
													? "bg-blue-600 text-white"
													: "bg-white text-gray-800 hover:bg-gray-100"
											}`}
										>
											{day.getDate()}
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>
			))}

			<button
				onClick={handleConfirm}
				disabled={selectedDates.length === 0}
				className={`mt-4 px-4 py-2 rounded-md text-white ${
					selectedDates.length > 0
						? "bg-green-600 hover:bg-green-700"
						: "bg-gray-400 cursor-not-allowed"
				}`}
			>
				Confirm {selectedDates.length} Payment
				{selectedDates.length !== 1 ? "s" : ""}
			</button>
		</div>
	);
}

export default PaymentCalendar;
