import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import { Plus, Trash2 } from "lucide-react";

const SaleAddModal = ({ isOpen, onClose, onSuccess }) => {
	const [form, setForm] = useState({
		customerId: "",
		productSales: [
			{
				productId: "",
				saleQuantity: "",
				salePrice: "",
			},
		],
	});
	const [products, setProducts] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (isOpen) {
			fetchData();
		}
	}, [isOpen]);

	const fetchData = async () => {
		try {
			const token = localStorage.getItem("token");
			const headers = token ? { Authorization: `Bearer ${token}` } : {};

			// Fetch products
			const productsRes = await fetch(getBaseUrl() + "/api/product", { headers });
			const productsData = await productsRes.json();
			setProducts(Array.isArray(productsData) ? productsData : []);

			// Fetch customers
			const customersRes = await fetch(getBaseUrl() + "/api/customers", { headers });
			const customersData = await customersRes.json();
			setCustomers(Array.isArray(customersData) ? customersData : []);
		} catch (err) {
			console.error("Error fetching data:", err);
		}
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleProductSaleChange = (index, field, value) => {
		const updatedProductSales = [...form.productSales];
		updatedProductSales[index] = {
			...updatedProductSales[index],
			[field]: value,
		};
		setForm({ ...form, productSales: updatedProductSales });
	};

	const addProductSale = () => {
		setForm({
			...form,
			productSales: [
				...form.productSales,
				{
					productId: "",
					saleQuantity: "",
					salePrice: "",
				},
			],
		});
	};

	const removeProductSale = (index) => {
		if (form.productSales.length > 1) {
			const updatedProductSales = form.productSales.filter((_, i) => i !== index);
			setForm({ ...form, productSales: updatedProductSales });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Validate product sales and customer
		const isValid =
			form.customerId &&
			form.productSales.every(
				(ps) => ps.productId && ps.saleQuantity && ps.salePrice
			);

		if (!isValid) {
			setError("Customer and all product fields are required.");
			return;
		}

		// New: Validate saleQuantity does not exceed stock
		for (const ps of form.productSales) {
			const product = products.find((p) => p.productId === ps.productId);
			if (product && Number(ps.saleQuantity) > product.quantity) {
				setError(`Cannot sell more than available stock for ${product.name}. Available: ${product.quantity}`);
				return;
			}
		}

		setLoading(true);
		setError("");

		try {
			const token = localStorage.getItem("token");
			const userId = localStorage.getItem("userId");

			const saleData = {
				productSales: form.productSales.map((ps) => ({
					productId: ps.productId,
					saleQuantity: Number(ps.saleQuantity),
					salePrice: Number(ps.salePrice),
				})),
				customerId: form.customerId,
				createdBy: userId || 1,
			};

			const res = await fetch(getBaseUrl() + "/api/sales", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(saleData),
			});

			if (!res.ok) {
				const errorText = await res.text();
				console.error("Add Sale Error:", errorText);
				throw new Error("Failed to add sale");
			}

			const added = await res.json();
			console.log("Added sale:", added);

			setSuccess("Sale created successfully!");
			resetForm();
			onSuccess(); // Refresh the parent component
		} catch (err) {
			console.error("Error adding sale:", err);
			setError("Could not add sale. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setForm({
			customerId: "",
			productSales: [
				{
					productId: "",
					saleQuantity: "",
					salePrice: "",
				},
			],
		});
		setError("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
			<div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto z-60">
				<div className="p-8 relative">
					<button
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
						onClick={resetForm}
					>
						&times;
					</button>
					<h2 className="text-2xl font-bold mb-6 text-gray-800">
						Add New Sale
					</h2>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Customer Selection */}
						<div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Customer Information
							</h3>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Customer
								</label>
								<select
									name="customerId"
									value={form.customerId}
									onChange={handleChange}
									className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
									required
								>
									<option value="">Select a customer</option>
									{customers.map((customer) => (
										<option key={customer.customerId} value={customer.customerId}>
											{customer.firstName} {customer.lastName} - {customer.email}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Products Section */}
						<div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Products
							</h3>
							{form.productSales.map((productSale, index) => (
								<div
									key={index}
									className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-gray-800">
											Product {index + 1}
										</h3>
										{form.productSales.length > 1 && (
											<button
												type="button"
												onClick={() => removeProductSale(index)}
												className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Product
											</label>
											<select
												value={productSale.productId}
												onChange={(e) =>
													handleProductSaleChange(
														index,
														"productId",
														e.target.value
													)
												}
												className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
												required
											>
												<option value="">Select a product</option>
												{products.map((product) => (
													<option
														key={product.productId}
														value={product.productId}
													>
														{product.name} - ${product.price} (Stock:{" "}
														{product.quantity})
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Quantity
											</label>
											<input
												type="number"
												value={productSale.saleQuantity}
												onChange={(e) =>
													handleProductSaleChange(
														index,
														"saleQuantity",
														e.target.value
													)
												}
												placeholder="Quantity"
												className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
												required
												min="1"
												max={
													products.find((p) => p.productId === productSale.productId)?.quantity || undefined
												}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Sale Price
											</label>
											<input
												type="number"
												value={productSale.salePrice}
												onChange={(e) =>
													handleProductSaleChange(
														index,
														"salePrice",
														e.target.value
													)
												}
												placeholder="Sale Price"
												className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
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
						</div>

						<div className="flex gap-2 mt-6">
							<button
								type="submit"
								disabled={loading}
								className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
							>
								{loading ? "Creating..." : "Create Sale"}
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
		</div>
	);
};

export default SaleAddModal; 