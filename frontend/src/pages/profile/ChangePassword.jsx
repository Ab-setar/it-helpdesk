import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});

	const toggleShow = (field) =>
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
		if (!formData.newPassword) newErrors.newPassword = "New password is required";
		else if (formData.newPassword.length < 6) newErrors.newPassword = "Must be at least 6 characters";
		if (formData.newPassword !== formData.confirmPassword)
			newErrors.confirmPassword = "Passwords do not match";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;
		setLoading(true);
		try {
			await authAPI.changePassword({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword,
			});
			toast.success("Password changed successfully");
			navigate("/profile");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to change password");
		} finally {
			setLoading(false);
		}
	};

	const PasswordField = ({ name, label, showKey }) => (
		<div>
			<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
				{label}
			</label>
			<div className='relative'>
				<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
					<Lock className='h-4 w-4 text-gray-400' />
				</div>
				<input
					name={name}
					type={showPasswords[showKey] ? "text" : "password"}
					value={formData[name]}
					onChange={handleChange}
					className={`input pl-9 pr-10 ${errors[name] ? "border-red-500" : ""}`}
					placeholder={label}
				/>
				<button
					type='button'
					onClick={() => toggleShow(showKey)}
					className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'>
					{showPasswords[showKey] ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
				</button>
			</div>
			{errors[name] && <p className='mt-1 text-sm text-red-600'>{errors[name]}</p>}
		</div>
	);

	return (
		<div className='max-w-md mx-auto'>
			<h1 className='text-3xl font-bold mb-6'>Change Password</h1>

			<div className='card space-y-5'>
				<form onSubmit={handleSubmit} className='space-y-5'>
					<PasswordField name='currentPassword' label='Current Password' showKey='current' />
					<PasswordField name='newPassword' label='New Password' showKey='new' />
					<PasswordField name='confirmPassword' label='Confirm New Password' showKey='confirm' />

					<div className='flex space-x-3 pt-2'>
						<button type='submit' disabled={loading} className='btn-primary flex-1'>
							{loading ? "Changing..." : "Change Password"}
						</button>
						<button
							type='button'
							onClick={() => navigate("/profile")}
							className='btn-secondary flex-1'>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ChangePassword;
