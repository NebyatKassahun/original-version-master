import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import { Edit, Trash2, Save, X } from "lucide-react";

const API_URL = getBaseUrl() + "/api/sales/";

const Sales = () => {
	const [sales, setSales] = useState([]);
	const [newSale, setNewSale] = useState({
		productName: "",
		quantity: "",
		price: "",
		cost: "",
		date: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [editId, setEditId] = useState(null);
	const [editValues, setEditValues] = useState({});

	useEffect(() => {
		const fetchSales = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(API_URL, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				if (!res.ok) throw new Error("Failed to fetch sales");
				const data = await res.json();
				setSales(Array.isArray(data.sales) ? data.sales : data);
			} catch {
				setError("Could not load sales.");
			} finally {
				setLoading(false);
			}
		};
		fetchSales();
	}, []);

	const handleChange = (e) => {
		setNewSale({ ...newSale, [e.target.name]: e.target.value });
	};

	const handleAddSale = async (e) => {
		e.preventDefault();
		if (
			!newSale.productName ||
			!newSale.quantity ||
			!newSale.price ||
			!newSale.cost ||
			!newSale.date
		)
			return;
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					...newSale,
					quantity: Number(newSale.quantity),
					price: Number(newSale.price),
					cost: Number(newSale.cost),
				}),
			});
			if (!res.ok) throw new Error("Failed to add sale");
			const added = await res.json();
			setSales([...sales, added.sale || added]);
			setNewSale({
				productName: "",
				quantity: "",
				price: "",
				cost: "",
				date: "",
			});
		} catch {
			setError("Could not add sale.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}${id}`, {
				method: "DELETE",
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			if (!res.ok) throw new Error("Failed to delete sale");
			setSales(sales.filter((sale) => sale._id !== id && sale.id !== id));
		} catch {
			setError("Could not delete sale.");
		} finally {
			setLoading(false);
		}
	};

	const handleEditClick = (sale) => {
		setEditId(sale._id || sale.id);
		setEditValues({
			productName: sale.productName,
			quantity: sale.quantity,
			price: sale.price,
			cost: sale.cost,
			date: sale.date ? sale.date.slice(0, 10) : "",
		});
	};

	const handleEditChange = (e) => {
		setEditValues({ ...editValues, [e.target.name]: e.target.value });
	};

	const handleEditSave = async (id) => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					...editValues,
					quantity: Number(editValues.quantity),
					price: Number(editValues.price),
					cost: Number(editValues.cost),
				}),
			});
			if (!res.ok) throw new Error("Failed to update sale");
			const updated = await res.json();
			setSales((prev) =>
				prev.map((sale) =>
					sale._id === id || sale.id === id
						? { ...sale, ...(updated.sale || updated) }
						: sale
				)
			);
			setEditId(null);
			setEditValues({});
		} catch {
			setError("Could not update sale.");
		} finally {
			setLoading(false);
		}
	};

	const handleEditCancel = () => {
		setEditId(null);
		setEditValues({});
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-gray-900">Sales Management</h1>
			<div className="bg-white rounded-xl shadow-lg p-6">
				<form onSubmit={handleAddSale} className="mb-6 space-y-4">
					<div className="flex flex-col md:flex-row gap-4">
						<input
							type="text"
							name="productName"
							value={newSale.productName}
							onChange={handleChange}
							placeholder="Product Name"
							className="border px-3 py-2 rounded-lg flex-1"
							required
						/>
						<input
							type="number"
							name="quantity"
							value={newSale.quantity}
							onChange={handleChange}
							placeholder="Quantity"
							className="border px-3 py-2 rounded-lg flex-1"
							required
							min="1"
						/>
						<input
							type="number"
							name="price"
							value={newSale.price}
							onChange={handleChange}
							placeholder="Price"
							className="border px-3 py-2 rounded-lg flex-1"
							required
							min="0"
						/>
						<input
							type="number"
							name="cost"
							value={newSale.cost}
							onChange={handleChange}
							placeholder="Cost"
							className="border px-3 py-2 rounded-lg flex-1"
							required
							min="0"
						/>
						<input
							type="date"
							name="date"
							value={newSale.date}
							onChange={handleChange}
							className="border px-3 py-2 rounded-lg flex-1"
							required
						/>
						<button
							type="submit"
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
							disabled={loading}
						>
							Add Sale
						</button>
					</div>
				</form>
				{error && (
					<div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
						{error}
					</div>
				)}
				{loading ? (
					<div className="text-center text-gray-500 py-4">Loading...</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr>
								<th className="py-2">Product</th>
								<th className="py-2">Quantity</th>
								<th className="py-2">Price</th>
								<th className="py-2">Cost</th>
								<th className="py-2">Date</th>
								<th className="py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{sales.map((sale) => {
								const isEditing = editId === (sale._id || sale.id);
								return (
									<tr key={sale._id || sale.id} className="border-t">
										<td className="py-2">
											{isEditing ? (
												<input
													type="text"
													name="productName"
													value={editValues.productName}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded w-full"
												/>
											) : (
												sale.productName
											)}
										</td>
										<td className="py-2">
											{isEditing ? (
												<input
													type="number"
													name="quantity"
													value={editValues.quantity}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded w-full"
													min="1"
												/>
											) : (
												sale.quantity
											)}
										</td>
										<td className="py-2">
											{isEditing ? (
												<input
													type="number"
													name="price"
													value={editValues.price}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded w-full"
													min="0"
												/>
											) : (
												`$${sale.price}`
											)}
										</td>
										<td className="py-2">
											{isEditing ? (
												<input
													type="number"
													name="cost"
													value={editValues.cost}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded w-full"
													min="0"
												/>
											) : (
												`$${sale.cost}`
											)}
										</td>
										<td className="py-2">
											{isEditing ? (
												<input
													type="date"
													name="date"
													value={editValues.date}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded w-full"
												/>
											) : (
												new Date(sale.date).toLocaleDateString()
											)}
										</td>
										<td className="py-2">
											<div className="flex items-center space-x-2">
												{isEditing ? (
													<>
														<button
															onClick={() =>
																handleEditSave(sale._id || sale.id)
															}
															className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
															disabled={loading}
															title="Save"
														>
															<Save className="w-4 h-4" />
														</button>
														<button
															onClick={handleEditCancel}
															className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
															disabled={loading}
															title="Cancel"
														>
															<X className="w-4 h-4" />
														</button>
													</>
												) : (
													<>
														<button
															onClick={() => handleEditClick(sale)}
															className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
															disabled={loading}
															title="Edit"
														>
															<Edit className="w-4 h-4" />
														</button>
														<button
															onClick={() => handleDelete(sale._id || sale.id)}
															className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
															disabled={loading}
															title="Delete"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</>
												)}
											</div>
										</td>
									</tr>
								);
							})}
							{sales.length === 0 && !loading && (
								<tr>
									<td colSpan={6} className="text-center text-gray-500 py-4">
										No sales data available.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default Sales;
