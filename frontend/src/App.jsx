import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/layout/Layout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";

// Ticket Pages
import SubmitTicket from "./pages/tickets/SubmitTicket";
import EditTicket from "./pages/tickets/EditTicket";
import ViewTicket from "./pages/tickets/ViewTicket";

// Profile Pages
import Profile from "./pages/profile/Profile";
import ChangePassword from "./pages/profile/ChangePassword";

// Admin Pages
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSeniorOfficers from "./pages/admin/AdminSeniorOfficers";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				Loading...
			</div>
		);
	}

	if (!user) {
		return <Navigate to='/login' />;
	}

	if (allowedRoles.length && !allowedRoles.includes(user.role)) {
		return <Navigate to='/dashboard' />;
	}

	return children;
};

function AppRoutes() {
	return (
		<Routes>
			{/* Public Routes */}
			<Route
				path='/login'
				element={<Login />}
			/>
			<Route
				path='/register'
				element={<Register />}
			/>
			<Route
				path='/forgot-password'
				element={<ForgotPassword />}
			/>
			<Route
				path='/reset-password/:token'
				element={<ResetPassword />}
			/>

			{/* Protected Routes */}
			<Route element={<Layout />}>
				<Route
					path='/'
					element={<Navigate to='/dashboard' />}
				/>

				{/* Dashboard */}
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute allowedRoles={["admin", "senior_officer"]}>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/user-dashboard'
					element={
						<ProtectedRoute allowedRoles={["submitter"]}>
							<UserDashboard />
						</ProtectedRoute>
					}
				/>

				{/* Tickets */}
				<Route
					path='/tickets/new'
					element={
						<ProtectedRoute allowedRoles={["submitter"]}>
							<SubmitTicket />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/tickets/:id/edit'
					element={
						<ProtectedRoute>
							<EditTicket />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/tickets/:id'
					element={
						<ProtectedRoute>
							<ViewTicket />
						</ProtectedRoute>
					}
				/>

				{/* Profile */}
				<Route
					path='/profile'
					element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/change-password'
					element={
						<ProtectedRoute>
							<ChangePassword />
						</ProtectedRoute>
					}
				/>

				{/* Admin */}
				<Route
					path='/admin/users'
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminUsers />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/admin/senior-officers'
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSeniorOfficers />
						</ProtectedRoute>
					}
				/>
			</Route>
		</Routes>
	);
}

function App() {
	return (
		<Router>
			<ThemeProvider>
				<AuthProvider>
					<Toaster position='top-right' />
					<AppRoutes />
				</AuthProvider>
			</ThemeProvider>
		</Router>
	);
}

export default App;
