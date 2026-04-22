import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
	Menu, X, Sun, Moon, User, LogOut,
	LayoutDashboard, Shield, Users, KeyRound, Ticket,
} from "lucide-react";

const Navbar = () => {
	const { user, logout, isAdmin, isSeniorOfficer } = useAuth();
	const { darkMode, toggleDarkMode } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [location.pathname]);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const navLinks = user ? [
		...(isAdmin || isSeniorOfficer
			? [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
			: []),
		...(user.role === "submitter"
			? [{ to: "/user-dashboard", label: "My Tickets", icon: Ticket }]
			: []),
		...(isAdmin
			? [
				{ to: "/admin/users", label: "Users", icon: Users },
				{ to: "/admin/senior-officers", label: "Officers", icon: Shield },
			]
			: []),
	] : [
		{ to: "/login", label: "Login", icon: null },
		{ to: "/register", label: "Register", icon: null },
	];

	const isActive = (path) => location.pathname === path;

	const avatarInitial = user?.name?.charAt(0).toUpperCase();

	return (
		<nav className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-50 top-0'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>

					{/* Logo */}
					<Link to='/' className='flex items-center gap-2.5 shrink-0'>
						<div className='w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700'>
							<img
								src='https://ess.gov.et/wp-content/uploads/2024/06/Group-163248.svg'
								alt='ESS Logo'
								className='w-7 h-7 object-contain'
								onError={(e) => {
									e.target.style.display = 'none';
									e.target.nextSibling.style.display = 'block';
								}}
							/>
							<span style={{ display: 'none' }} className='text-indigo-600 font-bold text-xs'>ESS</span>
						</div>
						<span className='font-bold text-lg text-gray-900 dark:text-white tracking-tight'>
							ESS <span className='text-indigo-600'>Helpdesk</span>
						</span>
					</Link>

					{/* Desktop Nav */}
					<div className='hidden md:flex items-center gap-1'>
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className={`nav-link ${isActive(link.to) ? "nav-link-active" : ""}`}>
								{link.icon && <link.icon className='h-4 w-4' />}
								{link.label}
							</Link>
						))}
					</div>

					{/* Right side */}
					<div className='hidden md:flex items-center gap-2'>
						{/* Theme toggle */}
						<button
							onClick={toggleDarkMode}
							className='p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
							aria-label='Toggle theme'>
							{darkMode ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
						</button>

						{/* User dropdown */}
						{user && (
							<div className='relative' ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className='flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
									{/* Avatar */}
									<div className='w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0'>
										{avatarInitial}
									</div>
									<div className='text-left'>
										<p className='text-sm font-medium text-gray-900 dark:text-white leading-none'>
											{user.name}
										</p>
										<p className='text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5'>
											{user.role?.replace("_", " ")}
										</p>
									</div>
								</button>

								{dropdownOpen && (
									<div className='absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-1.5 z-50'>
										<div className='px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1'>
											<p className='text-xs text-gray-500 dark:text-gray-400'>Signed in as</p>
											<p className='text-sm font-medium text-gray-900 dark:text-white truncate'>{user.email}</p>
										</div>
										<Link
											to='/profile'
											className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
											onClick={() => setDropdownOpen(false)}>
											<User className='h-4 w-4 text-gray-400' /> Profile
										</Link>
										<Link
											to='/change-password'
											className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
											onClick={() => setDropdownOpen(false)}>
											<KeyRound className='h-4 w-4 text-gray-400' /> Change Password
										</Link>
										<div className='border-t border-gray-100 dark:border-gray-700 mt-1 pt-1'>
											<button
												onClick={() => { setDropdownOpen(false); handleLogout(); }}
												className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'>
												<LogOut className='h-4 w-4' /> Sign out
											</button>
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className='md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
						{mobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className='md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
					<div className='px-4 py-3 space-y-1'>
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
									${isActive(link.to)
										? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									}`}>
								{link.icon && <link.icon className='h-4 w-4' />}
								{link.label}
							</Link>
						))}
						<div className='border-t border-gray-100 dark:border-gray-700 pt-2 mt-2 space-y-1'>
							{user && (
								<>
									<Link to='/profile' className='flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
										<User className='h-4 w-4' /> Profile
									</Link>
									<Link to='/change-password' className='flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
										<KeyRound className='h-4 w-4' /> Change Password
									</Link>
								</>
							)}
							<button
								onClick={toggleDarkMode}
								className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
								{darkMode ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
								{darkMode ? "Light Mode" : "Dark Mode"}
							</button>
							{user && (
								<button
									onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
									className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'>
									<LogOut className='h-4 w-4' /> Sign out
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
