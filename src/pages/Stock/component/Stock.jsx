import React, { useState, useEffect } from "react";
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const API_URL = "https://stockmanagementbackend.onrender.com/api/product/";

const Stock = () => {
	const [stockItems, setStockItems] = useState([]);
	const [newProduct, setNewProduct] = useState({ name: "", quantity: "" });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Fetch products from API
	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(API_URL, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				if (!res.ok) throw new Error("Failed to fetch products");
				const data = await res.json();
				setStockItems(Array.isArray(data.products) ? data.products : data);
			} catch {
				setError("Could not load products.");
			} finally {
				setLoading(false);
			}
		};
		fetchProducts();
	}, []);

	const totalItems = stockItems.reduce(
		(sum, item) => sum + (item.quantity || 0),
		0
	);
	const inStock = stockItems.filter((item) => item.quantity > 10).length;
	const lowStock = stockItems.filter(
		(item) => item.quantity > 0 && item.quantity <= 10
	).length;
	const outOfStock = stockItems.filter((item) => item.quantity === 0).length;

	const handleChange = (e) => {
		setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
	};

	const handleAddProduct = async (e) => {
		e.preventDefault();
		if (!newProduct.name || isNaN(Number(newProduct.quantity))) return;
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
					name: newProduct.name,
					quantity: Number(newProduct.quantity),
				}),
			});
			if (!res.ok) throw new Error("Failed to add product");
			const added = await res.json();
			setStockItems([...stockItems, added.product || added]);
			setNewProduct({ name: "", quantity: "" });
		} catch {
			setError("Could not add product.");
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
			if (!res.ok) throw new Error("Failed to delete product");
			setStockItems(
				stockItems.filter((item) => item._id !== id && item.id !== id)
			);
		} catch {
			setError("Could not delete product.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-xl shadow-lg p-6">
					<div className="flex items-center">
						<Package className="w-8 h-8 text-blue-600" />
						<div className="ml-4">
							<p className="text-sm text-gray-600">Total Items</p>
							<p className="text-2xl font-bold">{totalItems}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-6">
					<div className="flex items-center">
						<TrendingUp className="w-8 h-8 text-green-600" />
						<div className="ml-4">
							<p className="text-sm text-gray-600">In Stock</p>
							<p className="text-2xl font-bold">{inStock}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-6">
					<div className="flex items-center">
						<TrendingDown className="w-8 h-8 text-orange-600" />
						<div className="ml-4">
							<p className="text-sm text-gray-600">Low Stock</p>
							<p className="text-2xl font-bold">{lowStock}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-6">
					<div className="flex items-center">
						<AlertTriangle className="w-8 h-8 text-red-600" />
						<div className="ml-4">
							<p className="text-sm text-gray-600">Out of Stock</p>
							<p className="text-2xl font-bold">{outOfStock}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-lg p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Stock Levels
				</h2>
				{error && (
					<div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
						{error}
					</div>
				)}
				<form
					onSubmit={handleAddProduct}
					className="flex flex-col md:flex-row gap-4 mb-6"
				>
					<input
						type="text"
						name="name"
						value={newProduct.name}
						onChange={handleChange}
						placeholder="Product Name"
						className="border px-3 py-2 rounded-lg flex-1"
						required
					/>
					<input
						type="number"
						name="quantity"
						value={newProduct.quantity}
						onChange={handleChange}
						placeholder="Quantity"
						className="border px-3 py-2 rounded-lg flex-1"
						required
						min="0"
					/>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
						disabled={loading}
					>
						Add Product
					</button>
				</form>
				{loading ? (
					<div className="text-center text-gray-500 py-4">Loading...</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr>
								<th className="py-2">Product</th>
								<th className="py-2">Quantity</th>
								<th className="py-2">Status</th>
								<th className="py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{stockItems.map((item) => (
								<tr key={item._id || item.id} className="border-t">
									<td className="py-2">{item.name}</td>
									<td className="py-2">{item.quantity}</td>
									<td className="py-2">
										{item.quantity === 0 ? (
											<span className="text-red-600 font-semibold">
												Out of Stock
											</span>
										) : item.quantity <= 10 ? (
											<span className="text-orange-600 font-semibold">
												Low Stock
											</span>
										) : (
											<span className="text-green-600 font-semibold">
												In Stock
											</span>
										)}
									</td>
									<td className="py-2">
										<button
											onClick={() => handleDelete(item._id || item.id)}
											className="text-red-600 hover:underline"
											disabled={loading}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
							{stockItems.length === 0 && !loading && (
								<tr>
									<td colSpan={4} className="text-center text-gray-500 py-4">
										No products in stock.
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

export default Stock;
