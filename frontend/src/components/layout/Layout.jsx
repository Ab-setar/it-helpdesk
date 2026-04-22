import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
	return (
		<div className='min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900'>
			<Navbar />
			<main className='grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16'>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

export default Layout;
