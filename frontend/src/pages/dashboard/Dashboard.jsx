import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI } from '../../services/api';
import { getStatusBadge, getPriorityBadge } from '../../utils/badges';
import { TicketIcon, CircleDot, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
	<div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center justify-between'>
		<div>
			<p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>{label}</p>
			<p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
		</div>
		<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
			<Icon className={`h-6 w-6 ${iconColor}`} />
		</div>
	</div>
);

const Dashboard = () => {
	const { user } = useAuth();
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });

	useEffect(() => { fetchTickets(); }, []);

	const fetchTickets = async () => {
		try {
			const response = await ticketAPI.getAll();
			const data = response.data.data;
			setTickets(data);
			setStats({
				total: data.length,
				open: data.filter(t => t.status === 'Open').length,
				inProgress: data.filter(t => t.status === 'In Progress').length,
				closed: data.filter(t => t.status === 'Closed').length,
			});
		} catch {
			toast.error('Failed to load tickets');
		} finally {
			setLoading(false);
		}
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
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
						{user?.role === 'admin' ? 'Admin Dashboard' : 'Team Dashboard'}
					</h1>
					<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
						Overview of all support tickets
					</p>
				</div>
			</div>

			{/* Stat cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatCard label='Total Tickets' value={stats.total}
					icon={TicketIcon}
					iconBg='bg-indigo-100 dark:bg-indigo-900/30'
					iconColor='text-indigo-600 dark:text-indigo-400'
					valueColor='text-gray-900 dark:text-white' />
				<StatCard label='Open' value={stats.open}
					icon={CircleDot}
					iconBg='bg-yellow-100 dark:bg-yellow-900/30'
					iconColor='text-yellow-600 dark:text-yellow-400'
					valueColor='text-yellow-600 dark:text-yellow-400' />
				<StatCard label='In Progress' value={stats.inProgress}
					icon={Clock}
					iconBg='bg-blue-100 dark:bg-blue-900/30'
					iconColor='text-blue-600 dark:text-blue-400'
					valueColor='text-blue-600 dark:text-blue-400' />
				<StatCard label='Closed' value={stats.closed}
					icon={CheckCircle2}
					iconBg='bg-green-100 dark:bg-green-900/30'
					iconColor='text-green-600 dark:text-green-400'
					valueColor='text-green-600 dark:text-green-400' />
			</div>

			{/* Tickets table */}
			<div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden'>
				<div className='px-6 py-4 border-b border-gray-100 dark:border-gray-700'>
					<h2 className='text-base font-semibold text-gray-900 dark:text-white'>Recent Tickets</h2>
				</div>
				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead className='bg-gray-50 dark:bg-gray-700/50'>
							<tr>
								{['Ticket ID', 'Issue Type', 'Priority', 'Status', 'Submitter', 'Created', ''].map(h => (
									<th key={h} className='text-left py-3.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{tickets.length === 0 ? (
								<tr>
									<td colSpan={7} className='text-center py-12 text-gray-400'>No tickets found</td>
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
									<td className='py-3.5 px-4 text-gray-700 dark:text-gray-300'>{ticket.submitterId?.name || '—'}</td>
									<td className='py-3.5 px-4 text-gray-500 dark:text-gray-400'>
										{new Date(ticket.createdAt).toLocaleDateString()}
									</td>
									<td className='py-3.5 px-4'>
										<Link to={`/tickets/${ticket._id}`}
											className='inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 text-sm font-medium'>
											View <ExternalLink className='h-3 w-3' />
										</Link>
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

export default Dashboard;
