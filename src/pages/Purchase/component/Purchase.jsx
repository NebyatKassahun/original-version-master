import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import { Edit, Trash2, Plus} from "lucide-react";

const PURCHASE_API = getBaseUrl() + "/api/purchase/";
const SUPPLIER_API = getBaseUrl() + "/api/suppliers/";
const PRODUCT_API = getBaseUrl() + "/api/product/";

const Purchase = () => {
	const [purchases, setPurchases] = useState([]);
	const [products, setProducts] = useState([]);
	const [suppliers, setSuppliers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingPurchase, setEditingPurchase] = useState(null);
	const [form, setForm] = useState({
		supplierId: "",
		productPurchases: [
			{
				productId: "",
				quantity: "",
				purchasePrice: "",
			},
		],
	});

	// Fetch all data on component mount
	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const headers = token ? { Authorization: `Bearer ${token}` } : {};

			// Fetch purchases
			const purchasesRes = await fetch(PURCHASE_API, { headers });
			const purchasesData = await purchasesRes.json();
			setPurchases(Array.isArray(purchasesData) ? purchasesData : []);

			// Fetch products
			const productsRes = await fetch(PRODUCT_API, { headers });
			const productsData = await productsRes.json();
			setProducts(Array.isArray(productsData) ? productsData : []);

			// Fetch suppliers
			const suppliersRes = await fetch(SUPPLIER_API, { headers });
			const suppliersData = await suppliersRes.json();
			setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
		} catch (err) {
			setError("Failed to load data");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const handleProductPurchaseChange = (index, field, value) => {
		const updated = [...form.productPurchases];
		updated[index] = { ...updated[index], [field]: value };
		setForm({ ...form, productPurchases: updated });
	};

	const addProductPurchase = () => {
		setForm({
			...form,
			productPurchases: [
				...form.productPurchases,
				{ productId: "", quantity: "", purchasePrice: "" },
			],
		});
	};

	const removeProductPurchase = (index) => {
		if (form.productPurchases.length > 1) {
			const updated = form.productPurchases.filter((_, i) => i !== index);
			setForm({ ...form, productPurchases: updated });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		if (!form.supplierId || form.productPurchases.some(pp => !pp.productId || !pp.quantity || !pp.purchasePrice)) {
			setError("All fields are required");
			setLoading(false);
			return;
		}

		try {
			const token = localStorage.getItem("token");
			const purchaseData = {
				supplierId: form.supplierId,
				customerId: form.supplierId, // Using supplier as customer for now
				productPurchases: form.productPurchases.map(pp => ({
					productId: pp.productId,
					purchaseQuantity: Number(pp.quantity),
					purchasePrice: Number(pp.purchasePrice),
				})),
			};

			console.log("Sending purchase data:", purchaseData);

			const url = editingPurchase 
				? `${PURCHASE_API}${editingPurchase.purchaseId}`
				: PURCHASE_API;
			const method = editingPurchase ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(purchaseData),
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.log("Error response:", errorData);
				throw new Error(errorData.message || "Failed to save purchase");
			}

			setSuccess(editingPurchase ? "Purchase updated successfully!" : "Purchase created successfully!");
			resetForm();
			await fetchData(); // Refresh the list
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (purchase) => {
		setEditingPurchase(purchase);
		const productPurchases = purchase.productPurchases || [];
		setForm({
			supplierId: purchase.supplierId || "",
			productPurchases: productPurchases.map(pp => ({
				productId: pp.productId || "",
				quantity: pp.purchaseQuantity?.toString() || "",
				purchasePrice: pp.purchasePrice?.toString() || "",
			})),
		});
		setShowModal(true);
	};

	const handleDelete = async (purchaseId) => {
		if (!window.confirm("Are you sure you want to delete this purchase?"))
			return;

		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${PURCHASE_API}${purchaseId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Failed to delete purchase");
			}

			setSuccess("Purchase deleted successfully!");
			await fetchData(); // Refresh the list
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setForm({
			supplierId: "",
			productPurchases: [
				{ productId: "", quantity: "", purchasePrice: "" },
			],
		});
		setEditingPurchase(null);
		setShowModal(false);
	};

	const getSupplierName = (supplierId) => {
		const supplier = suppliers.find((s) => s.customerId === supplierId);
		return supplier ? `${supplier.firstName} ${supplier.lastName}` : "-";
	};

	const getProductName = (productPurchases) => {
		if (!productPurchases || !productPurchases.length) return "-";
		const product = products.find(
			(p) => p.productId === productPurchases[0].productId
		);
		return product ? product.name : "-";
	};

	const getTotalQuantity = (productPurchases) => {
		if (!productPurchases || !productPurchases.length) return 0;
		return productPurchases.reduce((sum, pp) => sum + pp.purchaseQuantity, 0);
	};

	const getTotalPrice = (productPurchases) => {
		if (!productPurchases || !productPurchases.length) return 0;
		return productPurchases.reduce(
			(sum, pp) => sum + pp.purchaseQuantity * pp.purchasePrice,
			0
		);
	};

	if (loading && purchases.length === 0) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6 min-h-full p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
					<p className="text-gray-600 mt-1">
						Manage your purchase orders and inventory
					</p>
				</div>
				<button
					onClick={() => setShowModal(true)}
					className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
				>
					<Plus className="w-5 h-5" />
					<span className="font-medium">Add Purchase</span>
				</button>
			</div>

			{/* Messages */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{error}
				</div>
			)}
			{success && (
				<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
					{success}
				</div>
			)}

			{/* Purchases Table */}
			<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Supplier
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Products
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Total Quantity
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Total Price
								</th>
								<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{purchases.length > 0 ? (
								purchases.map((purchase) => (
									<tr
										key={purchase.purchaseId}
										className="hover:bg-gray-50 transition-colors duration-200"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="font-semibold text-gray-900">
												{getSupplierName(purchase.supplierId)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{getProductName(purchase.productPurchases)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
												{getTotalQuantity(purchase.productPurchases)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold text-red-500">
											{getTotalPrice(
												purchase.productPurchases
											).toLocaleString()}{" "}
											ETB
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm">
											<div className="flex items-center justify-end space-x-2">
												<button
													onClick={() => handleEdit(purchase)}
													className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
													title="Edit"
												>
													<Edit className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDelete(purchase.purchaseId)}
													className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
													title="Delete"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="text-center py-12">
										<div className="text-gray-500">
											<p className="text-lg">No purchases found</p>
											<p className="text-sm">
												Start by adding your first purchase
											</p>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add/Edit Modal */}
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
							{editingPurchase ? "Edit Purchase" : "Add New Purchase"}
						</h2>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Supplier
								</label>
								<select
									name="supplierId"
									value={form.supplierId}
									onChange={handleFormChange}
									className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									required
								>
									<option key="default-supplier" value="">
										Select Supplier
									</option>
									{suppliers.map((supplier) => (
										<option
											key={supplier.customerId}
											value={supplier.customerId}
										>
											{supplier.firstName} {supplier.lastName}
										</option>
									))}
								</select>
							</div>
							{/* Product Purchases Cards */}
							{form.productPurchases.map((pp, idx) => (
								<div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-gray-800">Product {idx + 1}</h3>
										{form.productPurchases.length > 1 && (
											<button
												type="button"
												onClick={() => removeProductPurchase(idx)}
												className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
											<select
												value={pp.productId}
												onChange={e => handleProductPurchaseChange(idx, "productId", e.target.value)}
												className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
												required
											>
												<option key="default-product" value="">Select Product</option>
												{products.map((product) => (
													<option key={product.productId} value={product.productId}>
														{product.name}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
											<input
												type="number"
												value={pp.quantity}
												onChange={e => handleProductPurchaseChange(idx, "quantity", e.target.value)}
												className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
												required
												min="1"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
											<input
												type="number"
												value={pp.purchasePrice}
												onChange={e => handleProductPurchaseChange(idx, "purchasePrice", e.target.value)}
												className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
									onClick={addProductPurchase}
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
									{loading
										? "Saving..."
										: editingPurchase
										? "Update"
										: "Create"}
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

export default Purchase;
