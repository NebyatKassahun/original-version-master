import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Settings = () => {
	const [profile, setProfile] = useState({
		name: "",
		email: "",
		password: "",
		photo: null,
		photoURL: null,
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

		// Decode the token manually
		const userId = getUserIdFromToken(token);

		if (!userId) {
			console.error("User ID not found in token.");
			return;
		}
		// localStorage.getItem("userId");

		// console.log("Fetching user data with token:", token, "and userId:", userId);
		// if (!token || !userId) return;

		axios
			.get(`https://stockmanagementbackend.onrender.com/api/users/${userId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				if (!editMode) {
					const { firstName, lastName, email, profilePictureUrl } = res.data;
					setProfile({
						name: `${firstName} ${lastName}`,
						email: email || "",
						photo: null,
						password: "",
						photoURL: profilePictureUrl || null,
					});
				}
			})
			.catch((err) => {
				console.error("Failed to fetch user data:", err);
			});
	}, [editMode]);

	// useEffect(() => {
	// 	console.log("Fetched profile:", profile);
	// }, [profile]);

	// Handle form field changes (name, email, password)
	const handleChange = (e) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	// Handle file selection & show preview
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

	// Save updated profile (including photo upload)
	const handleSave = async (e) => {
		e.preventDefault();

		const token = localStorage.getItem("token");
		if (!token) {
			setMessage("Authentication error. Please login again.");
			return;
		}

		// Decode token to get userId (safer than relying on localStorage)
		const userId = getUserIdFromToken(token);

		if (!userId) {
			setMessage("User ID not found. Please login again.");
			return;
		}

		const trimmedName = profile.name.trim();
		if (!trimmedName) {
			setMessage("Name is required.");
			return;
		}

		const [firstName, ...rest] = trimmedName.split(" ");
		const lastName = rest.join(" ").trim();

		if (!firstName || !lastName) {
			setMessage("Please enter both first and last name.");
			return;
		}

		if (!profile.email) {
			setMessage("Email is required.");
			return;
		}

		const formData = new FormData();
		formData.append("firstName", firstName);
		formData.append("lastName", lastName);
		formData.append("email", profile.email);
		if (profile.password) formData.append("password", profile.password);
		if (profile.photo) formData.append("photo", profile.photo);

		try {
			const res = await axios.put(
				`https://stockmanagementbackend.onrender.com/api/users/${userId}`,
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
				name: `${updatedUser.firstName} ${updatedUser.lastName}`,
				email: updatedUser.email,
				photoURL: updatedUser.profilePictureUrl || null,
				password: "",
				photo: null,
			}));

			// The issue about the fast exit is here....
			// setEditMode(false);
			setMessage("Profile updated successfully!");
			// setTimeout(() => setMessage(""), 3000);
		} catch (err) {
			console.error("Update failed:", err.response?.data || err.message);
			setMessage("Update failed. Please try again.");
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
									{profile.name ? profile.name[0] : "U"}
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
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							type="text"
							name="name"
							value={profile.name}
							onChange={handleChange}
							disabled={!editMode}
							className="border px-3 py-2 rounded-lg w-full"
							autoComplete="off"
						/>
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
