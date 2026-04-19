import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Trash2, Users, Search } from "lucide-react";

const AdminUsers = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const response = await adminAPI.getUsers();
			setUsers(response.data.data);
		} catch (error) {
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (userId) => {
		toast((t) => (
			<div className='flex flex-col gap-2'>
				<p className='font-medium'>Delete this user?</p>
				<p className='text-sm text-gray-500'>This cannot be undone.</p>
				<div className='flex gap-2'>
					<button
						onClick={async () => {
							toast.dismiss(t.id);
							try {
								await adminAPI.deleteUser(userId);
								toast.success("User deleted");
								fetchUsers();
							} catch (error) {
								toast.error(error.response?.data?.message || "Failed to delete user");
							}
						}}
						className='bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded'>
						Delete
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

	const getRoleBadge = (role) => {
		const styles = {
			admin: "bg-purple-100 text-purple-800",
			senior_officer: "bg-blue-100 text-blue-800",
			submitter: "bg-gray-100 text-gray-800",
		};
		return styles[role] || "bg-gray-100 text-gray-800";
	};

	const filtered = users.filter(
		(u) =>
			u.name.toLowerCase().includes(search.toLowerCase()) ||
			u.email.toLowerCase().includes(search.toLowerCase())
	);

	if (loading) return <div className='flex justify-center items-center h-64'>Loading...</div>;

	return (
		<div>
			<div className='flex justify-between items-center mb-6'>
				<div className='flex items-center space-x-2'>
					<Users className='h-7 w-7 text-indigo-600' />
					<h1 className='text-3xl font-bold'>Manage Users</h1>
				</div>
				<span className='text-sm text-gray-500'>{users.length} total users</span>
			</div>

			{/* Search */}
			<div className='relative mb-4'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
				<input
					type='text'
					placeholder='Search by name or email...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className='input pl-9'
				/>
			</div>

			<div className='card p-0 overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='bg-gray-50 dark:bg-gray-700'>
							<tr>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Name</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Email</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Role</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Team</th>
								<th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
							{filtered.map((u) => (
								<tr key={u._id} className='hover:bg-gray-50 dark:hover:bg-gray-700/50'>
									<td className='py-3 px-4 font-medium text-gray-900 dark:text-white'>{u.name}</td>
									<td className='py-3 px-4 text-gray-600 dark:text-gray-400'>{u.email}</td>
									<td className='py-3 px-4'>
										<span className={`badge ${getRoleBadge(u.role)}`}>
											{u.role.replace("_", " ")}
										</span>
									</td>
									<td className='py-3 px-4 text-gray-600 dark:text-gray-400'>
										{u.teamId?.teamName || "—"}
									</td>
									<td className='py-3 px-4'>
										{u.role !== "admin" && (
											<button
												onClick={() => handleDelete(u._id)}
												className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'>
												<Trash2 className='h-4 w-4' />
											</button>
										)}
									</td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr>
									<td colSpan={5} className='py-8 text-center text-gray-500'>
										No users found
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

export default AdminUsers;
