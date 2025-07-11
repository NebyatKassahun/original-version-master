import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import { Edit, Trash2, Plus } from "lucide-react";

const API_URL = getBaseUrl() + "/api/customers";

const Customers = () => {
	const [customers, setCustomers] = useState([]);
	const [newCustomer, setNewCustomer] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [editId, setEditId] = useState(null);
	const [editCustomer, setEditCustomer] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState(null);

	// Fetch customers from API
	useEffect(() => {
		const fetchCustomers = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(API_URL, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				if (!res.ok) throw new Error("Failed to fetch customers");
				const data = await res.json();
				setCustomers((data.customers || data).filter((c) => !c.isDeleted));
			} catch {
				setError("Could not load customers.");
			} finally {
				setLoading(false);
			}
		};
		fetchCustomers();
	}, []);

	const handleChange = (e) => {
		setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
	};

	const handleAddCustomer = async (e) => {
		e.preventDefault();
		if (
			!newCustomer.firstName ||
			!newCustomer.lastName ||
			!newCustomer.email ||
			!newCustomer.phone
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
				body: JSON.stringify(newCustomer),
			});
			if (!res.ok) throw new Error("Failed to add customer");
			const added = await res.json();
			setCustomers([...customers, added.customer || added]);
			setNewCustomer({
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
			});
			setShowAddModal(false);
		} catch {
			setError("Could not add customer.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (customerId) => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}/${customerId}`, {
				method: "DELETE",
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			if (!res.ok) {
				const errText = await res.text();
				console.error("Delete failed:", errText);
				throw new Error("Failed to delete customer");
			}
			setCustomers(customers.filter((c) => c.customerId !== customerId));
		} catch {
			setError("Could not delete customer.");
		} finally {
			setLoading(false);
		}
	};

	const handleEditClick = (customer) => {
		setEditId(customer.customerId);
		setEditCustomer({
			firstName: customer.firstName,
			lastName: customer.lastName,
			email: customer.email,
			phone: customer.phone,
		});
		setShowEditModal(true);
	};

	const handleEditChange = (e) => {
		setEditCustomer({ ...editCustomer, [e.target.name]: e.target.value });
	};

	const handleEditSave = async (id) => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(editCustomer),
			});
			if (!res.ok) throw new Error("Failed to update customer");
			const updated = await res.json();
			setCustomers((prev) =>
				prev.map((c) => (c.customerId === id ? updated.customer || updated : c))
			);
			setEditId(null);
			setShowEditModal(false);
		} catch {
			setError("Could not update customer.");
		} finally {
			setLoading(false);
		}
	};

	const handleEditCancel = () => {
		setEditId(null);
		setShowEditModal(false);
	};

	return (
		<div className="space-y-6 relative min-h-full p-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
				<p className="text-gray-600 mt-1">
					Manage your customers, add new ones, edit existing details, or delete
					them as needed.
				</p>
			</div>

			{/* Add Customer Button */}
			<button
				onClick={() => setShowAddModal(true)}
				className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
			>
				<Plus className="w-5 h-5" />
				Add Customer
			</button>

			{/* Modal Backdrop */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
					{/* Modal Content */}
					<div className="bg-white rounded-xl shadow-xl w-full max-w-md z-60">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">Add New Customer</h2>
								<button
									onClick={() => setShowAddModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									✕
								</button>
							</div>

							{error && (
								<div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
									{error}
								</div>
							)}

							<form onSubmit={handleAddCustomer} className="space-y-4">
								<div className="space-y-4">
									<input
										type="text"
										name="firstName"
										value={newCustomer.firstName}
										onChange={handleChange}
										placeholder="First Name"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="text"
										name="lastName"
										value={newCustomer.lastName}
										onChange={handleChange}
										placeholder="Last Name"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="email"
										name="email"
										value={newCustomer.email}
										onChange={handleChange}
										placeholder="Email"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="text"
										name="phone"
										value={newCustomer.phone}
										onChange={handleChange}
										placeholder="Phone"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
								</div>
								<div className="flex justify-end gap-3 pt-2">
									<button
										type="button"
										onClick={() => setShowAddModal(false)}
										className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
										disabled={loading}
									>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Processing...</span>
											</>
										) : (
											"Add Customer"
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Edit Customer Modal */}
			{showEditModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
					tabIndex={-1}
					onKeyDown={(e) => {
						if (e.key === "Escape") handleEditCancel();
					}}
				>
					<div className="bg-white rounded-xl shadow-xl w-full max-w-md z-60 animate-fadeInScale">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">Edit Customer</h2>
								<button
									onClick={handleEditCancel}
									className="text-gray-500 hover:text-gray-700"
								>
									✕
								</button>
							</div>
							{error && (
								<div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
									{error}
								</div>
							)}
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleEditSave(editId);
								}}
								className="space-y-4"
							>
								<div className="space-y-4">
									<input
										type="text"
										name="firstName"
										value={editCustomer.firstName}
										onChange={handleEditChange}
										placeholder="First Name"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="text"
										name="lastName"
										value={editCustomer.lastName}
										onChange={handleEditChange}
										placeholder="Last Name"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="email"
										name="email"
										value={editCustomer.email}
										onChange={handleEditChange}
										placeholder="Email"
										className="border px-3 py-2 rounded-lg w-full"
										required
										readOnly
									/>
									<input
										type="text"
										name="phone"
										value={editCustomer.phone}
										onChange={handleEditChange}
										placeholder="Phone"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
								</div>
								<div className="flex justify-end gap-3 pt-2">
									<button
										type="button"
										onClick={handleEditCancel}
										className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
										disabled={loading}
									>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Saving...</span>
											</>
										) : (
											"Save Changes"
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeInScale">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-sm z-60 p-6">
						<div className="flex flex-col items-center">
							<div className="mb-4 text-2xl text-red-600">⚠️</div>
							<h3 className="text-lg font-semibold mb-2">Delete Customer?</h3>
							<p className="mb-4 text-gray-600 text-center">
								Are you sure you want to delete{" "}
								<span className="font-bold">
									{deleteTarget.firstName} {deleteTarget.lastName}
								</span>{" "}
								(<span className="text-gray-500">{deleteTarget.email}</span>)?
							</p>
							<div className="flex gap-3">
								<button
									onClick={() => setShowDeleteModal(false)}
									className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									onClick={async () => {
										setLoading(true);
										await handleDelete(deleteTarget.customerId);
										setShowDeleteModal(false);
										setLoading(false);
									}}
									className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
									disabled={loading}
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Deleting...</span>
										</>
									) : (
										"Delete"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Customers Table */}
			<div
				className={`bg-white rounded-xl shadow-lg p-6 ${
					showAddModal ? "blur-sm" : ""
				}`}
			>
				{loading ? (
					<div className="flex justify-center items-center min-h-[60vh]">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr>
								<th className="py-2">Name</th>
								<th className="py-2">Email</th>
								<th className="py-2">Phone</th>
								<th className="py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{customers.map((customer) => (
								<tr key={customer.customerId} className="border-t">
									<td className="py-2">
										{customer.firstName} {customer.lastName}
									</td>
									<td className="py-2">{customer.email}</td>
									<td className="py-2">{customer.phone}</td>
									<td className="py-2">
										<div className="flex items-center space-x-2">
											<button
												onClick={() => handleEditClick(customer)}
												className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 relative group"
												disabled={loading}
												aria-label="Edit"
											>
												<Edit className="w-4 h-4" />
												<span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
													Edit
												</span>
											</button>
											<button
												onClick={() => {
													setDeleteTarget(customer);
													setShowDeleteModal(true);
												}}
												className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 relative group"
												disabled={loading}
												aria-label="Delete"
											>
												<Trash2 className="w-4 h-4" />
												<span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
													Delete
												</span>
											</button>
										</div>
									</td>
								</tr>
							))}
							{customers.length === 0 && !loading && (
								<tr>
									<td colSpan={4} className="text-center text-gray-500 py-4">
										No customers found.
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

export default Customers;
