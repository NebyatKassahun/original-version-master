import React, { useState, useEffect } from "react";

const SUPPLIER_API =
	"https://stockmanagementbackend.onrender.com/api/suppliers/";
const PRODUCT_API = "https://stockmanagementbackend.onrender.com/api/product/";

const Purchase = () => {
	const [suppliers, setSuppliers] = useState([]);
	const [products, setProducts] = useState([]);
	const [purchases, setPurchases] = useState([]);
	const [form, setForm] = useState({
		supplierId: "",
		productId: "",
		quantity: "",
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
				body: JSON.stringify(newSupplier),
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

	const handleFormChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleAddPurchase = (e) => {
		e.preventDefault();
		const supplier = suppliers.find((s) => s.customerId === form.supplierId);
		const product = products.find((p) => (p._id || p.id) === form.productId);
		if (!supplier || !product || !form.quantity || !form.date) return;
		setPurchases([
			...purchases,
			{
				id: Date.now(),
				supplier,
				product,
				quantity: form.quantity,
				date: form.date,
			},
		]);
		setForm({ supplierId: "", productId: "", quantity: "", date: "" });
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
							<option key={s.customerId} value={s.customerId}>
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
							<option key={p._id || p.id} value={p._id || p.id}>
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
							<th className="py-2">Date</th>
							<th className="py-2">Action</th>
						</tr>
					</thead>
					<tbody>
						{purchases.map((purchase) => (
							<tr key={purchase.id} className="border-t">
								<td className="py-2">
									{purchase.supplier.firstName} {purchase.supplier.lastName}
								</td>
								<td className="py-2">{purchase.product.name}</td>
								<td className="py-2">{purchase.quantity}</td>
								<td className="py-2">{purchase.date}</td>
								<td className="py-2">
									{/* You can add delete/edit actions here */}
								</td>
							</tr>
						))}
						{purchases.length === 0 && (
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
