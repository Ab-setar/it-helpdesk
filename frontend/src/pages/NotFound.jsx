import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
	const { user } = useAuth();

	const homeLink = user?.role === "submitter" ? "/user-dashboard" : "/dashboard";

	return (
		<div className='min-h-screen flex flex-col items-center justify-center text-center px-4'>
			<h1 className='text-9xl font-bold text-gray-200 dark:text-gray-700'>404</h1>
			<h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4'>
				Page not found
			</h2>
			<p className='text-gray-500 dark:text-gray-400 mt-2 mb-8'>
				The page you're looking for doesn't exist or has been moved.
			</p>
			<Link
				to={user ? homeLink : "/login"}
				className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors'>
				{user ? "Back to Dashboard" : "Back to Login"}
			</Link>
		</div>
	);
};

export default NotFound;
