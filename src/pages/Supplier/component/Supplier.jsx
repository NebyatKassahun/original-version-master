import React, { useState, useEffect } from "react";
import { getBaseUrl } from "../../../Utils/baseApi";
import { Edit, Trash2 } from "lucide-react";

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
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [editId, setEditId] = useState(null);
	const [editSupplier, setEditSupplier] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});

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
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
			<div className="bg-white rounded-xl shadow-lg p-6">
				{error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
				{success && (
					<div className="mb-4 text-green-600 font-medium">{success}</div>
				)}

				<form
					onSubmit={handleAddSupplier}
					className="flex flex-col md:flex-row gap-4 mb-6"
				>
					<input
						name="firstName"
						placeholder="First Name"
						value={newSupplier.firstName}
						onChange={handleChange}
						required
						className="border px-3 py-2 rounded-lg flex-1"
					/>
					<input
						name="lastName"
						placeholder="Last Name"
						value={newSupplier.lastName}
						onChange={handleChange}
						required
						className="border px-3 py-2 rounded-lg flex-1"
					/>
					<input
						name="email"
						type="email"
						placeholder="Email"
						value={newSupplier.email}
						onChange={handleChange}
						required
						className="border px-3 py-2 rounded-lg flex-1"
					/>
					<input
						name="phone"
						placeholder="Phone"
						value={newSupplier.phone}
						onChange={handleChange}
						required
						className="border px-3 py-2 rounded-lg flex-1"
					/>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
						disabled={loading}
					>
						{loading ? "Adding..." : "Add Supplier"}
					</button>
				</form>

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
									{editId === id ? (
										<>
											<td>
												<input
													name="firstName"
													value={editSupplier.firstName}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded"
												/>
											</td>
											<td>
												<input
													name="lastName"
													value={editSupplier.lastName}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded"
												/>
											</td>
											<td>
												<input
													name="email"
													value={editSupplier.email}
													onChange={handleEditChange}
													readOnly
													className="border px-2 py-1 rounded"
												/>
											</td>
											<td>
												<input
													name="phone"
													value={editSupplier.phone}
													onChange={handleEditChange}
													className="border px-2 py-1 rounded"
												/>
											</td>
											<td className="space-x-2">
												<button
													onClick={() => handleEditSave(id)}
													className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
													disabled={loading}
												>
													Save
												</button>
												<button
													onClick={() => setEditId(null)}
													className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
													disabled={loading}
												>
													Cancel
												</button>
											</td>
										</>
									) : (
										<>
											<td>{s.firstName}</td>
											<td>{s.lastName}</td>
											<td>{s.email}</td>
											<td>{s.phone}</td>
											<td>
												<div className="flex items-center space-x-2">
													<button
														onClick={() => handleEditClick(s)}
														className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
														disabled={loading}
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDelete(id)}
														className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
														disabled={loading}
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</>
									)}
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
			</div>
		</div>
	);
};

export default Supplier;
