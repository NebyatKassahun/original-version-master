import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import {
	Trash2,
	Plus,
	TrendingUp,
	DollarSign,
	Calendar,
	Edit,
} from "lucide-react";
// import SaleAddModal from "./SaleAddModal";

const API_URL = getBaseUrl() + "/api/sales";

const Sales = () => {
	const [sales, setSales] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingSale, setEditingSale] = useState(null);
	const [form, setForm] = useState({
		customerId: '',
		productSales: [
			{ productId: '', saleQuantity: '', salePrice: '' },
		],
	});
	const [customers, setCustomers] = useState([]);
	const [products, setProducts] = useState([]);

	useEffect(() => {
		fetchSales();
		// Fetch customers
		const fetchCustomers = async () => {
			const token = localStorage.getItem("token");
			const res = await fetch(getBaseUrl() + "/api/customers", {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			if (res.ok) {
				const data = await res.json();
				setCustomers((data.customers || data).filter((c) => !c.isDeleted));
			}
		};
		// Fetch products
		const fetchProducts = async () => {
			const token = localStorage.getItem("token");
			const res = await fetch(getBaseUrl() + "/api/product", {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			if (res.ok) {
				const data = await res.json();
				setProducts(Array.isArray(data) ? data : data.products || []);
			}
		};
		fetchCustomers();
		fetchProducts();
	}, []);

	const fetchSales = async () => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(API_URL, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error("API Error Response:", errorText);
				throw new Error(
					`Failed to fetch sales: ${res.status} ${res.statusText}`
				);
			}
			const data = await res.json();
			console.log("Sales API Response:", data);

			// Handle different response formats
			const salesArray = Array.isArray(data.sales)
				? data.sales
				: Array.isArray(data)
				? data
				: Array.isArray(data.items)
				? data.items
				: Array.isArray(data.data)
				? data.data
				: [];

			setSales(salesArray);
		} catch (err) {
			console.error("Error fetching sales:", err);
			setError("Could not load sales. Please check your connection.");
		} finally {
			setLoading(false);
		}
	};

	// const handleModalSuccess = () => {
	// 	setSuccess("Sale created successfully!");
	// 	fetchSales(); // Refresh the sales list
	// };

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this sale?")) return;

		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const token = localStorage.getItem("token");
			const userId = localStorage.getItem("userId") || 1;
			const res = await fetch(`${API_URL}/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId }),
			});
			if (!res.ok) {
				const errorText = await res.text();
				console.error("Delete Sale Error:", errorText);
				throw new Error("Failed to delete sale");
			}
			setSales(sales.filter((sale) => sale.saleId !== id && sale.id !== id));
			setSuccess("Sale deleted successfully!");
		} catch (err) {
			console.error("Error deleting sale:", err);
			setError("Could not delete sale. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (sale) => {
		setEditingSale(sale);
		setForm({
			customerId: sale.customerId || sale.customer?.customerId || '',
			productSales: (sale.productSales || []).map(ps => ({
				productId: ps.productId || '',
				saleQuantity: ps.saleQuantity?.toString() || '',
				salePrice: ps.salePrice?.toString() || '',
			})),
		});
		setShowModal(true);
	};
	const resetForm = () => {
		setForm({ customerId: '', productSales: [{ productId: '', saleQuantity: '', salePrice: '' }] });
		setEditingSale(null);
		setShowModal(false);
	};
	const handleFormChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};
	const handleProductSaleChange = (index, field, value) => {
		const updated = [...form.productSales];
		updated[index] = { ...updated[index], [field]: value };
		setForm({ ...form, productSales: updated });
	};
	const addProductSale = () => {
		setForm({
			...form,
			productSales: [
				...form.productSales,
				{ productId: '', saleQuantity: '', salePrice: '' },
			],
		});
	};
	const removeProductSale = (index) => {
		if (form.productSales.length > 1) {
			const updated = form.productSales.filter((_, i) => i !== index);
			setForm({ ...form, productSales: updated });
		}
	};
	const handleModalSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const token = localStorage.getItem('token');
			const saleData = {
				customerId: form.customerId,
				productSales: form.productSales.map(ps => ({
					productId: ps.productId,
					saleQuantity: Number(ps.saleQuantity),
					salePrice: Number(ps.salePrice),
				})),
			};
			let res;
			if (editingSale) {
				res = await fetch(`${API_URL}/${editingSale.saleId || editingSale.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(saleData),
				});
				if (!res.ok) throw new Error('Failed to update sale');
				setSuccess('Sale updated successfully!');
			} else {
				res = await fetch(API_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(saleData),
				});
				if (!res.ok) throw new Error('Failed to add sale');
				setSuccess('Sale created successfully!');
			}
			resetForm();
			fetchSales();
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-8 min-h-full p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
					<p className="text-gray-600 mt-1">
						Track and manage your sales transactions
					</p>
				</div>
				<div className="flex items-center space-x-4">
					<div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
						{sales.length} sales
					</div>
					<button
						onClick={() => setShowModal(true)}
						className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
					>
						<Plus className="w-5 h-5" />
						<span className="font-medium">Add Sale</span>
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
					{error}
				</div>
			)}

			{success && (
				<div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
					{success}
				</div>
			)}

			{/* Stats Summary */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
							<TrendingUp className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Total Sales</p>
							<p className="text-2xl font-bold text-gray-900">{sales.length}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-green-100 text-green-600 rounded-xl">
							<DollarSign className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Total Revenue</p>
							<p className="text-2xl font-bold text-gray-900">
								{sales
									.reduce((sum, sale) => {
										const saleRevenue =
											sale.productSales?.reduce(
												(saleSum, ps) =>
													saleSum + ps.salePrice * ps.saleQuantity,
												0
											) || 0;
										return sum + saleRevenue;
									}, 0)
									.toFixed(2)} ETB
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
							<Calendar className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-600">This Month</p>
							<p className="text-2xl font-bold text-gray-900">
								{
									sales.filter((sale) => {
										const saleDate = new Date(sale.createdAt || sale.date);
										const now = new Date();
										return (
											saleDate.getMonth() === now.getMonth() &&
											saleDate.getFullYear() === now.getFullYear()
										);
									}).length
								}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Sales Table */}
			<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
				<div className="px-6 py-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-800">Sales History</h2>
				</div>

				{loading ? (
					<div className="flex justify-center items-center min-h-[60vh]">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Customer
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Products
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Total Quantity
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Total Revenue
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Created By
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Date
									</th>
									<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{sales.map((sale) => {
									const totalQuantity =
										sale.productSales?.reduce(
											(sum, ps) => sum + ps.saleQuantity,
											0
										) || 0;
									const totalRevenue =
										sale.productSales?.reduce(
											(sum, ps) => sum + ps.salePrice * ps.saleQuantity,
											0
										) || 0;

									return (
										<tr
											key={sale.saleId || sale.id}
											className="hover:bg-gray-50 transition-colors duration-200"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-gray-600">
													{sale.customer ? (
														<div>
															<div className="font-medium">
																{sale.customer.firstName}{" "}
																{sale.customer.lastName}
															</div>
															<div className="text-sm text-gray-500">
																{sale.customer.email}
															</div>
														</div>
													) : (
														<span className="text-gray-400">No customer</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="space-y-1">
													{sale.productSales?.map((ps, index) => (
														<div key={index} className="text-sm">
															<span className="font-medium">
																{ps.product?.name || "Unknown Product"}
															</span>
															<span className="text-gray-500 ml-2">
																({ps.saleQuantity} × {ps.salePrice}) ETB
															</span>
														</div>
													)) || (
														<div className="text-gray-500">No products</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="inline-flex px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
													{totalQuantity}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-green-600 font-semibold">
													{totalRevenue.toFixed(2)} ETB
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-gray-600">
													{sale.createdByUser?.firstName &&
													sale.createdByUser?.lastName
														? `${sale.createdByUser.firstName} ${sale.createdByUser.lastName}`
														: sale.createdBy || "Unknown"}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-gray-600">
													{new Date(
														sale.createdAt || sale.date
													).toLocaleDateString()}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm">
												<div className="flex items-center justify-end space-x-2">
													<button
														onClick={() => handleEdit(sale)}
														className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
														disabled={loading}
														title="Edit"
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDelete(sale.saleId || sale.id)}
														className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
														disabled={loading}
														title="Delete"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
								{sales.length === 0 && !loading && (
									<tr>
										<td colSpan={7} className="text-center py-12">
											<div className="text-gray-500">
												<svg
													className="mx-auto h-12 w-12 text-gray-400 mb-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
													/>
												</svg>
												<p className="text-lg font-medium">
													No sales data available
												</p>
												<p className="text-sm">
													Get started by creating your first sale
												</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
			{/* Add the SaleAddModal at the end */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
					<div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl p-6 z-60">
						<button
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
							onClick={resetForm}
						>
							&times;
						</button>
						<h2 className="text-2xl font-bold mb-6 text-gray-800">
							{editingSale ? 'Edit Sale' : 'Add New Sale'}
						</h2>
						<form onSubmit={handleModalSubmit} className="space-y-4">
							{/* Customer Selection */}
							<div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
								<label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
								<select
									name="customerId"
									value={form.customerId}
									onChange={handleFormChange}
									className="border border-gray-300 px-4 py-3 rounded-xl w-full"
									required
								>
									<option value="">Select Customer</option>
									{customers.map((c) => (
										<option key={c.customerId} value={c.customerId}>
											{c.firstName} {c.lastName} ({c.email})
										</option>
									))}
								</select>
							</div>
							{/* Product Sales Cards */}
							{form.productSales.map((ps, idx) => (
								<div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-gray-800">Product {idx + 1}</h3>
										{form.productSales.length > 1 && (
											<button
												type="button"
												onClick={() => removeProductSale(idx)}
												className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
											<select
												value={ps.productId}
												onChange={e => handleProductSaleChange(idx, 'productId', e.target.value)}
												className="border border-gray-300 px-4 py-3 rounded-xl w-full"
												required
											>
												<option value="">Select Product</option>
												{products.map((p) => (
													<option key={p.productId} value={p.productId}>
														{p.name}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
											<input
												type="number"
												value={ps.saleQuantity}
												onChange={e => handleProductSaleChange(idx, 'saleQuantity', e.target.value)}
												className="border border-gray-300 px-4 py-3 rounded-xl w-full"
												required
												min="1"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
											<input
												type="number"
												value={ps.salePrice}
												onChange={e => handleProductSaleChange(idx, 'salePrice', e.target.value)}
												className="border border-gray-300 px-4 py-3 rounded-xl w-full"
												required
												min="0"
												step="0.01"
											/>
										</div>
									</div>
								</div>
							))}
							<div className="flex items-center space-x-4">
								<button
									type="button"
									onClick={addProductSale}
									className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
								>
									<Plus className="w-4 h-4" />
									<span>Add Another Product</span>
								</button>
							</div>
							<div className="flex gap-2 mt-6">
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
								>
									{loading ? 'Saving...' : editingSale ? 'Update' : 'Create'}
								</button>
								<button
									type="button"
									onClick={resetForm}
									className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Sales;
