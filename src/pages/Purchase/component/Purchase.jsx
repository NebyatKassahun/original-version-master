import React, { useState, useEffect } from "react";

const SUPPLIER_API =
	"https://stockmanagementbackend.onrender.com/api/suppliers/";
const PRODUCT_API = "https://stockmanagementbackend.onrender.com/api/product/";
const PURCHASE_API =
	"https://stockmanagementbackend.onrender.com/api/purchase/";

const Purchase = () => {
	const [suppliers, setSuppliers] = useState([]);
	const [products, setProducts] = useState([]);
	const [purchases, setPurchases] = useState([]);
	const [form, setForm] = useState({
		supplierId: "",
		productId: "",
		quantity: "",
		price: "",
		date: "",
	});
	const [error, setError] = useState("");
	const [showAddSupplier, setShowAddSupplier] = useState(false);
	const [newSupplier, setNewSupplier] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});
	const [supplierLoading, setSupplierLoading] = useState(false);
	const [supplierError, setSupplierError] = useState("");

	// Fetch suppliers
	useEffect(() => {
		const fetchSuppliers = async () => {
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(SUPPLIER_API, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				const data = await res.json();
				setSuppliers((data.suppliers || data).filter((s) => !s.isDeleted));
			} catch {
				setError("Could not load suppliers.");
			}
		};
		fetchSuppliers();
	}, []);

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

	const handleNewSupplierChange = (e) => {
		setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
	};

	const handleAddSupplier = async (e) => {
		e.preventDefault();
		setSupplierLoading(true);
		setSupplierError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(SUPPLIER_API, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ ...newSupplier, isSupplier: true }),
			});
			if (!res.ok) throw new Error("Failed to add supplier");
			await res.json();
			// Refetch suppliers
			const res2 = await fetch(SUPPLIER_API, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			const data = await res2.json();
			setSuppliers((data.suppliers || data).filter((s) => !s.isDeleted));
			setShowAddSupplier(false);
			setNewSupplier({
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
			});
		} catch {
			setSupplierError("Could not add supplier.");
		} finally {
			setSupplierLoading(false);
		}
	};

	const handleFormChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	// Make a purchase and update product quantity
	const handleAddPurchase = async (e) => {
		e.preventDefault();
		setError("");
		const token = localStorage.getItem("token");
		const { supplierId, productId, quantity, price, date } = form;
		if (!supplierId || !productId || !quantity || !price || !date) {
			setError("All fields are required.");
			return;
		}
		try {
			// 1. Make purchase (assumes backend will update product quantity)
			const res = await fetch(PURCHASE_API, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					supplierId,
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
			if (!res.ok) throw new Error("Failed to add purchase");
			// Optionally, refetch purchases and products
			const [purchasesRes, productsRes] = await Promise.all([
				fetch(PURCHASE_API, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				}),
				fetch(PRODUCT_API, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				}),
			]);
			const purchasesData = await purchasesRes.json();
			setPurchases(
				Array.isArray(purchasesData.purchases)
					? purchasesData.purchases
					: purchasesData
			);
			const productsData = await productsRes.json();
			setProducts(
				Array.isArray(productsData.products)
					? productsData.products
					: productsData
			);
			setForm({
				supplierId: "",
				productId: "",
				quantity: "",
				price: "",
				date: "",
			});
		} catch {
			setError("Could not add purchase.");
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-gray-900">Purchases</h1>
			<div className="bg-white rounded-xl shadow-lg p-6">
				{error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
				{/* Add Supplier Section */}
				<div className="mb-4">
					{!showAddSupplier ? (
						<button
							type="button"
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
							onClick={() => setShowAddSupplier(true)}
						>
							+ Add Supplier
						</button>
					) : (
						<form
							onSubmit={handleAddSupplier}
							className="flex flex-col md:flex-row gap-4 mb-4"
						>
							<input
								name="firstName"
								placeholder="First Name"
								value={newSupplier.firstName}
								onChange={handleNewSupplierChange}
								required
								className="border px-3 py-2 rounded-lg flex-1"
							/>
							<input
								name="lastName"
								placeholder="Last Name"
								value={newSupplier.lastName}
								onChange={handleNewSupplierChange}
								required
								className="border px-3 py-2 rounded-lg flex-1"
							/>
							<input
								name="email"
								placeholder="Email"
								type="email"
								value={newSupplier.email}
								onChange={handleNewSupplierChange}
								required
								className="border px-3 py-2 rounded-lg flex-1"
							/>
							<input
								name="phone"
								placeholder="Phone"
								value={newSupplier.phone}
								onChange={handleNewSupplierChange}
								required
								className="border px-3 py-2 rounded-lg flex-1"
							/>
							<button
								type="submit"
								className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
								disabled={supplierLoading}
							>
								{supplierLoading ? "Adding..." : "Add"}
							</button>
							<button
								type="button"
								className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
								onClick={() => setShowAddSupplier(false)}
							>
								Cancel
							</button>
						</form>
					)}
					{supplierError && (
						<div className="mb-2 text-red-600 font-medium">{supplierError}</div>
					)}
				</div>

				<form
					onSubmit={handleAddPurchase}
					className="mb-6 flex flex-col md:flex-row gap-4"
				>
					<select
						name="supplierId"
						value={form.supplierId}
						onChange={handleFormChange}
						className="border px-3 py-2 rounded-lg flex-1"
						required
					>
						<option value="">Select Supplier</option>
						{suppliers.map((s) => (
							<option key={s.customerId || s.email} value={s.customerId}>
								{s.firstName} {s.lastName}
							</option>
						))}
					</select>
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
							<th className="py-2">Supplier</th>
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
										{purchase.supplier?.firstName ||
											purchase.supplierFirstName ||
											"-"}{" "}
										{purchase.supplier?.lastName ||
											purchase.supplierLastName ||
											""}
									</td>
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
								<td colSpan={6} className="text-center text-gray-500 py-4">
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
