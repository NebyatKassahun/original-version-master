import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getBaseUrl } from "../Utils/baseApi";

// Create the Auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const navigate = useNavigate();

	// State for user info and JWT token
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [loading, setLoading] = useState(true);

	// On mount: restore auth state, check token expiry
	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken) {
			try {
				const decoded = jwtDecode(storedToken);
				// If token is still valid, restore state
				if (decoded.exp * 1000 > Date.now()) {
					setToken(storedToken);
					if (storedUser) setUser(JSON.parse(storedUser));
				} else {
					// Token expired → force logout
					logout();
				}
			} catch (err) {
				console.error("Invalid token:", err);
				logout();
			}
		}
		setLoading(false);
	}, []);

	// Log in user and store token & user info
	const login = async (email, password) => {
		try {
			const response = await fetch(getBaseUrl() + "/api/users/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			if (!response.ok) {
				return false;
			}

			const data = await response.json();

			// Save token & user
			if (data.token) {
				localStorage.setItem("token", data.token);
				setToken(data.token);
			}
			const userObj = data.user || { email };
			localStorage.setItem("user", JSON.stringify(userObj));
			setUser(userObj);

			// Optional: redirect upon login
			navigate("/dashboard");

			return true;
		} catch (error) {
			console.error("Login error:", error);
			return false;
		}
	};

	// Log out user and clean up
	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
		navigate("/login");
	};

	// Fetch latest user info from API
	const refreshUser = async () => {
		if (!token) return;
		try {
			const response = await fetch(getBaseUrl() + "/api/users/me", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
				localStorage.setItem("user", JSON.stringify(data.user));
			} else {
				logout();
			}
		} catch (error) {
			console.error("Refresh user failed:", error);
			logout();
		}
	};

	// Context value
	const value = {
		user,
		token,
		isAuthenticated: !!user,
		loading,
		login,
		logout,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
