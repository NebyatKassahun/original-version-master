import React, { useState, useEffect } from "react";

const PRODUCT_API = "https://stockmanagementbackend.onrender.com/api/product/";
const PURCHASE_API =
	"https://stockmanagementbackend.onrender.com/api/purchase/";

const Purchase = () => {
	const [products, setProducts] = useState([]);
	const [purchases, setPurchases] = useState([]);
	const [form, setForm] = useState({
		productId: "",
		quantity: "",
		price: "",
		date: "",
	});
	const [error, setError] = useState("");

	// Fetch products
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(PRODUCT_API, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				const data = await res.json();
				setProducts(Array.isArray(data.products) ? data.products : data);
			} catch {
				setError("Could not load products.");
			}
		};
		fetchProducts();
	}, []);

	// Fetch purchases
	useEffect(() => {
		const fetchPurchases = async () => {
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(PURCHASE_API, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				if (!res.ok) throw new Error("Could not fetch purchases");
				const data = await res.json();
				setPurchases(
					Array.isArray(data.purchases)
						? data.purchases
						: Array.isArray(data)
						? data
						: []
				);
			} catch {
				setPurchases([]); // Defensive: set to empty array on error
			}
		};
		fetchPurchases();
	}, []);

	const handleFormChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	// Make a purchase and update product quantity
	const handleAddPurchase = async (e) => {
		e.preventDefault();
		setError("");

		const token = localStorage.getItem("token");
		const { productId, quantity, price, date } = form;

		if (!productId || !quantity || !price || !date) {
			setError("All fields are required.");
			return;
		}

		try {
			const res = await fetch(PURCHASE_API, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					products: [
						{
							productId,
							quantity: Number(quantity),
							purchasePrice: Number(price),
						},
					],
					date,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Purchase creation failed:", errorData);
				throw new Error(errorData.message || "Purchase creation failed");
			}

			// Refresh purchases and products
			const [purchasesRes, productsRes] = await Promise.all([
				fetch(PURCHASE_API, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				}),
				fetch(PRODUCT_API, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				}),
			]);

			const purchasesData = await purchasesRes.json();
			setPurchases(Array.isArray(purchasesData) ? purchasesData : []);

			const productsData = await productsRes.json();
			setProducts(
				Array.isArray(productsData.products)
					? productsData.products
					: productsData
			);

			// Reset form
			setForm({
				productId: "",
				quantity: "",
				price: "",
				date: "",
			});
		} catch (err) {
			console.error(err);
			setError("Could not add purchase.");
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-gray-900">Purchases</h1>
			<div className="bg-white rounded-xl shadow-lg p-6">
				{error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
				<form
					onSubmit={handleAddPurchase}
					className="mb-6 flex flex-col md:flex-row gap-4"
				>
					<select
						name="productId"
						value={form.productId}
						onChange={handleFormChange}
						className="border px-3 py-2 rounded-lg flex-1"
						required
					>
						<option value="">Select Product</option>
						{products.map((p) => (
							<option key={p._id || p.id || p.name} value={p._id || p.id}>
								{p.name}
							</option>
						))}
					</select>
					<input
						type="number"
						name="quantity"
						value={form.quantity}
						onChange={handleFormChange}
						placeholder="Quantity"
						className="border px-3 py-2 rounded-lg flex-1"
						required
						min="1"
					/>
					<input
						type="number"
						name="price"
						value={form.price}
						onChange={handleFormChange}
						placeholder="Price Bought"
						className="border px-3 py-2 rounded-lg flex-1"
						required
						min="0"
						step="0.01"
					/>
					<input
						type="date"
						name="date"
						value={form.date}
						onChange={handleFormChange}
						className="border px-3 py-2 rounded-lg flex-1"
						required
					/>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
					>
						Add Purchase
					</button>
				</form>
				<table className="w-full text-left">
					<thead>
						<tr>
							<th className="py-2">Product</th>
							<th className="py-2">Quantity</th>
							<th className="py-2">Price Bought</th>
							<th className="py-2">Date</th>
							<th className="py-2">Action</th>
						</tr>
					</thead>
					<tbody>
						{Array.isArray(purchases) && purchases.length > 0 ? (
							purchases.map((purchase) => (
								<tr
									key={purchase.purchaseId || purchase.id}
									className="border-t"
								>
									<td className="py-2">
										{purchase.product?.name || purchase.productName || "-"}
									</td>
									<td className="py-2">
										{purchase.quantity || purchase.purchaseQuantity || "-"}
									</td>
									<td className="py-2">
										{purchase.price || purchase.purchasePrice || "-"}
									</td>
									<td className="py-2">
										{purchase.date || purchase.createdAt
											? (purchase.date || purchase.createdAt).slice(0, 10)
											: "-"}
									</td>
									<td className="py-2">
										{/* You can add delete/edit actions here */}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={5} className="text-center text-gray-500 py-4">
									No purchases recorded.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Purchase;
