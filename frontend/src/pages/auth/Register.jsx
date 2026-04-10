import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Lock } from "lucide-react";

const Register = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const { register } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		// Clear error for this field
		if (errors[e.target.name]) {
			setErrors({ ...errors, [e.target.name]: "" });
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) newErrors.name = "Name is required";
		if (!formData.email.trim()) newErrors.email = "Email is required";
		if (!formData.password) newErrors.password = "Password is required";
		if (formData.password.length < 6)
			newErrors.password = "Password must be at least 6 characters";
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		const result = await register({
			name: formData.name,
			email: formData.email,
			password: formData.password,
			confirmPassword: formData.confirmPassword,
		});
		if (result.success) {
			navigate(result.user?.role === "submitter" ? "/user-dashboard" : "/dashboard");
		}
		setLoading(false);
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<div className='flex justify-center'>
						<User className='h-12 w-12 text-primary-600' />
					</div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
						Create your account
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
						Or{" "}
						<Link
							to='/login'
							className='font-medium text-primary-600 hover:text-primary-500'>
							sign in to existing account
						</Link>
					</p>
				</div>

				<form
					className='mt-8 space-y-6'
					onSubmit={handleSubmit}>
					<div className='rounded-md shadow-sm space-y-4'>
						<div>
							<label
								htmlFor='name'
								className='sr-only'>
								Full Name
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<User className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='name'
									name='name'
									type='text'
									autoComplete='name'
									required
									value={formData.name}
									onChange={handleChange}
									className={`input pl-10 ${errors.name ? "border-red-500" : ""}`}
									placeholder='Full Name'
								/>
							</div>
							{errors.name && (
								<p className='mt-1 text-sm text-red-600'>{errors.name}</p>
							)}
						</div>

						<div>
							<label
								htmlFor='email'
								className='sr-only'>
								Email address
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									required
									value={formData.email}
									onChange={handleChange}
									className={`input pl-10 ${errors.email ? "border-red-500" : ""}`}
									placeholder='Email address'
								/>
							</div>
							{errors.email && (
								<p className='mt-1 text-sm text-red-600'>{errors.email}</p>
							)}
						</div>

						<div>
							<label
								htmlFor='password'
								className='sr-only'>
								Password
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='password'
									name='password'
									type='password'
									autoComplete='new-password'
									required
									value={formData.password}
									onChange={handleChange}
									className={`input pl-10 ${errors.password ? "border-red-500" : ""}`}
									placeholder='Password (min. 6 characters)'
								/>
							</div>
							{errors.password && (
								<p className='mt-1 text-sm text-red-600'>{errors.password}</p>
							)}
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='sr-only'>
								Confirm Password
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='confirmPassword'
									name='confirmPassword'
									type='password'
									autoComplete='new-password'
									required
									value={formData.confirmPassword}
									onChange={handleChange}
									className={`input pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
									placeholder='Confirm Password'
								/>
							</div>
							{errors.confirmPassword && (
								<p className='mt-1 text-sm text-red-600'>
									{errors.confirmPassword}
								</p>
							)}
						</div>
					</div>

					<div>
						<button
							type='submit'
							disabled={loading}
							className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50'>
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Register;
