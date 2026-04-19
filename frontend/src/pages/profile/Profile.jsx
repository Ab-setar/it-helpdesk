import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import { User, Phone, Mail, Save } from "lucide-react";

const Profile = () => {
	const { user, updateUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		phoneNumber: user?.phoneNumber || "",
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await authAPI.updateProfile(formData);
			updateUser(response.data.data);
			toast.success("Profile updated successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-2xl mx-auto'>
			<h1 className='text-3xl font-bold mb-6'>My Profile</h1>

			<div className='card'>
				{/* Avatar & role */}
				<div className='flex items-center space-x-4 mb-8 pb-6 border-b dark:border-gray-700'>
					<div className='w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center'>
						<User className='w-8 h-8 text-indigo-600 dark:text-indigo-400' />
					</div>
					<div>
						<p className='text-xl font-semibold text-gray-900 dark:text-white'>{user?.name}</p>
						<p className='text-sm text-gray-500 dark:text-gray-400 capitalize'>
							{user?.role?.replace("_", " ")}
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className='space-y-5'>
					{/* Name */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
							Full Name
						</label>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<User className='h-4 w-4 text-gray-400' />
							</div>
							<input
								name='name'
								type='text'
								value={formData.name}
								onChange={handleChange}
								className='input pl-9'
								placeholder='Your full name'
								required
							/>
						</div>
					</div>

					{/* Email — read only */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
							Email Address
						</label>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Mail className='h-4 w-4 text-gray-400' />
							</div>
							<input
								type='email'
								value={user?.email || ""}
								className='input pl-9 bg-gray-50 dark:bg-gray-600 cursor-not-allowed'
								disabled
							/>
						</div>
						<p className='mt-1 text-xs text-gray-400'>Email cannot be changed here</p>
					</div>

					{/* Phone */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
							Phone Number
						</label>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Phone className='h-4 w-4 text-gray-400' />
							</div>
							<input
								name='phoneNumber'
								type='tel'
								value={formData.phoneNumber}
								onChange={handleChange}
								className='input pl-9'
								placeholder='+1234567890'
							/>
						</div>
					</div>

					<button type='submit' disabled={loading} className='btn-primary w-full'>
						<Save className='h-4 w-4 mr-2' />
						{loading ? "Saving..." : "Save Changes"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Profile;
