import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getBaseUrl } from "../../../Utils/baseApi";

const Settings = () => {
	const [profile, setProfile] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		photo: null,
		photoURL: null,
		createdAt: "",
	});
	const [editMode, setEditMode] = useState(false);
	const [message, setMessage] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const fileInputRef = useRef(null);

	function getUserIdFromToken(token) {
		try {
			const base64Url = token.split(".")[1];
			const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
			const decoded = JSON.parse(atob(base64));
			return decoded?.userId;
		} catch {
			return null;
		}
	}

	// Fetch user data on mount
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const userId = getUserIdFromToken(token);
		if (!userId) return;
		axios
			.get(getBaseUrl() + `/api/users/${userId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				const {
					firstName,
					lastName,
					email,
					phone,
					profilePictureUrl,
					createdAt,
				} = res.data;
				setProfile({
					firstName: firstName || "",
					lastName: lastName || "",
					email: email || "",
					phone: phone || "",
					password: "",
					photo: null,
					photoURL:
						profilePictureUrl &&
						(profilePictureUrl.startsWith("http")
							? profilePictureUrl
							: getBaseUrl() + `${profilePictureUrl}`),
					createdAt: createdAt || "",
				});
			})
			.catch((err) => {
				setMessage("Failed to fetch user data.", err);
			});
	}, []);

	const handleChange = (e) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfile({
					...profile,
					photo: file,
					photoURL: reader.result,
				});
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSave = async (e) => {
		e.preventDefault();
		const token = localStorage.getItem("token");
		if (!token) {
			setMessage("Authentication error. Please login again.");
			return;
		}
		const userId = getUserIdFromToken(token);
		if (!userId) {
			setMessage("User ID not found. Please login again.");
			return;
		}
		if (!profile.firstName.trim() || !profile.lastName.trim()) {
			setMessage("First and last name are required.");
			return;
		}
		if (!profile.email) {
			setMessage("Email is required.");
			return;
		}
		if (!profile.phone) {
			setMessage("Phone is required.");
			return;
		}
		const formData = new FormData();
		formData.append("firstName", profile.firstName.trim());
		formData.append("lastName", profile.lastName.trim());
		formData.append("email", profile.email);
		formData.append("phone", profile.phone);
		if (profile.password) formData.append("password", profile.password);
		if (profile.photo) formData.append("profilePicture", profile.photo);
		try {
			const res = await axios.put(
				getBaseUrl() + `/api/users/${userId}`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);
			const updatedUser = res.data;
			setProfile((prev) => ({
				...prev,
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName,
				email: updatedUser.email,
				phone: updatedUser.phone,
				photoURL:
					updatedUser.profilePictureUrl &&
					(updatedUser.profilePictureUrl.startsWith("http")
						? updatedUser.profilePictureUrl
						: getBaseUrl() + `${updatedUser.profilePictureUrl}`),
				password: "",
				photo: null,
			}));
			setEditMode(false);
			setMessage("Profile updated successfully!");
		} catch (err) {
			setMessage("Update failed. Please try again.", err);
		}
	};

	const handlePhotoClick = () => {
		if (editMode && fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleRemovePhoto = () => {
		if (editMode) {
			setProfile({ ...profile, photo: null, photoURL: null });
		}
	};

	// Format date as YYYY-MM-DD
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		if (isNaN(d)) return dateStr;
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
			<div className="bg-white rounded-xl shadow-lg p-6">
				<h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
				{message && (
					<div className="mb-4 text-green-600 font-medium">{message}</div>
				)}
				<form onSubmit={handleSave} className="space-y-4 max-w-md">
					<div className="flex items-center space-x-4">
						<div
							className={`relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 ${
								editMode ? "border-blue-500" : "border-gray-300"
							}`}
							onClick={handlePhotoClick}
							title={editMode ? "Click to change photo" : ""}
							style={{ transition: "border 0.2s" }}
						>
							{profile.photoURL ? (
								<img
									src={profile.photoURL}
									alt="Profile"
									className="object-cover w-full h-full"
								/>
							) : (
								<span className="text-3xl text-gray-400">
									{profile.firstName ? profile.firstName[0] : "U"}
								</span>
							)}
							<input
								type="file"
								accept="image/*"
								ref={fileInputRef}
								style={{ display: "none" }}
								onChange={handlePhotoChange}
								disabled={!editMode}
							/>
							{editMode && profile.photoURL && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleRemovePhoto();
									}}
									className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
									title="Remove photo"
									tabIndex={-1}
								>
									×
								</button>
							)}
						</div>
						<div>
							<p className="text-sm text-gray-500">
								{editMode ? "Click photo to upload/change" : "Profile photo"}
							</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								First Name
							</label>
							<input
								type="text"
								name="firstName"
								value={profile.firstName}
								onChange={handleChange}
								disabled={!editMode}
								className="border px-3 py-2 rounded-lg w-full"
								autoComplete="off"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Last Name
							</label>
							<input
								type="text"
								name="lastName"
								value={profile.lastName}
								onChange={handleChange}
								disabled={!editMode}
								className="border px-3 py-2 rounded-lg w-full"
								autoComplete="off"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={profile.email}
							onChange={handleChange}
							disabled={!editMode}
							className="border px-3 py-2 rounded-lg w-full"
							autoComplete="off"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone
						</label>
						<input
							type="text"
							name="phone"
							value={profile.phone}
							onChange={handleChange}
							disabled={!editMode}
							className="border px-3 py-2 rounded-lg w-full"
							autoComplete="off"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								name="password"
								value={profile.password}
								onChange={handleChange}
								disabled={!editMode}
								className="border px-3 py-2 rounded-lg w-full pr-10"
								placeholder={editMode ? "Enter new password" : "********"}
								autoComplete="new-password"
							/>
							{editMode && (
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
									tabIndex={-1}
								>
									{showPassword ? "🙈" : "👁️"}
								</button>
							)}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Joined
						</label>
						<input
							type="text"
							value={formatDate(profile.createdAt)}
							disabled
							className="border px-3 py-2 rounded-lg w-full bg-gray-100 text-gray-500"
						/>
					</div>
					<div className="flex space-x-2">
						{!editMode ? (
							<button
								type="button"
								onClick={() => setEditMode(true)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
							>
								Edit
							</button>
						) : (
							<>
								<button
									type="submit"
									className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
								>
									Save
								</button>
								<button
									type="button"
									onClick={() => {
										setEditMode(false);
										setProfile((prev) => ({ ...prev, password: "" }));
									}}
									className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
								>
									Cancel
								</button>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default Settings;
