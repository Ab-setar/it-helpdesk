import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, LogIn } from "lucide-react";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const result = await login(email, password);
		if (result.success) {
			navigate("/dashboard");
		}
		setLoading(false);
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<div className='flex justify-center'>
						<LogIn className='h-12 w-12 text-primary-600' />
					</div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
						Sign in to your account
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
						Or{" "}
						<Link
							to='/register'
							className='font-medium text-primary-600 hover:text-primary-500'>
							create a new account
						</Link>
					</p>
				</div>

				<form
					className='mt-8 space-y-6'
					onSubmit={handleSubmit}>
					<div className='rounded-md shadow-sm space-y-4'>
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
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='input pl-10'
									placeholder='Email address'
								/>
							</div>
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
									autoComplete='current-password'
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='input pl-10'
									placeholder='Password'
								/>
							</div>
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<div className='flex items-center'>
							<input
								id='remember-me'
								name='remember-me'
								type='checkbox'
								className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
							/>
							<label
								htmlFor='remember-me'
								className='ml-2 block text-sm text-gray-900 dark:text-gray-300'>
								Remember me
							</label>
						</div>

						<div className='text-sm'>
							<Link
								to='/forgot-password'
								className='font-medium text-primary-600 hover:text-primary-500'>
								Forgot your password?
							</Link>
						</div>
					</div>

					<div>
						<button
							type='submit'
							disabled={loading}
							className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50'>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
