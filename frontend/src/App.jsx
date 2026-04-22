import React, { Suspense, lazy } from "react";
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

// Auth Pages — loaded eagerly since users land here first
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// All other pages — lazy loaded only when visited
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const UserDashboard = lazy(() => import("./pages/dashboard/UserDashboard"));
const SubmitTicket = lazy(() => import("./pages/tickets/SubmitTicket"));
const EditTicket = lazy(() => import("./pages/tickets/EditTicket"));
const ViewTicket = lazy(() => import("./pages/tickets/ViewTicket"));
const ManageTicket = lazy(() => import("./pages/tickets/ManageTicket"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const ChangePassword = lazy(() => import("./pages/profile/ChangePassword"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSeniorOfficers = lazy(() => import("./pages/admin/AdminSeniorOfficers"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));

// Loading fallback shown while a lazy page is being fetched
const PageLoader = () => (
	<div className='flex justify-center items-center h-64 text-gray-500'>
		Loading...
	</div>
);

// Redirects to the correct dashboard based on user role
const RoleRedirect = () => {
	const { user, loading } = useAuth();
	if (loading) return <div className='flex justify-center items-center h-screen'>Loading...</div>;
	if (!user) return <Navigate to='/login' />;
	return <Navigate to={user.role === "submitter" ? "/user-dashboard" : "/dashboard"} />;
};

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
		const fallback = user.role === "submitter" ? "/user-dashboard" : "/dashboard";
		return <Navigate to={fallback} />;
	}

	return children;
};

function AppRoutes() {
	return (
		<Suspense fallback={<PageLoader />}>
		<Routes>
			{/* Public Routes */}
			<Route path='/' element={<Home />} />
			<Route path='/login' element={<Login />} />
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
					path='/tickets/:id/manage'
					element={
						<ProtectedRoute allowedRoles={["admin", "senior_officer"]}>
							<ManageTicket />
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

			{/* 404 - catch all unmatched routes */}
			<Route path='*' element={<NotFound />} />
		</Routes>
		</Suspense>
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
