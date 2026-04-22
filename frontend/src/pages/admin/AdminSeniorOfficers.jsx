import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Shield, Plus, X, Eye, EyeOff, Users } from "lucide-react";

const AdminSeniorOfficers = () => {
	const [officers, setOfficers] = useState([]);
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "", email: "", password: "", phoneNumber: "", teamId: "",
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [officersRes, teamsRes] = await Promise.all([
				adminAPI.getSeniorOfficers(),
				adminAPI.getTeams(),
			]);
			setOfficers(officersRes.data.data);
			setTeams(teamsRes.data.data);
		} catch {
			toast.error("Failed to load data");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!formData.teamId) {
			toast.error("Please select a department team");
			return;
		}
		setSubmitting(true);
		try {
			await adminAPI.registerSeniorOfficer(formData);
			toast.success("Senior officer created successfully");
			setShowForm(false);
			setFormData({ name: "", email: "", password: "", phoneNumber: "", teamId: "" });
			fetchData();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create senior officer");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = (officerId, officerName) => {
		toast((t) => (
			<div className='flex flex-col gap-2'>
				<p className='font-medium'>Remove {officerName}?</p>
				<p className='text-sm text-gray-500'>They will lose access to the system.</p>
				<div className='flex gap-2'>
					<button
						onClick={async () => {
							toast.dismiss(t.id);
							try {
								await adminAPI.deleteUser(officerId);
								toast.success("Officer removed");
								fetchData();
							} catch (error) {
								toast.error(error.response?.data?.message || "Failed to remove");
							}
						}}
						className='bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg font-medium'>
						Remove
					</button>
					<button onClick={() => toast.dismiss(t.id)}
						className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg font-medium'>
						Cancel
					</button>
				</div>
			</div>
		), { duration: Infinity });
	};

	// Group officers by team for display
	const officersByTeam = teams.map(team => ({
		team,
		officer: officers.find(o => o.teamId?._id === team._id)
	}));

	if (loading) return (
		<div className='flex items-center justify-center h-64'>
			<div className='w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin' />
		</div>
	);

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Department Officers</h1>
					<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
						Each department has one responsible senior officer
					</p>
				</div>
				<button onClick={() => setShowForm(!showForm)} className='btn-primary'>
					{showForm ? <X className='h-4 w-4 mr-2' /> : <Plus className='h-4 w-4 mr-2' />}
					{showForm ? "Cancel" : "Add Officer"}
				</button>
			</div>

			{/* Create form */}
			{showForm && (
				<div className='card'>
					<h2 className='text-base font-semibold text-gray-900 dark:text-white mb-4'>
						Assign Officer to Department
					</h2>
					<form onSubmit={handleCreate} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{/* Department — required, shown first */}
						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								Department (Team) *
							</label>
							<select
								name='teamId'
								value={formData.teamId}
								onChange={handleChange}
								className='input'
								required>
								<option value=''>— Select a department —</option>
								{teams.map(team => {
									const hasOfficer = officers.some(o => o.teamId?._id === team._id);
									return (
										<option key={team._id} value={team._id} disabled={hasOfficer}>
											{team.teamName} {hasOfficer ? '(already assigned)' : ''}
										</option>
									);
								})}
							</select>
							{formData.teamId && (
								<p className='mt-1 text-xs text-indigo-600'>
									This officer will only see tickets assigned to the{' '}
									<strong>{teams.find(t => t._id === formData.teamId)?.teamName}</strong> department
								</p>
							)}
						</div>

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
									placeholder='Min. 6 characters'
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
								{submitting ? "Creating..." : "Create Officer"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Department cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{officersByTeam.map(({ team, officer }) => (
					<div key={team._id} className='card'>
						<div className='flex items-start justify-between mb-3'>
							<div className='flex items-center gap-2'>
								<div className='w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center'>
									<Shield className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
								</div>
								<div>
									<p className='font-semibold text-gray-900 dark:text-white text-sm'>{team.teamName}</p>
									<p className='text-xs text-gray-400'>Department</p>
								</div>
							</div>
							{officer ? (
								<span className='badge bg-green-100 text-green-700'>Active</span>
							) : (
								<span className='badge bg-yellow-100 text-yellow-700'>Vacant</span>
							)}
						</div>

						<p className='text-xs text-gray-500 dark:text-gray-400 mb-4'>{team.description}</p>

						{officer ? (
							<div className='border-t border-gray-100 dark:border-gray-700 pt-3'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className='w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold'>
											{officer.name.charAt(0).toUpperCase()}
										</div>
										<div>
											<p className='text-sm font-medium text-gray-900 dark:text-white'>{officer.name}</p>
											<p className='text-xs text-gray-400'>{officer.email}</p>
										</div>
									</div>
									<button
										onClick={() => handleDelete(officer._id, officer.name)}
										className='text-xs text-red-500 hover:text-red-700 hover:underline'>
										Remove
									</button>
								</div>
							</div>
						) : (
							<div className='border-t border-gray-100 dark:border-gray-700 pt-3'>
								<button
									onClick={() => {
										setFormData(prev => ({ ...prev, teamId: team._id }));
										setShowForm(true);
										window.scrollTo({ top: 0, behavior: 'smooth' });
									}}
									className='text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1'>
									<Plus className='h-3.5 w-3.5' /> Assign Officer
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default AdminSeniorOfficers;
