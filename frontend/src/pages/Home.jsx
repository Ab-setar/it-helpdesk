import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
	const { user } = useAuth();

	return (
		<div className='min-h-screen bg-linear-to-b from-slate-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col'>

			{/* Top right buttons */}
			<div className='flex justify-end items-center px-8 py-5 gap-3'>
				{user ? (
					<Link
						to={user.role === "submitter" ? "/user-dashboard" : "/dashboard"}
						className='px-5 py-2 rounded-full text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'>
						Go to Dashboard
					</Link>
				) : (
					<>
						<Link
							to='/login'
							className='px-5 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-colors'>
							Login
						</Link>
						<Link
							to='/register'
							className='px-5 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-colors'>
							Register
						</Link>
					</>
				)}
			</div>

			{/* Hero section */}
			<div className='flex-1 flex flex-col items-center justify-center text-center px-4 pb-20'>

				{/* Logo */}
				<div className='mb-8'>
					<div className='w-32 h-32 rounded-2xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-center overflow-hidden mx-auto p-2'>
						<img
							src='https://ess.gov.et/wp-content/uploads/2024/06/Group-163248.svg'
							alt='Ethiopian Statistical Service Logo'
							className='w-full h-full object-contain'
							onError={(e) => {
								e.target.style.display = 'none';
								e.target.nextSibling.style.display = 'flex';
							}}
						/>
						<div
							style={{ display: 'none' }}
							className='w-full h-full bg-indigo-600 rounded-xl items-center justify-center'>
							<span className='text-white text-3xl font-bold'>ESS</span>
						</div>
					</div>
				</div>

				{/* Title */}
				<h1 className='text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-3'>
					Welcome to ESS Helpdesk
				</h1>

				{/* Subtitle */}
				<p className='text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4'>
					Ethiopian Statistical Service
				</p>

				{/* Description */}
				<p className='text-gray-500 dark:text-gray-400 max-w-md text-sm sm:text-base leading-relaxed'>
					Your reliable, fast, and modern IT Help Request Tracking System.
					Built to simplify your support journey and make your work easier.
				</p>

				{/* CTA buttons */}
				<div className='flex gap-4 mt-10'>
					<Link
						to='/login'
						className='px-8 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all'>
						Get Started
					</Link>
					<Link
						to='/register'
						className='px-8 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-all'>
						Create Account
					</Link>
				</div>
			</div>

			{/* Footer */}
			<div className='text-center py-4 text-xs text-gray-400 dark:text-gray-500'>
				&copy; {new Date().getFullYear()} Ethiopian Statistical Service. All rights reserved.
			</div>
		</div>
	);
};

export default Home;
