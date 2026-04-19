import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Shield, Plus, X, Eye, EyeOff } from "lucide-react";

const AdminSeniorOfficers = () => {
	const [officers, setOfficers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		phoneNumber: "",
		teamId: "",
	});
	const [teams, setTeams] = useState([]);

	useEffect(() => {
		fetchOfficers();
	}, []);

	const fetchOfficers = async () => {
		try {
			const response = await adminAPI.getSeniorOfficers();
			setOfficers(response.data.data);
		} catch (error) {
			toast.error("Failed to load senior officers");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleCreate = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			await adminAPI.registerSeniorOfficer(formData);
			toast.success("Senior officer created successfully");
			setShowForm(false);
			setFormData({ name: "", email: "", password: "", phoneNumber: "", teamId: "" });
			fetchOfficers();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create senior officer");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = (officerId) => {
		toast((t) => (
			<div className='flex flex-col gap-2'>
				<p className='font-medium'>Remove this senior officer?</p>
				<div className='flex gap-2'>
					<button
						onClick={async () => {
							toast.dismiss(t.id);
							try {
								await adminAPI.deleteUser(officerId);
								toast.success("Senior officer removed");
								fetchOfficers();
							} catch (error) {
								toast.error(error.response?.data?.message || "Failed to remove officer");
							}
						}}
						className='bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded'>
						Remove
					</button>
					<button
						onClick={() => toast.dismiss(t.id)}
						className='bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded'>
						Cancel
					</button>
				</div>
			</div>
		), { duration: Infinity });
	};

	if (loading) return <div className='flex justify-center items-center h-64'>Loading...</div>;

	return (
		<div>
			<div className='flex justify-between items-center mb-6'>
				<div className='flex items-center space-x-2'>
					<Shield className='h-7 w-7 text-indigo-600' />
					<h1 className='text-3xl font-bold'>Senior Officers</h1>
				</div>
				<button onClick={() => setShowForm(!showForm)} className='btn-primary'>
					{showForm ? <X className='h-4 w-4 mr-2' /> : <Plus className='h-4 w-4 mr-2' />}
					{showForm ? "Cancel" : "Add Officer"}
				</button>
			</div>

			{/* Create form */}
			{showForm && (
				<div className='card mb-6'>
					<h2 className='text-lg font-semibold mb-4'>Create Senior Officer</h2>
					<form onSubmit={handleCreate} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Full Name *</label>
							<input name='name' value={formData.name} onChange={handleChange} className='input' placeholder='Full name' required />
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Email *</label>
							<input name='email' type='email' value={formData.email} onChange={handleChange} className='input' placeholder='Email address' required />
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Password *</label>
							<div className='relative'>
								<input
									name='password'
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={handleChange}
									className='input pr-10'
									placeholder='Password'
									required
									minLength={6}
								/>
								<button type='button' onClick={() => setShowPassword(!showPassword)}
									className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400'>
									{showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
								</button>
							</div>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Phone Number</label>
							<input name='phoneNumber' value={formData.phoneNumber} onChange={handleChange} className='input' placeholder='+1234567890' />
						</div>
						<div className='md:col-span-2'>
							<button type='submit' disabled={submitting} className='btn-primary'>
								{submitting ? "Creating..." : "Create Senior Officer"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Officers list */}
			<div className='card p-0 overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='bg-gray-50 dark:bg-gray-700'>
							<tr>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Name</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Email</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Phone</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Team</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
							{officers.map((officer) => (
								<tr key={officer._id} className='hover:bg-gray-50 dark:hover:bg-gray-700/50'>
									<td className='py-3 px-4 font-medium text-gray-900 dark:text-white'>{officer.name}</td>
									<td className='py-3 px-4 text-gray-600 dark:text-gray-400'>{officer.email}</td>
									<td className='py-3 px-4 text-gray-600 dark:text-gray-400'>{officer.phoneNumber || "—"}</td>
									<td className='py-3 px-4 text-gray-600 dark:text-gray-400'>
										{officer.teamId?.teamName || <span className='text-yellow-600 text-sm'>No team assigned</span>}
									</td>
									<td className='py-3 px-4'>
										<button
											onClick={() => handleDelete(officer._id)}
											className='text-red-600 hover:text-red-800 text-sm hover:underline'>
											Remove
										</button>
									</td>
								</tr>
							))}
							{officers.length === 0 && (
								<tr>
									<td colSpan={5} className='py-8 text-center text-gray-500'>
										No senior officers yet. Add one above.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default AdminSeniorOfficers;
