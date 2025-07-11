import React, { useState, useEffect } from "react";
import axios from "axios";
import { getBaseUrl } from "../../../Utils/baseApi";
import { getFullImageUrl, handleImageError, validateImageFile } from "../../../Utils/imageUtils";
import { uploadProductImage, createProductWithImage } from "../../../Utils/uploadUtils";
import {
	Search,
	Plus,
	// Edit,
	// Trash2,
	// Filter,
	Star,
	TrendingUp,
	Package,
	AlertTriangle,
	Eye,
	Upload,
	Image as ImageIcon,
} from "lucide-react";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

const API_URL = getBaseUrl() + "/api/product/";

const normalizeImageUrl = (url) => {
  if (!url) return "";
  // Remove any double slashes except after http(s):
  return url.replace(/([^:]\/)\/+/, "$1/");
};

const Products = () => {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [sortField, setSortField] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");
	const [filterCategory, setFilterCategory] = useState("all");
	const [viewingProductId, setViewingProductId] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("token");
				const headers = {
					Authorization: `Bearer ${token}`,
				};

				// Fetch products
				const productsRes = await axios.get(API_URL, { headers });
				setProducts(productsRes.data);

				// Fetch categories
				const categoriesRes = await axios.get(`${getBaseUrl()}/api/categories`, { headers });
				const categoriesData = categoriesRes.data;
				
				// Handle different response formats
				const categoriesArray = Array.isArray(categoriesData) ? categoriesData : 
					Array.isArray(categoriesData.categories) ? categoriesData.categories :
					Array.isArray(categoriesData.items) ? categoriesData.items :
					Array.isArray(categoriesData.data) ? categoriesData.data : [];

				if (categoriesArray.length === 0) {
					// Redirect to Category page if no categories exist
					navigate("/category");
					return;
				}

				setCategories(categoriesArray);
			} catch (err) {
				console.error("Failed to fetch data:", err);
				// If categories fetch fails, redirect to Category page
				navigate("/category");
			}
		};

		fetchData();
	}, [navigate]);

	const filteredProducts = products
		.filter((product) => {
			const matchesSearch =
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(product.category?.name || product.category).toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCategory =
				filterCategory === "all" || (product.category?.name || product.category) === filterCategory;

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
			salePrice: product?.salePrice || product?.price || 0,
			purchasePrice: product?.purchasePrice || 0,
			categoryId: product?.category?.categoryId || product?.categoryId || "",
			quantity: product?.quantity || 0,
			description: product?.description || "",
		});
		const [imageFile, setImageFile] = useState(null);
		const [imagePreview, setImagePreview] = useState(() => {
			return normalizeImageUrl(getFullImageUrl(product?.imageUrl));
		});
		const [uploading, setUploading] = useState(false);

		const handleImageChange = (e) => {
			const file = e.target.files[0];
			if (file) {
				// Validate the file
				const validation = validateImageFile(file);
				if (!validation.isValid) {
					alert(validation.error);
					return;
				}
				
				setImageFile(file);
				const reader = new FileReader();
				reader.onload = (e) => setImagePreview(e.target.result);
				reader.readAsDataURL(file);
			}
		};

		const handleSubmit = async (e) => {
			e.preventDefault();
			setUploading(true);

			try {
				const productData = {
					...formData,
					salePrice: Number(formData.salePrice),
					purchasePrice: Number(formData.purchasePrice),
					quantity: Number(formData.quantity),
					categoryId: formData.categoryId,
				};

				let result;
				
				if (product) {
					// Update existing product
					const token = localStorage.getItem("token");
					
					// If there's an image to upload, handle it first
					if (imageFile) {
						try {
							const imageUrl = await uploadProductImage(imageFile, product.productId);
							productData.imageUrl = imageUrl;
						} catch (uploadError) {
							console.error('Image upload failed:', uploadError);
							alert('Product updated but image upload failed. You can update the image later.');
						}
					}

					// Update the product
					const res = await axios.put(`${API_URL}${product.productId}`, productData, {
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					});
					result = res.data;
					setProducts((prev) =>
						prev.map((p) =>
							p.productId === product.productId ? result : p
						)
					);
				} else {
					// Create new product
					if (imageFile) {
						// Create product with image
						result = await createProductWithImage(imageFile, productData);
					} else {
						// Create product without image
						const token = localStorage.getItem("token");
						const res = await axios.post(API_URL, productData, {
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
						});
						result = res.data;
					}
					setProducts((prev) => [...prev, result]);
				}
				
				onClose();
			} catch (err) {
				console.error("Submit failed:", err);
				alert("Failed to save product. Please try again.");
			} finally {
				setUploading(false);
			}
		};

		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
				{/* Modal content */}
				<div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl p-6 z-60">
					<button
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
						onClick={onClose}
					>
						&times;
					</button>
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
								label="Sale Price (ETB)"
								type="number"
								value={formData.salePrice}
								onChange={(val) =>
									setFormData({ ...formData, salePrice: val })
								}
							/>
							<InputField
								label="Purchase Price (ETB)"
								type="number"
								value={formData.purchasePrice}
								onChange={(val) =>
									setFormData({ ...formData, purchasePrice: val })
								}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Category
								</label>
								<select
									value={formData.categoryId}
									onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								>
									<option value="">Select a category</option>
									{categories.map((category) => (
										<option key={category.categoryId || category.id} value={category.categoryId || category.id}>
											{category.name}
										</option>
									))}
								</select>
							</div>
							<InputField
								type="number"
								label="Quantity"
								value={formData.quantity}
								onChange={(val) =>
									setFormData({ ...formData, quantity: parseInt(val) })
								}
							/>
						</div>

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

						{/* Image Upload Section */}
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Product Image
							</label>
							<div className="space-y-4">
								{/* Image Preview */}
								{imagePreview && (
									<div className="relative">
										<img
											src={normalizeImageUrl(imagePreview)}
											alt="Product preview"
											className="w-32 h-32 object-cover rounded-lg border border-gray-300"
											onError={(e) => handleImageError(e, 'Preview failed')}
										/>
										<button
											type="button"
											onClick={() => {
												setImagePreview("");
												setImageFile(null);
											}}
											className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
										>
											×
										</button>
									</div>
								)}
								
								{/* File Input */}
								<div className="flex items-center justify-center w-full">
									<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<Upload className="w-8 h-8 mb-2 text-gray-500" />
											<p className="mb-2 text-sm text-gray-500">
												<span className="font-semibold">Click to upload</span> or drag and drop
											</p>
											<p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
										</div>
										<input
											type="file"
											className="hidden"
											accept="image/*"
											onChange={handleImageChange}
										/>
									</label>
								</div>
							</div>
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
								disabled={uploading}
								className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105 disabled:opacity-50"
							>
								{uploading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Saving...</span>
									</>
								) : (
									<>
										<span>{product ? "Update" : "Add"} Product</span>
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	};

	// Out of stock count
	const outOfStock = products.filter((item) => item.quantity === 0).length;

	return (
		<div className="space-y-8 min-h-full p-6">
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
							<option value="all">All Categories</option>
							{categories.map((category) => (
								<option key={category.categoryId || category.id} value={category.name}>
									{category.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Stats Summary */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
								{
									products.filter((p) => p.quantity <= 10 && p.quantity > 0)
										.length
								}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
							<AlertTriangle className="w-6 h-6" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Out of Stock</p>
							<p className="text-2xl font-bold text-gray-900">{outOfStock}</p>
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
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Product
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
									onClick={() => handleSort("salePrice")}
								>
									<div className="flex items-center space-x-1">
										<span>Sale Price</span>
										{sortField === "salePrice" && (
											<span className="text-blue-600">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</th>
								<th
									className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
									onClick={() => handleSort("purchasePrice")}
								>
									<div className="flex items-center space-x-1">
										<span>Purchase Price</span>
										{sortField === "purchasePrice" && (
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
										<div className="flex items-center space-x-3">
											{/* Product Image */}
											<div className="flex-shrink-0">
																							{product.imageUrl ? (
												<img
													src={normalizeImageUrl(getBaseUrl().replace(/\/$/, '') + product.imageUrl)}
													alt={product.name}
													className="w-12 h-12 rounded-lg object-cover border border-gray-200"
													onError={(e) => handleImageError(e, '')}
												/>
											) : null}
											{!product.imageUrl && (
												<div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
													<ImageIcon className="w-6 h-6 text-gray-400" />
												</div>
											)}
											</div>
											<div>
												<div className="font-semibold text-gray-900">
													{product.name}
												</div>
												<div className="text-sm text-gray-500">
													{product.description?.substring(0, 50)}
													{product.description?.length > 50 && "..."}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
											{product.category?.name || product.category}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
										{product.salePrice || product.price} ETB
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
										{product.purchasePrice || 0} ETB
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
												onClick={() => setViewingProductId(product.productId)}
												className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
											>
												<Eye className="w-4 h-4" />
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

			{/* Modals */}
			{showAddModal && <ProductModal onClose={() => setShowAddModal(false)} />}

			{editingProduct && (
				<ProductModal
					product={editingProduct}
					onClose={() => setEditingProduct(null)}
				/>
			)}

			{viewingProductId && (
				<ProductCard
					productId={viewingProductId}
					onClose={() => setViewingProductId(null)}
				/>
			)}
		</div>
	);
};

export default Products;
