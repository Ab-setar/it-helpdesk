import React from "react";

const Footer = () => {
	return (
		<footer className='bg-white dark:bg-gray-800 shadow-md mt-auto py-4'>
			<div className='container mx-auto px-4 text-center text-gray-600 dark:text-gray-400'>
				<p>
					&copy; {new Date().getFullYear()} IT Help Desk. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;
