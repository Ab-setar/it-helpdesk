import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState(
		localStorage.getItem("token") || sessionStorage.getItem("token")
	);

	useEffect(() => {
		if (token) {
			loadUser();
		} else {
			setLoading(false);
		}
	}, [token]);

	const loadUser = async () => {
		try {
			const response = await authAPI.getMe();
			setUser(response.data.data);
		} catch (error) {
			console.error("Failed to load user:", error);
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			setToken(null);
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password, rememberMe = true) => {
		try {
			const response = await authAPI.login({ email, password });
			const { token, ...userData } = response.data.data;

			// rememberMe = localStorage (persists after browser close)
			// otherwise = sessionStorage (clears when browser closes)
			const storage = rememberMe ? localStorage : sessionStorage;
			storage.setItem("token", token);
			storage.setItem("user", JSON.stringify(userData));

			setToken(token);
			setUser(userData);
			toast.success("Login successful!");
			return { success: true, user: userData };
		} catch (error) {
			const message = error.response?.data?.message || "Login failed";
			toast.error(message);
			return { success: false, message };
		}
	};

	const register = async (userData) => {
		try {
			const response = await authAPI.register(userData);
			const { token, ...newUser } = response.data.data;
			localStorage.setItem("token", token);
			localStorage.setItem("user", JSON.stringify(newUser));
			setToken(token);
			setUser(newUser);
			toast.success("Registration successful!");
			return { success: true, user: newUser };
		} catch (error) {
			const message = error.response?.data?.message || "Registration failed";
			toast.error(message);
			return { success: false, message };
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
		setToken(null);
		setUser(null);
		toast.success("Logged out successfully");
	};

	const updateUser = (updatedData) => {
		setUser((prev) => ({ ...prev, ...updatedData }));
		localStorage.setItem("user", JSON.stringify({ ...user, ...updatedData }));
	};

	const value = {
		user,
		loading,
		isAuthenticated: !!user,
		isAdmin: user?.role === "admin",
		isSeniorOfficer: user?.role === "senior_officer",
		isSubmitter: user?.role === "submitter",
		login,
		register,
		logout,
		updateUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
