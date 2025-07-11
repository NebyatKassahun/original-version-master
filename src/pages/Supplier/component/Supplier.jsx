import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import { Edit, Trash2, Plus } from "lucide-react";

const SUPPLIER_API = getBaseUrl() + "/api/suppliers/";

const Supplier = () => {
	const [suppliers, setSuppliers] = useState([]);
	const [newSupplier, setNewSupplier] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [editId, setEditId] = useState(null);
	const [editSupplier, setEditSupplier] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	// 1. Add animation classes to modals
	// 2. Add Delete confirmation modal state
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState(null);

	// Helper: Safely get supplier ID
	const getSupplierId = (supplier) =>
		supplier._id || supplier.id || supplier.customerId;

	// Fetch suppliers
	const fetchSuppliers = async () => {
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(SUPPLIER_API, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			const data = await res.json();
			setSuppliers((data.suppliers || data).filter((s) => !s.isDeleted));
		} catch (err) {
			console.error(err);
			setError("Could not load suppliers.");
		} finally {
			setInitialLoading(false);
		}
	};

	useEffect(() => {
		fetchSuppliers();
	}, []);

	const handleChange = (e) => {
		setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
	};

	const handleEditChange = (e) => {
		setEditSupplier({ ...editSupplier, [e.target.name]: e.target.value });
	};

	const handleAddSupplier = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

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

			await fetchSuppliers();
			setNewSupplier({ firstName: "", lastName: "", email: "", phone: "" });
			setShowAddModal(false);
			setSuccess("Supplier added successfully.");
		} catch (err) {
			console.error(err);
			setError("Could not add supplier.");
		} finally {
			setLoading(false);
		}
	};
	console.log("Sending:", {
		firstName: newSupplier.firstName,
		lastName: newSupplier.lastName,
		email: newSupplier.email,
		phone: newSupplier.phone,
		isSupplier: true,
	});

	const handleEditClick = (supplier) => {
		setEditId(getSupplierId(supplier));
		setEditSupplier({
			firstName: supplier.firstName,
			lastName: supplier.lastName,
			email: supplier.email,
			phone: supplier.phone,
		});
		setShowEditModal(true);
	};
	const handleEditCancel = () => {
		setEditId(null);
		setShowEditModal(false);
	};

	const handleEditSave = async (id) => {
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const token = localStorage.getItem("token");
			const { firstName, lastName, email, phone } = editSupplier;

			const res = await fetch(`${SUPPLIER_API}${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					firstName,
					lastName,
					email,
					phone,
					isSupplier: true,
				}),
			});

			if (!res.ok) {
				const backendError = await res.json();
				console.error("Backend error:", backendError);
				throw new Error("Failed to update supplier");
			}

			await fetchSuppliers();
			setEditId(null);
			setSuccess("Supplier updated successfully.");
		} catch (err) {
			console.error("Update failed:", err);
			setError("Could not update supplier.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${SUPPLIER_API}${id}`, {
				method: "DELETE",
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			if (!res.ok) throw new Error("Failed to delete supplier");

			await fetchSuppliers();
			setSuccess("Supplier deleted successfully.");
		} catch (err) {
			console.error(err);
			setError("Could not delete supplier.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6 min-h-full p-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Suppliers Management</h1>
				<p className="text-gray-600 mt-1">
					Manage your suppliers, add new ones, edit existing details, or delete
					them as needed.
				</p>
			</div>

			{/* Add Supplier Button */}
			<button
				onClick={() => setShowAddModal(true)}
				className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
			>
				<Plus className="w-5 h-5" />
				Add Supplier
			</button>

			{/* Modal Backdrop */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
					{/* Modal Content */}
					<div className="bg-white rounded-xl shadow-xl w-full max-w-md z-60">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">Add New Supplier</h2>
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

							<form onSubmit={handleAddSupplier} className="space-y-4">
								<div className="space-y-4">
									<input
										type="text"
										name="firstName"
										value={newSupplier.firstName}
										onChange={handleChange}
										placeholder="First Name"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="text"
										name="lastName"
										value={newSupplier.lastName}
										onChange={handleChange}
										placeholder="Last Name"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="email"
										name="email"
										value={newSupplier.email}
										onChange={handleChange}
										placeholder="Email"
										className="border px-3 py-2 rounded-lg w-full"
										required
									/>
									<input
										type="text"
										name="phone"
										value={newSupplier.phone}
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
												<span>Adding...</span>
											</>
										) : (
											"Add Supplier"
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Edit Supplier Modal */}
			{showEditModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') handleEditCancel(); }}>
					<div className="bg-white rounded-xl shadow-xl w-full max-w-md z-60 animate-fadeInScale">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">Edit Supplier</h2>
								<button onClick={handleEditCancel} className="text-gray-500 hover:text-gray-700">✕</button>
							</div>
							{error && (<div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>)}
							<form onSubmit={e => { e.preventDefault(); handleEditSave(editId); }} className="space-y-4">
								<div className="space-y-4">
									<input type="text" name="firstName" value={editSupplier.firstName} onChange={handleEditChange} placeholder="First Name" className="border px-3 py-2 rounded-lg w-full" required />
									<input type="text" name="lastName" value={editSupplier.lastName} onChange={handleEditChange} placeholder="Last Name" className="border px-3 py-2 rounded-lg w-full" required />
									<input type="email" name="email" value={editSupplier.email} onChange={handleEditChange} placeholder="Email" className="border px-3 py-2 rounded-lg w-full" required readOnly />
									<input type="text" name="phone" value={editSupplier.phone} onChange={handleEditChange} placeholder="Phone" className="border px-3 py-2 rounded-lg w-full" required />
								</div>
								<div className="flex justify-end gap-3 pt-2">
									<button type="button" onClick={handleEditCancel} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
									<button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2" disabled={loading}>{loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Saving...</span></>) : ("Save Changes")}</button>
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
							<h3 className="text-lg font-semibold mb-2">Delete Supplier?</h3>
							<p className="mb-4 text-gray-600 text-center">Are you sure you want to delete <span className="font-bold">{deleteTarget.firstName} {deleteTarget.lastName}</span> (<span className="text-gray-500">{deleteTarget.email}</span>)?</p>
							<div className="flex gap-3">
								<button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
								<button onClick={async () => { setLoading(true); await handleDelete(deleteTarget.id || deleteTarget.customerId || deleteTarget._id); setShowDeleteModal(false); setLoading(false); }} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2" disabled={loading}>{loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Deleting...</span></>) : ("Delete")}</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Suppliers Table */}
			<div className={`bg-white rounded-xl shadow-lg p-6 ${showAddModal ? "blur-sm" : ""}`}>
				{error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
				{success && (
					<div className="mb-4 text-green-600 font-medium">{success}</div>
				)}

				{initialLoading ? (
					<div className="flex justify-center items-center min-h-[60vh]">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : (
					<table className="w-full text-left">
					<thead>
						<tr>
							<th className="py-2">First Name</th>
							<th className="py-2">Last Name</th>
							<th className="py-2">Email</th>
							<th className="py-2">Phone</th>
							<th className="py-2">Action</th>
						</tr>
					</thead>
					<tbody>
						{suppliers.map((s) => {
							const id = getSupplierId(s);
							return (
								<tr key={id} className="border-t">
									<td>{s.firstName}</td>
									<td>{s.lastName}</td>
									<td>{s.email}</td>
									<td>{s.phone}</td>
									<td>
										<div className="flex items-center space-x-2">
											<button
												onClick={() => handleEditClick(s)}
												className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 relative group"
												disabled={loading}
												aria-label="Edit"
											>
												<Edit className="w-4 h-4" />
												<span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Edit</span>
											</button>
											<button
												onClick={() => { setDeleteTarget(s); setShowDeleteModal(true); }}
												className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 relative group"
												disabled={loading}
												aria-label="Delete"
											>
												<Trash2 className="w-4 h-4" />
												<span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Delete</span>
											</button>
										</div>
									</td>
								</tr>
							);
						})}
						{suppliers.length === 0 && (
							<tr>
								<td colSpan={5} className="text-center text-gray-500 py-4">
									No suppliers found.
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

export default Supplier;
