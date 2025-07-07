import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	Search,
	Plus,
	Edit,
	Trash2,
	Filter,
	Star,
	TrendingUp,
	Package,
} from "lucide-react";

const API_URL = "https://stockmanagementbackend.onrender.com/api/product/";

const Products = () => {
	const [products, setProducts] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [sortField, setSortField] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");
	const [filterCategory, setFilterCategory] = useState("all");

	useEffect(() => {
		const token = localStorage.getItem("token");
		axios
			.get(API_URL, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => setProducts(res.data))
			.catch((err) => console.error("Failed to fetch products:", err));
	}, []);

	const categories = [
		"all",
		...Array.from(new Set(products.map((p) => p.category))),
	];

	const filteredProducts = products
		.filter((product) => {
			const matchesSearch =
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.productionDate
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				product.expiryDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.category.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCategory =
				filterCategory === "all" || product.category === filterCategory;

			return matchesSearch && matchesCategory;
		})
		.sort((a, b) => {
			const aValue = a[sortField];
			const bValue = b[sortField];

			if (aValue === undefined && bValue === undefined) return 0;
			if (aValue === undefined) return 1;
			if (bValue === undefined) return -1;

			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});

	const handleSort = (field) => {
		if (field === sortField) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleDelete = (productId) => {
		const token = localStorage.getItem("token");

		if (window.confirm("Are you sure you want to delete this product?")) {
			axios
				.delete(`${API_URL}/${productId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then(() => {
					setProducts((prev) => prev.filter((p) => p.id !== productId));
				})
				.catch((err) => console.error("Delete failed:", err));
		}
	};

	const getQuantityStatusColor = (quantity) => {
		if (quantity <= 5) return "bg-red-100 text-red-800 border-red-200";
		if (quantity <= 15)
			return "bg-orange-100 text-orange-800 border-orange-200";
		if (quantity <= 30)
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		return "bg-green-100 text-green-800 border-green-200";
	};

	const InputField = ({ label, type = "text", value, onChange }) => (
		<div>
			<label className="block text-sm font-semibold text-gray-700 mb-2">
				{label}
			</label>
			<input
				type={type}
				required
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>
	);

	const ProductModal = ({ product, onClose }) => {
		const [formData, setFormData] = useState({
			name: product?.name || "",
			productionDate: product?.productionDate || "",
			expiryDate: product?.expiryDate || "",
			category: product?.category || "",
			price: product?.price || 0,
			quantity: product?.quantity || 0,
			description: product?.description || "",
			imageUrl: product?.imageUrl || "",
		});

		const handleSubmit = (e) => {
			e.preventDefault();
			const token = localStorage.getItem("token");

			const method = product ? "put" : "post";
			const url = product ? `${API_URL}/${product.productId}` : API_URL;

			axios[method](url, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
				.then((res) => {
					if (product) {
						setProducts((prev) =>
							prev.map((p) => (p.id === product.productId ? res.data : p))
						);
					} else {
						setProducts((prev) => [...prev, res.data]);
					}
					onClose();
				})
				.catch((err) => console.error("Submit failed:", err));
		};

		// This is the part where it allows adding of products.
		return (
			<div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen">
				{/* Overlay with blur and dark background */}
				<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

				{/* Modal content */}
				<div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl p-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">
						{product ? "Edit Product" : "Add New Product"}
					</h2>

					<form onSubmit={handleSubmit} className="space-y-4">
						<InputField
							label="Product Name"
							value={formData.name}
							onChange={(val) => setFormData({ ...formData, name: val })}
						/>

						<div className="grid grid-cols-2 gap-4">
							<InputField
								label="Production Date"
								type="date"
								value={formData.productionDate}
								onChange={(val) =>
									setFormData({ ...formData, productionDate: val })
								}
							/>
							<InputField
								label="Expiry Date"
								type="date"
								value={formData.expiryDate}
								onChange={(val) =>
									setFormData({ ...formData, expiryDate: val })
								}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<InputField
								label="Category"
								value={formData.category}
								onChange={(val) => setFormData({ ...formData, category: val })}
							/>
							<InputField
								type="number"
								label="Price (ETB)"
								value={formData.price}
								onChange={(val) =>
									setFormData({ ...formData, price: parseFloat(val) })
								}
							/>
						</div>

						<InputField
							type="number"
							label="Quantity"
							value={formData.quantity}
							onChange={(val) =>
								setFormData({ ...formData, quantity: parseInt(val) })
							}
						/>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Description
							</label>
							<textarea
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={3}
								className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div className="flex justify-end space-x-3 pt-6">
							<button
								type="button"
								onClick={onClose}
								className="px-6 py-3 rounded-xl border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-200 shadow-sm transform hover:scale-105"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
							>
								{product ? "Update" : "Add"} Product
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-8 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Products</h1>
					<p className="text-gray-600 mt-1">
						Manage your product inventory and catalog
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
				>
					<Plus className="w-5 h-5" />
					<span className="font-medium">Add products</span>
				</button>
			</div>

			{/* Search and Filters */}
			<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search products..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
						/>
					</div>

					<div className="flex items-center space-x-4">
						<select
							value={filterCategory}
							onChange={(e) => setFilterCategory(e.target.value)}
							className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
						>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category === "all" ? "All Categories" : category}
								</option>
							))}
						</select>

						<button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
							<Filter className="w-4 h-4" />
							<span>Filter</span>
						</button>
					</div>
				</div>
			</div>

			{/* Stats Summary */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
							<Package className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Total Products</p>
							<p className="text-2xl font-bold text-gray-900">
								{products.length}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-green-100 text-green-600 rounded-xl">
							<TrendingUp className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-600">In Stock</p>
							<p className="text-2xl font-bold text-gray-900">
								{products.filter((p) => p.quantity > 0).length}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-red-100 text-red-600 rounded-xl">
							<Star className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Low Stock</p>
							<p className="text-2xl font-bold text-gray-900">
								{products.filter((p) => p.quantity <= 10).length}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Products Table */}
			<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th
									className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center space-x-1">
										<span>Name</span>
										{sortField === "name" && (
											<span className="text-blue-600">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</th>
								<th
									className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
									onClick={() => handleSort("expiryDate")}
								>
									<div className="flex items-center space-x-1">
										<span>Expiry</span>
										{sortField === "name" && (
											<span className="text-blue-600">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</th>
								<th
									className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
									onClick={() => handleSort("productionDate")}
								>
									<div className="flex items-center space-x-1">
										<span>Production</span>
										{sortField === "name" && (
											<span className="text-blue-600">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</th>
								<th
									className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
									onClick={() => handleSort("category")}
								>
									<div className="flex items-center space-x-1">
										<span>Category</span>
										{sortField === "category" && (
											<span className="text-blue-600">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</th>
								<th
									className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
									onClick={() => handleSort("price")}
								>
									<div className="flex items-center space-x-1">
										<span>Price</span>
										{sortField === "price" && (
											<span className="text-blue-600">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</th>
								<th
									className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
									onClick={() => handleSort("quantity")}
								>
									<div className="flex items-center space-x-1">
										<span>Quantity</span>
										{sortField === "quantity" && (
											<span className="text-blue-600">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</th>
								<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredProducts.map((product) => (
								<tr
									key={product.productId}
									className="hover:bg-gray-50 transition-colors duration-200"
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="font-semibold text-gray-900">
											{product.name}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
										{product.productionDate}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
										{product.expiryDate}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
											{product.category}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
										{product.price} ETB
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getQuantityStatusColor(
												product.quantity
											)}`}
										>
											{product.quantity}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm">
										<div className="flex items-center justify-end space-x-2">
											<button
												onClick={() => setEditingProduct(product)}
												className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
											>
												<Edit className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleDelete(product.productId)}
												className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{filteredProducts.length === 0 && (
					<div className="text-center py-12">
						<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-500 text-lg">No products found</p>
						<p className="text-gray-400">
							Try adjusting your search or filters
						</p>
					</div>
				)}
			</div>

			{/* Low Stock Alert */}
			{products.some((p) => p.quantity <= 10) && (
				<div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
					<div className="flex items-start space-x-4">
						<div className="flex-shrink-0">
							<div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
								<Star className="w-6 h-6 text-red-600" />
							</div>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-red-800 mb-1">
								Alerts
							</h3>
							<p className="text-red-700 mb-3">Low stock for product C</p>
							<button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium">
								View Details
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modals */}
			{showAddModal && <ProductModal onClose={() => setShowAddModal(false)} />}

			{editingProduct && (
				<ProductModal
					product={editingProduct}
					onClose={() => setEditingProduct(null)}
				/>
			)}
		</div>
	);
};

export default Products;
