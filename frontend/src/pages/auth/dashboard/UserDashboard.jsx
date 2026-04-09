import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ticketAPI } from "../../services/api";
import { Ticket, Plus, Eye, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const UserDashboard = () => {
	const { user } = useAuth();
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchTickets();
	}, []);

	const fetchTickets = async () => {
		try {
			const response = await ticketAPI.getAll();
			setTickets(response.data.data);
		} catch (error) {
			toast.error("Failed to load tickets");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (
			!confirm(
				"Are you sure you want to delete this ticket? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			await ticketAPI.delete(id);
			toast.success("Ticket deleted successfully");
			fetchTickets();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete ticket");
		}
	};

	const getStatusBadge = (status) => {
		const badges = {
			Open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
			"In Progress":
				"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
			Closed:
				"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
		};
		return badges[status] || "bg-gray-100 text-gray-800";
	};

	const getPriorityBadge = (priority) => {
		const badges = {
			High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
			Medium:
				"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
			Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
		};
		return badges[priority] || "bg-gray-100 text-gray-800";
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
			</div>
		);
	}

	return (
		<div>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold'>My Tickets</h1>
				<Link
					to='/tickets/new'
					className='btn-primary flex items-center'>
					<Plus className='h-4 w-4 mr-2' />
					New Ticket
				</Link>
			</div>

			<div className='card'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='border-b dark:border-gray-700'>
								<th className='text-left py-3 px-4'>ID</th>
								<th className='text-left py-3 px-4'>Issue Type</th>
								<th className='text-left py-3 px-4'>Priority</th>
								<th className='text-left py-3 px-4'>Status</th>
								<th className='text-left py-3 px-4'>Created</th>
								<th className='text-left py-3 px-4'>Actions</th>
							</tr>
						</thead>
						<tbody>
							{tickets.map((ticket) => (
								<tr
									key={ticket._id}
									className='border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'>
									<td className='py-3 px-4'>#{ticket.ticketId}</td>
									<td className='py-3 px-4'>{ticket.issueType}</td>
									<td className='py-3 px-4'>
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
											{ticket.priority}
										</span>
									</td>
									<td className='py-3 px-4'>
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
											{ticket.status}
										</span>
									</td>
									<td className='py-3 px-4'>
										{new Date(ticket.createdAt).toLocaleDateString()}
									</td>
									<td className='py-3 px-4'>
										<div className='flex space-x-2'>
											<Link
												to={`/tickets/${ticket._id}`}
												className='text-blue-600 hover:text-blue-700'
												title='View'>
												<Eye className='h-4 w-4' />
											</Link>
											{(ticket.status === "Open" ||
												ticket.status === "In Progress") && (
												<Link
													to={`/tickets/${ticket._id}/edit`}
													className='text-yellow-600 hover:text-yellow-700'
													title='Edit'>
													<Edit className='h-4 w-4' />
												</Link>
											)}
											<button
												onClick={() => handleDelete(ticket._id)}
												className='text-red-600 hover:text-red-700'
												title='Delete'>
												<Trash2 className='h-4 w-4' />
											</button>
										</div>
									</td>
								</tr>
							))}
							{tickets.length === 0 && (
								<tr>
									<td
										colSpan='6'
										className='text-center py-8 text-gray-500'>
										No tickets found. Click "New Ticket" to create one.
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

export default UserDashboard;
