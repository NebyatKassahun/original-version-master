import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../Utils/baseApi";
import { Plus, Menu } from "lucide-react";

const API_URL = getBaseUrl() + "/api/categories";
const PAGINATED_API_URL = getBaseUrl() + "/api/categories/paginated";

const Category = () => {
	// Form states
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Categories list states
	const [categories, setCategories] = useState([]);
	const [categoriesLoading, setCategoriesLoading] = useState(true);
	const [categoriesError, setCategoriesError] = useState("");

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	// Fetch categories on component mount
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const token = localStorage.getItem("token");

				// Try paginated endpoint first
				let response = await fetch(
					`${PAGINATED_API_URL}?page=${currentPage}&limit=${pageSize}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				// If paginated endpoint fails, fall back to regular endpoint
				if (!response.ok) {
					console.log("Paginated endpoint failed, trying regular endpoint...");
					response = await fetch(API_URL, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						const errorText = await response.text();
						console.error("API Error Response:", errorText);
						throw new Error(
							`Failed to fetch categories: ${response.status} ${response.statusText}`
						);
					}
				}

				const data = await response.json();
				console.log("API Response:", data); // Debug log
				console.log("Data type:", typeof data);
				console.log("Data keys:", data ? Object.keys(data) : "No data");

				// Ensure categories is always an array
				let categoriesArray = [];
				if (Array.isArray(data.categories)) {
					categoriesArray = data.categories;
				} else if (Array.isArray(data.items)) {
					categoriesArray = data.items;
				} else if (Array.isArray(data)) {
					categoriesArray = data;
				} else if (data && typeof data === "object") {
					// If data is an object, look for common property names
					if (Array.isArray(data.data)) {
						categoriesArray = data.data;
					} else if (Array.isArray(data.result)) {
						categoriesArray = data.result;
					} else if (Array.isArray(data.categories)) {
						categoriesArray = data.categories;
					} else if (Array.isArray(data.items)) {
						categoriesArray = data.items;
					} else {
						// If it's an object but no array found, try to convert it
						console.log("Data object keys:", Object.keys(data));
						// Look for any array property
						for (const key in data) {
							if (Array.isArray(data[key])) {
								categoriesArray = data[key];
								break;
							}
						}
					}
				}

				console.log("Categories array:", categoriesArray); // Debug log

				setCategories(categoriesArray);

				// If using regular endpoint, calculate pagination manually
				if (categoriesArray.length > 0 && !data.totalPages) {
					setTotalPages(1); // Single page for regular endpoint
					setTotalItems(categoriesArray.length);
				} else {
					setTotalPages(
						data.totalPages ||
							Math.ceil((data.total || data.count || 0) / pageSize)
					);
					setTotalItems(data.total || data.count || 0);
				}
			} catch (err) {
				console.error("Error fetching categories:", err);
				setCategoriesError(err.message);
				setCategories([]); // Ensure categories is an empty array on error
			} finally {
				setCategoriesLoading(false);
			}
		};

		fetchCategories();
	}, [currentPage, pageSize]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!name || !description) {
			setError("Both fields are required.");
			return;
		}

		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name, description }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || "Failed to add category.");
			}

			// const newCategory = await res.json();
			// Refresh the current page to show the new category
			setCurrentPage(1);
			setSuccess("Category added successfully!");
			setName("");
			setDescription("");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this category?"))
			return;

		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error("Failed to delete category");
			}

			// Refresh the current page after deletion
			// If we're on the last page and it becomes empty, go to previous page
			if (categories.length === 1 && currentPage > 1) {
				setCurrentPage(currentPage - 1);
			}
			setSuccess("Category deleted successfully!");
			// setSuccess("");
		} catch (err) {
			setError(err.message);
			// setTimeout(3000);
			// setError("");
		}
	};

	return (
		<div className="space-y-6 min-h-full p-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">
					Category Management
				</h1>
				<p className="text-gray-600 mt-1">
					Manage your Category, add new ones, edit existing details, or delete
					them as needed.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Add Category Form */}
				<div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-800">
							<span className="inline-flex items-center bg-blue-100 text-blue-600 px-2 py-2 rounded-md mr-2">
								<Plus className="w-4 h-4" />
							</span>
							Create New Category
						</h2>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
								<div className="flex items-center">
									<svg
										className="w-5 h-5 mr-2"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
									<span>{error}</span>
								</div>
							</div>
						)}

						{success && (
							<div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
								<div className="flex items-center">
									<svg
										className="w-5 h-5 mr-2"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									<span>{success}</span>
								</div>
							</div>
						)}

						<div className="space-y-6">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Category Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									placeholder="e.g. Electronics, Clothing"
								/>
							</div>

							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Description
								</label>
								<textarea
									id="description"
									name="description"
									required
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									placeholder="Brief description of the category"
									rows={3}
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
									loading
										? "bg-gray-400 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
								}`}
							>
								{loading ? (
									<span className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Processing...
									</span>
								) : (
									"Add Category"
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Categories List */}
				<div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-800">
							<span className="inline-flex items-center bg-blue-100 text-blue-600 px-2 py-2 rounded-md mr-2">
								<Menu className="w-4 h-4" />
							</span>
							Existing Categories
						</h2>
						<div className="flex items-center space-x-4">
							<span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
								{totalItems || 0} total items
							</span>
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value));
									setCurrentPage(1);
								}}
								className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
							>
								<option value={5}>5 per page</option>
								<option value={10}>10 per page</option>
								<option value={20}>20 per page</option>
								<option value={50}>50 per page</option>
							</select>
						</div>
					</div>

					{categoriesLoading ? (
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
						</div>
					) : categoriesError ? (
						<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
							{categoriesError}
						</div>
					) : !Array.isArray(categories) || categories.length === 0 ? (
						<div className="text-center py-12">
							<svg
								className="mx-auto h-12 w-12 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								No categories
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Get started by creating a new category
							</p>
							{/* Debug info */}
							<div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
								<p>Debug Info:</p>
								<p>Categories type: {typeof categories}</p>
								<p>
									Categories length:{" "}
									{Array.isArray(categories) ? categories.length : "N/A"}
								</p>
								<p>Total Items: {totalItems}</p>
								<p>Current Page: {currentPage}</p>
								<p>Page Size: {pageSize}</p>
							</div>
						</div>
					) : (
						<>
							<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
								{Array.isArray(categories) &&
									categories.map((category) => (
										<div
											key={
												category?._id || category?.id || category?.categoryId
											}
											className="group relative p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1 min-w-0">
													<h3 className="text-lg font-medium text-gray-800 truncate">
														{category.name}
													</h3>
													{category.description && (
														<p className="mt-1 text-sm text-gray-600">
															{category.description}
														</p>
													)}
												</div>
												<button
													onClick={() =>
														handleDelete(
															category?._id ||
																category?.id ||
																category?.categoryId
														)
													}
													className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
													title="Delete category"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</div>
									))}
							</div>

							{/* Pagination Controls */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
									<div className="text-sm text-gray-600">
										Showing {(currentPage - 1) * pageSize + 1} to{" "}
										{Math.min(currentPage * pageSize, totalItems)} of{" "}
										{totalItems} results
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() =>
												setCurrentPage(Math.max(1, currentPage - 1))
											}
											disabled={currentPage === 1}
											className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											Previous
										</button>

										{/* Page Numbers */}
										<div className="flex items-center space-x-1">
											{Array.from(
												{ length: Math.min(5, totalPages) },
												(_, i) => {
													const pageNum =
														Math.max(
															1,
															Math.min(totalPages - 4, currentPage - 2)
														) + i;
													return (
														<button
															key={pageNum}
															onClick={() => setCurrentPage(pageNum)}
															className={`px-3 py-1 text-sm rounded-lg ${
																currentPage === pageNum
																	? "bg-blue-600 text-white"
																	: "border border-gray-300 hover:bg-gray-50"
															}`}
														>
															{pageNum}
														</button>
													);
												}
											)}
										</div>

										<button
											onClick={() =>
												setCurrentPage(Math.min(totalPages, currentPage + 1))
											}
											disabled={currentPage === totalPages}
											className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											Next
										</button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Category;
