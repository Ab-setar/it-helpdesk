import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			await authAPI.forgotPassword({ email });
			setSubmitted(true);
			toast.success("Reset link sent! Check your email.");
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		}

		setLoading(false);
	};

	if (submitted) {
		return (
			<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-md w-full space-y-8 text-center'>
					<div className='bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg'>
						<p className='font-medium'>Check your email!</p>
						<p className='text-sm mt-1'>
							We've sent a password reset link to <strong>{email}</strong>
						</p>
					</div>
					<Link
						to='/login'
						className='text-primary-600 hover:text-primary-500'>
						← Back to Login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<div className='flex justify-center'>
						<Mail className='h-12 w-12 text-primary-600' />
					</div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
						Reset your password
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
						Enter your email address and we'll send you a link to reset your
						password.
					</p>
				</div>

				<form
					className='mt-8 space-y-6'
					onSubmit={handleSubmit}>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Email address
						</label>
						<input
							id='email'
							name='email'
							type='email'
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='input mt-1'
							placeholder='you@example.com'
						/>
					</div>

					<div>
						<button
							type='submit'
							disabled={loading}
							className='btn-primary w-full'>
							{loading ? "Sending..." : "Send Reset Link"}
						</button>
					</div>

					<div className='text-center'>
						<Link
							to='/login'
							className='text-sm text-primary-600 hover:text-primary-500 inline-flex items-center'>
							<ArrowLeft className='h-4 w-4 mr-1' />
							Back to Login
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ForgotPassword;
