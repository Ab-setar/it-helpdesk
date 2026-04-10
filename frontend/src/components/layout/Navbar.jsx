import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
	Menu,
	X,
	Sun,
	Moon,
	User,
	LogOut,
	Ticket,
	LayoutDashboard,
	Shield,
	Users,
} from "lucide-react";

const Navbar = () => {
	const { user, logout, isAdmin, isSeniorOfficer } = useAuth();
	const { darkMode, toggleDarkMode } = useTheme();
	const navigate = useNavigate();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const navLinks = [
		...(user
			? [
					...(isAdmin || isSeniorOfficer
						? [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
						: []),
					...(user.role === "submitter"
						? [{ to: "/user-dashboard", label: "My Tickets", icon: Ticket }]
						: []),
					...(isAdmin
						? [{ to: "/admin/users", label: "Manage Users", icon: Users }]
						: []),
					...(isAdmin
						? [
								{
									to: "/admin/senior-officers",
									label: "Senior Officers",
									icon: Shield,
								},
							]
						: []),
				]
			: [
					{ to: "/login", label: "Login" },
					{ to: "/register", label: "Register" },
				]),
	];

	return (
		<nav className='bg-white dark:bg-gray-800 shadow-md fixed w-full z-50 top-0'>
			<div className='container mx-auto px-4'>
				<div className='flex justify-between items-center h-16'>
					{/* Logo */}
					<Link
						to='/'
						className='flex items-center space-x-2'>
						<Ticket className='h-8 w-8 text-primary-600' />
						<span className='font-bold text-xl text-gray-800 dark:text-white'>
							HelpDesk Pro
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center space-x-6'>
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className='text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
								{link.label}
							</Link>
						))}

						{/* Theme Toggle */}
						<button
							onClick={toggleDarkMode}
							className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
							{darkMode ? (
								<Sun className='h-5 w-5' />
							) : (
								<Moon className='h-5 w-5' />
							)}
						</button>

						{/* User Menu */}
						{user && (
							<div className='relative' ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className='flex items-center space-x-2 focus:outline-none'>
									<img
										src={user.avatarPath || "/default-avatar.png"}
										alt='Avatar'
										className='w-8 h-8 rounded-full object-cover'
									/>
									<span className='text-gray-700 dark:text-gray-300'>
										{user.name}
									</span>
								</button>

								{dropdownOpen && (
									<div className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50'>
										<Link
											to='/profile'
											className='block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
											onClick={() => setDropdownOpen(false)}>
											<User className='inline h-4 w-4 mr-2' /> Profile
										</Link>
										<button
											onClick={() => {
												setDropdownOpen(false);
												handleLogout();
											}}
											className='block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700'>
											<LogOut className='inline h-4 w-4 mr-2' /> Logout
										</button>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className='md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'>
						{mobileMenuOpen ? (
							<X className='h-6 w-6' />
						) : (
							<Menu className='h-6 w-6' />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Navigation */}
			{mobileMenuOpen && (
				<div className='md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700'>
					<div className='px-2 pt-2 pb-3 space-y-1'>
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className='block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
								onClick={() => setMobileMenuOpen(false)}>
								{link.label}
							</Link>
						))}
						<button
							onClick={toggleDarkMode}
							className='w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'>
							{darkMode ? "Light Mode" : "Dark Mode"}
						</button>
						{user && (
							<button
								onClick={() => {
									setMobileMenuOpen(false);
									handleLogout();
								}}
								className='w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'>
								Logout
							</button>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
