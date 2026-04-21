import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import { getStatusBadge, getPriorityBadge } from '../../utils/badges';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => { fetchTickets(); }, []);

	const fetchTickets = async () => {
		try {
			const response = await ticketAPI.getAll();
			setTickets(response.data.data);
		} catch {
			toast.error('Failed to load tickets');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (id) => {
		toast((t) => (
			<div className='flex flex-col gap-3'>
				<div>
					<p className='font-semibold text-gray-900'>Delete this ticket?</p>
					<p className='text-sm text-gray-500 mt-0.5'>This action cannot be undone.</p>
				</div>
				<div className='flex gap-2'>
					<button
						onClick={async () => {
							toast.dismiss(t.id);
							try {
								await ticketAPI.delete(id);
								toast.success('Ticket deleted');
								fetchTickets();
							} catch (error) {
								toast.error(error.response?.data?.message || 'Failed to delete');
							}
						}}
						className='bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg font-medium'>
						Delete
					</button>
					<button
						onClick={() => toast.dismiss(t.id)}
						className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg font-medium'>
						Cancel
					</button>
				</div>
			</div>
		), { duration: Infinity });
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>My Tickets</h1>
					<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
						{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total
					</p>
				</div>
				<Link to='/tickets/new' className='btn-primary'>
					<Plus className='h-4 w-4 mr-1.5' /> New Ticket
				</Link>
			</div>

			{/* Table */}
			<div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead className='bg-gray-50 dark:bg-gray-700/50'>
							<tr>
								{['Ticket ID', 'Issue Type', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
									<th key={h} className='text-left py-3.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{tickets.length === 0 ? (
								<tr>
									<td colSpan={6} className='text-center py-16'>
										<div className='flex flex-col items-center gap-3'>
											<div className='w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center'>
												<Plus className='h-6 w-6 text-gray-400' />
											</div>
											<div>
												<p className='font-medium text-gray-900 dark:text-white'>No tickets yet</p>
												<p className='text-sm text-gray-500 mt-1'>Submit your first support ticket</p>
											</div>
											<Link to='/tickets/new' className='btn-primary mt-1'>
												<Plus className='h-4 w-4 mr-1.5' /> New Ticket
											</Link>
										</div>
									</td>
								</tr>
							) : tickets.map((ticket) => (
								<tr key={ticket._id} className='border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors'>
									<td className='py-3.5 px-4 font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400'>
										#{ticket.ticketId}
									</td>
									<td className='py-3.5 px-4 font-medium text-gray-900 dark:text-white'>{ticket.issueType}</td>
									<td className='py-3.5 px-4'>
										<span className={`badge ${getPriorityBadge(ticket.priority)}`}>{ticket.priority}</span>
									</td>
									<td className='py-3.5 px-4'>
										<span className={`badge ${getStatusBadge(ticket.status)}`}>{ticket.status}</span>
									</td>
									<td className='py-3.5 px-4 text-gray-500 dark:text-gray-400'>
										{new Date(ticket.createdAt).toLocaleDateString()}
									</td>
									<td className='py-3.5 px-4'>
										<div className='flex items-center gap-1'>
											<Link to={`/tickets/${ticket._id}`}
												className='p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors' title='View'>
												<Eye className='h-4 w-4' />
											</Link>
											{(ticket.status === 'Open' || ticket.status === 'In Progress') && (
												<Link to={`/tickets/${ticket._id}/edit`}
													className='p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors' title='Edit'>
													<Pencil className='h-4 w-4' />
												</Link>
											)}
											<button onClick={() => handleDelete(ticket._id)}
												className='p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors' title='Delete'>
												<Trash2 className='h-4 w-4' />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default UserDashboard;
