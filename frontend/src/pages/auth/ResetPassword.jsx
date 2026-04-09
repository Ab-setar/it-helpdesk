import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const ResetPassword = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		newPassword: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		if (errors[e.target.name]) {
			setErrors({ ...errors, [e.target.name]: "" });
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.newPassword) {
			newErrors.newPassword = "Password is required";
		} else if (formData.newPassword.length < 6) {
			newErrors.newPassword = "Password must be at least 6 characters";
		}
		if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);

		try {
			await authAPI.resetPassword({
				token,
				newPassword: formData.newPassword,
			});
			toast.success("Password reset successful! Please login.");
			navigate("/login");
		} catch (error) {
			toast.error(error.response?.data?.message || "Invalid or expired token");
		}

		setLoading(false);
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<div className='flex justify-center'>
						<Lock className='h-12 w-12 text-primary-600' />
					</div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
						Create new password
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
						Enter your new password below.
					</p>
				</div>

				<form
					className='mt-8 space-y-6'
					onSubmit={handleSubmit}>
					<div className='space-y-4'>
						<div>
							<label
								htmlFor='newPassword'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								New Password
							</label>
							<input
								id='newPassword'
								name='newPassword'
								type='password'
								required
								value={formData.newPassword}
								onChange={handleChange}
								className={`input mt-1 ${errors.newPassword ? "border-red-500" : ""}`}
								placeholder='Enter new password'
							/>
							{errors.newPassword && (
								<p className='mt-1 text-sm text-red-600'>
									{errors.newPassword}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Confirm Password
							</label>
							<input
								id='confirmPassword'
								name='confirmPassword'
								type='password'
								required
								value={formData.confirmPassword}
								onChange={handleChange}
								className={`input mt-1 ${errors.confirmPassword ? "border-red-500" : ""}`}
								placeholder='Confirm new password'
							/>
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
							className='btn-primary w-full flex items-center justify-center'>
							{loading ? (
								"Resetting..."
							) : (
								<>
									<CheckCircle className='h-4 w-4 mr-2' />
									Reset Password
								</>
							)}
						</button>
					</div>

					<div className='text-center'>
						<Link
							to='/login'
							className='text-sm text-primary-600 hover:text-primary-500'>
							← Back to Login
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ResetPassword;
