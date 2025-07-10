import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
	Title,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
	Title
);

const initialReports = [
	{ id: 1, title: "Sales", value: 1200, color: "#3b82f6" },
	{ id: 2, title: "Purchases", value: 800, color: "#10b981" },
	{ id: 3, title: "Stock", value: 500, color: "#fbbf24" },
	{ id: 4, title: "Customers", value: 200, color: "#ef4444" },
];

const SALES_API = "https://localhost:3000/api/sales";
const PRODUCT_API = "https://localhost:3000/api/product";
const PURCHASE_API = "https://localhost:3000/api/purchase";
const CUSTOMERS_API = "https://localhost:3000/api/customers";

const Reports = () => {
	const [reports, setReports] = useState(initialReports);
	const [newReport, setNewReport] = useState({
		title: "",
		value: "",
		color: "#3b82f6",
	});

	// Fetch API data and update reports
	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("token");
				const [salesRes, productRes, purchaseRes, customersRes] =
					await Promise.all([
						fetch(SALES_API, {
							headers: token ? { Authorization: `Bearer ${token}` } : {},
						}),
						fetch(PRODUCT_API, {
							headers: token ? { Authorization: `Bearer ${token}` } : {},
						}),
						fetch(PURCHASE_API, {
							headers: token ? { Authorization: `Bearer ${token}` } : {},
						}),
						fetch(CUSTOMERS_API, {
							headers: token ? { Authorization: `Bearer ${token}` } : {},
						}),
					]);
				const [sales, products, purchases, customers] = await Promise.all([
					salesRes.json(),
					productRes.json(),
					purchaseRes.json(),
					customersRes.json(),
				]);

				setReports([
					{
						id: 1,
						title: "Sales",
						value: Array.isArray(sales.sales)
							? sales.sales.length
							: Array.isArray(sales)
							? sales.length
							: 0,
						color: "#3b82f6",
					},
					{
						id: 2,
						title: "Products",
						value: Array.isArray(products.products)
							? products.products.length
							: Array.isArray(products)
							? products.length
							: 0,
						color: "#10b981",
					},
					{
						id: 3,
						title: "Purchases",
						value: Array.isArray(purchases.purchases)
							? purchases.purchases.length
							: Array.isArray(purchases)
							? purchases.length
							: 0,
						color: "#fbbf24",
					},
					{
						id: 4,
						title: "Customers",
						value: Array.isArray(customers.customers)
							? customers.customers.length
							: Array.isArray(customers)
							? customers.length
							: 0,
						color: "#ef4444",
					},
				]);
			} catch {
				// fallback to initialReports if error
			}
		};
		fetchData();
	}, []);

	const handleChange = (e) => {
		setNewReport({ ...newReport, [e.target.name]: e.target.value });
	};

	const handleAddReport = (e) => {
		e.preventDefault();
		if (!newReport.title || !newReport.value) return;
		setReports([
			...reports,
			{ ...newReport, id: Date.now(), value: Number(newReport.value) },
		]);
		setNewReport({ title: "", value: "", color: "#3b82f6" });
	};

	const handleDelete = (id) => {
		setReports(reports.filter((report) => report.id !== id));
	};

	// Bar chart data
	const barData = {
		labels: reports.map((r) => r.title),
		datasets: [
			{
				label: "Value",
				data: reports.map((r) => r.value),
				backgroundColor: reports.map((r) => r.color),
				borderRadius: 8,
			},
		],
	};

	// Pie chart data
	const pieData = {
		labels: reports.map((r) => r.title),
		datasets: [
			{
				data: reports.map((r) => r.value),
				backgroundColor: reports.map((r) => r.color),
				borderWidth: 2,
			},
		],
	};

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-semibold text-gray-900">
				Business Reports & Analytics
			</h1>
			<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
				<form
					onSubmit={handleAddReport}
					className="mb-6 flex flex-col md:flex-row gap-4"
				>
					<input
						type="text"
						name="title"
						value={newReport.title}
						onChange={handleChange}
						placeholder="Report Title"
						className="border px-3 py-2 rounded-lg flex-1"
						required
					/>
					<input
						type="number"
						name="value"
						value={newReport.value}
						onChange={handleChange}
						placeholder="Value"
						className="border px-3 py-2 rounded-lg flex-1"
						required
						min="0"
					/>
					<input
						type="color"
						name="color"
						value={newReport.color}
						onChange={handleChange}
						className="w-12 h-12 p-0 border-none bg-transparent"
						title="Pick color"
					/>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
					>
						Add
					</button>
				</form>
				<table className="w-full text-left">
					<thead>
						<tr>
							<th className="py-2">Title</th>
							<th className="py-2">Value</th>
							<th className="py-2">Color</th>
							<th className="py-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{reports.map((report) => (
							<tr key={report.id} className="border-t">
								<td className="py-2">{report.title}</td>
								<td className="py-2">{report.value}</td>
								<td className="py-2">
									<span
										className="inline-block w-6 h-6 rounded-full border border-gray-300"
										style={{ backgroundColor: report.color }}
									></span>
								</td>
								<td className="py-2">
									<button
										onClick={() => handleDelete(report.id)}
										className="text-red-600 hover:underline"
									>
										Delete
									</button>
								</td>
							</tr>
						))}
						{reports.length === 0 && (
							<tr>
								<td colSpan={4} className="text-center text-gray-500 py-4">
									No reports found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="bg-white rounded-xl shadow-lg p-6">
					<h2 className="text-lg font-semibold mb-4 text-gray-900">
						Bar Chart
					</h2>
					<Bar
						data={barData}
						options={{
							responsive: true,
							plugins: { legend: { display: false } },
						}}
					/>
				</div>
				<div className="bg-white rounded-xl shadow-lg p-6">
					<h2 className="text-lg font-semibold mb-4 text-gray-900">
						Pie Chart
					</h2>
					<Pie
						data={pieData}
						options={{
							responsive: true,
							plugins: { legend: { position: "bottom" } },
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default Reports;
