import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getBaseUrl } from "../../../Utils/baseApi";
import {
	User,
	// Mail,
	// Phone,
	// Lock,
	// Camera,
	Save,
	Edit,
	X,
	Eye,
	EyeOff,
	Shield,
	// Bell,
	Palette,
	// Globe,
	Key,
	// Calendar,
	Settings as SettingsIcon,
	LogOut,
	Trash2,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";

const normalizeImageUrl = (url) => {
	if (!url) return "";
	return url.replace(/([^:]\/)\/+/g, "$1/");
};

const Settings = () => {
	const [activeTab, setActiveTab] = useState("profile");
	const [profile, setProfile] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		photo: null,
		photoURL: null,
		createdAt: "",
		role: "",
	});
	const [preferences, setPreferences] = useState({
		theme: "light",
		language: "en",
		notifications: {
			email: true,
			push: true,
			sms: false,
		},
		privacy: {
			profileVisibility: "public",
			showEmail: true,
			showPhone: false,
		},
	});
	const [security, setSecurity] = useState({
		twoFactorEnabled: false,
		lastPasswordChange: "",
		loginHistory: [],
	});
	const [editMode, setEditMode] = useState(false);
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState("success");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
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

	function cleanProfilePictureUrl(url) {
		if (!url) return '';
		return url.replace('/images/images/', '/images/');
	}

	// Fetch user data on mount
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return;
		const userId = getUserIdFromToken(token);
		if (!userId) return;

		setLoading(true);
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
					role,
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
					role: role?.roleType || "",
				});
			})
			.catch(() => {
				setMessage("Failed to fetch user data.");
				setMessageType("error");
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const handleChange = (e) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	const handlePreferenceChange = (section, key, value) => {
		setPreferences((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[key]: value,
			},
		}));
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
		setLoading(true);
		const token = localStorage.getItem("token");
		if (!token) {
			setMessage("Authentication error. Please login again.");
			setMessageType("error");
			setLoading(false);
			return;
		}
		const userId = getUserIdFromToken(token);
		if (!userId) {
			setMessage("User ID not found. Please login again.");
			setMessageType("error");
			setLoading(false);
			return;
		}
		if (!profile.firstName.trim() || !profile.lastName.trim()) {
			setMessage("First and last name are required.");
			setMessageType("error");
			setLoading(false);
			return;
		}
		if (!profile.email) {
			setMessage("Email is required.");
			setMessageType("error");
			setLoading(false);
			return;
		}
		if (!profile.phone) {
			setMessage("Phone is required.");
			setMessageType("error");
			setLoading(false);
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
			setMessageType("success");
		} catch {
			setMessage("Update failed. Please try again.");
			setMessageType("error");
		} finally {
			setLoading(false);
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

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("userId");
		window.location.href = "/login";
	};

	const handleDeleteAccount = () => {
		if (
			window.confirm(
				"Are you sure you want to delete your account? This action cannot be undone."
			)
		) {
			// Implement account deletion logic
			setMessage("Account deletion feature coming soon.");
			setMessageType("info");
		}
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		if (isNaN(d)) return dateStr;
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const TabButton = ({ id, icon: Icon, label, active }) => (
		<button
			onClick={() => setActiveTab(id)}
			className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
				active
					? "bg-blue-100 text-blue-700 border border-blue-200"
					: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
			}`}
		>
			<Icon className="w-5 h-5" />
			<span className="font-medium">{label}</span>
		</button>
	);

	const SettingCard = ({ title, children }) => (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
			{children}
		</div>
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-8 min-h-full p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
					<p className="text-gray-600 mt-1">
						Manage your account preferences and security settings
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
						{profile.role || "User"}
					</div>
				</div>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`px-4 py-3 rounded-xl border ${
						messageType === "success"
							? "bg-green-50 border-green-200 text-green-700"
							: messageType === "error"
							? "bg-red-50 border-red-200 text-red-700"
							: "bg-blue-50 border-blue-200 text-blue-700"
					}`}
				>
					<div className="flex items-center space-x-2">
						{messageType === "success" ? (
							<CheckCircle className="w-5 h-5" />
						) : messageType === "error" ? (
							<AlertTriangle className="w-5 h-5" />
						) : (
							<SettingsIcon className="w-5 h-5" />
						)}
						<span>{message}</span>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Sidebar Navigation */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Settings
						</h3>
						<div className="space-y-2">
							<TabButton
								id="profile"
								icon={User}
								label="Profile"
								active={activeTab === "profile"}
							/>
							<TabButton
								id="preferences"
								icon={Palette}
								label="Preferences"
								active={activeTab === "preferences"}
							/>
							<TabButton
								id="security"
								icon={Shield}
								label="Security"
								active={activeTab === "security"}
							/>
							<TabButton
								id="account"
								icon={Key}
								label="Account"
								active={activeTab === "account"}
							/>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="lg:col-span-3 space-y-6">
					{/* Profile Tab */}
					{activeTab === "profile" && (
						<SettingCard title="Profile Information">
							<form onSubmit={handleSave} className="space-y-6">
								{/* Profile Photo */}
								<div className="flex items-center space-x-6">
									<div
										className={`relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 ${
											editMode ? "border-blue-500" : "border-gray-300"
										}`}
										onClick={handlePhotoClick}
										title={editMode ? "Click to change photo" : ""}
									>
										{profile.photoURL ? (
											<img
												// src={normalizeImageUrl(getBaseUrl().replace(/\/$/, '') + product.imageUrl)}
												src={normalizeImageUrl(cleanProfilePictureUrl(profile.photoURL))}
												alt="Profile"
												className="object-cover w-full h-full"
											/>
										) : (
											<span className="text-4xl text-gray-400">
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
											>
												<X className="w-4 h-4" />
											</button>
										)}
									</div>
									<div>
										<p className="text-sm text-gray-600">
											{editMode
												? "Click photo to upload/change"
												: "Profile photo"}
										</p>
										<p className="text-xs text-gray-500">
											{profile.firstName} {profile.lastName}
										</p>
									</div>
								</div>

								{/* Form Fields */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											First Name
										</label>
										<input
											type="text"
											name="firstName"
											value={profile.firstName}
											onChange={handleChange}
											disabled={!editMode}
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
											autoComplete="off"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Last Name
										</label>
										<input
											type="text"
											name="lastName"
											value={profile.lastName}
											onChange={handleChange}
											disabled={!editMode}
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
											autoComplete="off"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Email Address
									</label>
									<input
										type="email"
										name="email"
										value={profile.email}
										onChange={handleChange}
										disabled={!editMode}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										autoComplete="off"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Phone Number
									</label>
									<input
										type="text"
										name="phone"
										value={profile.phone}
										onChange={handleChange}
										disabled={!editMode}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										autoComplete="off"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										New Password
									</label>
									<div className="relative">
										<input
											type={showPassword ? "text" : "password"}
											name="password"
											value={profile.password}
											onChange={handleChange}
											disabled={!editMode}
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 pr-12"
											placeholder={editMode ? "Enter new password" : "********"}
											autoComplete="new-password"
										/>
										{editMode && (
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
											>
												{showPassword ? (
													<EyeOff className="w-5 h-5" />
												) : (
													<Eye className="w-5 h-5" />
												)}
											</button>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Role
										</label>
										<input
											type="text"
											value={profile.role}
											disabled
											className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Member Since
										</label>
										<input
											type="text"
											value={formatDate(profile.createdAt)}
											disabled
											className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
										/>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 pt-6 border-t border-gray-200">
									{!editMode ? (
										<button
											type="button"
											onClick={() => setEditMode(true)}
											className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2"
										>
											<Edit className="w-4 h-4" />
											<span>Edit Profile</span>
										</button>
									) : (
										<>
											<button
												type="submit"
												disabled={loading}
												className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
											>
												{loading ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														<span>Saving...</span>
													</>
												) : (
													<>
														<Save className="w-4 h-4" />
														<span>Save Changes</span>
													</>
												)}
											</button>
											<button
												type="button"
												onClick={() => {
													setEditMode(false);
													setProfile((prev) => ({ ...prev, password: "" }));
												}}
												className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
											>
												Cancel
											</button>
										</>
									)}
								</div>
							</form>
						</SettingCard>
					)}

					{/* Preferences Tab */}
					{activeTab === "preferences" && (
						<div className="space-y-6">
							<SettingCard title="Appearance">
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Theme
										</label>
										<select
											value={preferences.theme}
											onChange={(e) =>
												setPreferences((prev) => ({
													...prev,
													theme: e.target.value,
												}))
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="light">Light</option>
											<option value="dark">Dark</option>
											<option value="auto">Auto</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Language
										</label>
										<select
											value={preferences.language}
											onChange={(e) =>
												setPreferences((prev) => ({
													...prev,
													language: e.target.value,
												}))
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="en">English</option>
											<option value="es">Spanish</option>
											<option value="fr">French</option>
										</select>
									</div>
								</div>
							</SettingCard>

							<SettingCard title="Notifications">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-gray-900">
												Email Notifications
											</p>
											<p className="text-sm text-gray-600">
												Receive updates via email
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.notifications.email}
												onChange={(e) =>
													handlePreferenceChange(
														"notifications",
														"email",
														e.target.checked
													)
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-gray-900">
												Push Notifications
											</p>
											<p className="text-sm text-gray-600">
												Receive push notifications
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.notifications.push}
												onChange={(e) =>
													handlePreferenceChange(
														"notifications",
														"push",
														e.target.checked
													)
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-gray-900">
												SMS Notifications
											</p>
											<p className="text-sm text-gray-600">
												Receive SMS alerts
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.notifications.sms}
												onChange={(e) =>
													handlePreferenceChange(
														"notifications",
														"sms",
														e.target.checked
													)
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
								</div>
							</SettingCard>

							<SettingCard title="Privacy">
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Profile Visibility
										</label>
										<select
											value={preferences.privacy.profileVisibility}
											onChange={(e) =>
												handlePreferenceChange(
													"privacy",
													"profileVisibility",
													e.target.value
												)
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="public">Public</option>
											<option value="private">Private</option>
											<option value="friends">Friends Only</option>
										</select>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-gray-900">Show Email</p>
											<p className="text-sm text-gray-600">
												Allow others to see your email
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.privacy.showEmail}
												onChange={(e) =>
													handlePreferenceChange(
														"privacy",
														"showEmail",
														e.target.checked
													)
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-gray-900">Show Phone</p>
											<p className="text-sm text-gray-600">
												Allow others to see your phone
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.privacy.showPhone}
												onChange={(e) =>
													handlePreferenceChange(
														"privacy",
														"showPhone",
														e.target.checked
													)
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
								</div>
							</SettingCard>
						</div>
					)}

					{/* Security Tab */}
					{activeTab === "security" && (
						<div className="space-y-6">
							<SettingCard title="Two-Factor Authentication">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-gray-900">Enable 2FA</p>
										<p className="text-sm text-gray-600">
											Add an extra layer of security to your account
										</p>
									</div>
									<label className="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={security.twoFactorEnabled}
											onChange={(e) =>
												setSecurity((prev) => ({
													...prev,
													twoFactorEnabled: e.target.checked,
												}))
											}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
									</label>
								</div>
							</SettingCard>

							<SettingCard title="Password Security">
								<div className="space-y-4">
									<div>
										<p className="font-medium text-gray-900">
											Last Password Change
										</p>
										<p className="text-sm text-gray-600">
											{security.lastPasswordChange || "Never"}
										</p>
									</div>
									<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
										Change Password
									</button>
								</div>
							</SettingCard>

							<SettingCard title="Login History">
								<div className="space-y-3">
									{security.loginHistory.length > 0 ? (
										security.loginHistory.map((login, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
											>
												<div>
													<p className="font-medium text-gray-900">
														{login.device}
													</p>
													<p className="text-sm text-gray-600">
														{login.location}
													</p>
												</div>
												<p className="text-sm text-gray-500">{login.date}</p>
											</div>
										))
									) : (
										<p className="text-gray-500 text-center py-4">
											No login history available
										</p>
									)}
								</div>
							</SettingCard>
						</div>
					)}

					{/* Account Tab */}
					{activeTab === "account" && (
						<div className="space-y-6">
							<SettingCard title="Account Actions">
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
										<div>
											<p className="font-medium text-yellow-800">Logout</p>
											<p className="text-sm text-yellow-600">
												Sign out of your account
											</p>
										</div>
										<button
											onClick={handleLogout}
											className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center space-x-2"
										>
											<LogOut className="w-4 h-4" />
											<span>Logout</span>
										</button>
									</div>
									<div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
										<div>
											<p className="font-medium text-red-800">Delete Account</p>
											<p className="text-sm text-red-600">
												Permanently delete your account and all data
											</p>
										</div>
										<button
											onClick={handleDeleteAccount}
											className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
										>
											<Trash2 className="w-4 h-4" />
											<span>Delete</span>
										</button>
									</div>
								</div>
							</SettingCard>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Settings;
