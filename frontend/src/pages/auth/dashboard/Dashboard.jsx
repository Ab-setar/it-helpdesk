import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ticketAPI } from "../../services/api";
import { Ticket, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
	const { user } = useAuth();
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		total: 0,
		open: 0,
		inProgress: 0,
		closed: 0,
	});

	useEffect(() => {
		fetchTickets();
	}, []);

	const fetchTickets = async () => {
		try {
			const response = await ticketAPI.getAll();
			const ticketsData = response.data.data;
			setTickets(ticketsData);

			// Calculate stats
			setStats({
				total: ticketsData.length,
				open: ticketsData.filter((t) => t.status === "Open").length,
				inProgress: ticketsData.filter((t) => t.status === "In Progress")
					.length,
				closed: ticketsData.filter((t) => t.status === "Closed").length,
			});
		} catch (error) {
			toast.error("Failed to load tickets");
		} finally {
			setLoading(false);
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
			<h1 className='text-3xl font-bold mb-6'>
				{user?.role === "admin" ? "Admin Dashboard" : "Team Dashboard"}
			</h1>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
				<div className='card'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-gray-500 dark:text-gray-400 text-sm'>
								Total Tickets
							</p>
							<p className='text-3xl font-bold'>{stats.total}</p>
						</div>
						<Ticket className='h-10 w-10 text-primary-500' />
					</div>
				</div>

				<div className='card'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-gray-500 dark:text-gray-400 text-sm'>Open</p>
							<p className='text-3xl font-bold text-yellow-600'>{stats.open}</p>
						</div>
						<AlertCircle className='h-10 w-10 text-yellow-500' />
					</div>
				</div>

				<div className='card'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-gray-500 dark:text-gray-400 text-sm'>
								In Progress
							</p>
							<p className='text-3xl font-bold text-blue-600'>
								{stats.inProgress}
							</p>
						</div>
						<Clock className='h-10 w-10 text-blue-500' />
					</div>
				</div>

				<div className='card'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-gray-500 dark:text-gray-400 text-sm'>Closed</p>
							<p className='text-3xl font-bold text-green-600'>
								{stats.closed}
							</p>
						</div>
						<CheckCircle className='h-10 w-10 text-green-500' />
					</div>
				</div>
			</div>

			{/* Tickets Table */}
			<div className='card'>
				<h2 className='text-xl font-semibold mb-4'>Recent Tickets</h2>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='border-b dark:border-gray-700'>
								<th className='text-left py-3 px-4'>ID</th>
								<th className='text-left py-3 px-4'>Issue Type</th>
								<th className='text-left py-3 px-4'>Priority</th>
								<th className='text-left py-3 px-4'>Status</th>
								<th className='text-left py-3 px-4'>Submitter</th>
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
										{ticket.submitterId?.name || "Unknown"}
									</td>
									<td className='py-3 px-4'>
										{new Date(ticket.createdAt).toLocaleDateString()}
									</td>
									<td className='py-3 px-4'>
										<Link
											to={`/tickets/${ticket._id}`}
											className='text-primary-600 hover:text-primary-700 inline-flex items-center'>
											<Eye className='h-4 w-4 mr-1' />
											View
										</Link>
									</td>
								</tr>
							))}
							{tickets.length === 0 && (
								<tr>
									<td
										colSpan='7'
										className='text-center py-8 text-gray-500'>
										No tickets found
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

export default Dashboard;
