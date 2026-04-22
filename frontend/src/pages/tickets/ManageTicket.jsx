import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ticketAPI, adminAPI } from "../../services/api";
import { getStatusBadge, getPriorityBadge } from "../../utils/badges";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Clock } from "lucide-react";

const ManageTicket = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();

	const [ticket, setTicket] = useState(null);
	const [history, setHistory] = useState([]);
	const [teams, setTeams] = useState([]);
	const [officers, setOfficers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		status: "",
		priority: "",
		teamId: "",
		assignedTo: "",
	});

	useEffect(() => {
		fetchData();
	}, [id]);

	// When team changes, load officers for that team
	useEffect(() => {
		if (formData.teamId) {
			fetchOfficers(formData.teamId);
		} else {
			setOfficers([]);
		}
	}, [formData.teamId]);

	const fetchData = async () => {
		try {
			const [ticketRes, teamsRes] = await Promise.all([
				ticketAPI.getOne(id),
				adminAPI.getTeams(),
			]);

			const { ticket, history } = ticketRes.data.data;
			setTicket(ticket);
			setHistory(history || []);
			setTeams(teamsRes.data.data);

			// Auto-suggest team based on issue type if not already assigned
			const suggestedTeam = teamsRes.data.data.find(
				t => t.teamName === ticket.issueType
			);

			setFormData({
				status: ticket.status,
				priority: ticket.priority,
				teamId: ticket.teamId?._id || suggestedTeam?._id || "",
				assignedTo: ticket.assignedTo?._id || "",
			});

			const teamToLoad = ticket.teamId?._id || suggestedTeam?._id;
			if (teamToLoad) {
				fetchOfficers(teamToLoad);
			}
		} catch (error) {
			toast.error("Failed to load ticket");
			navigate("/dashboard");
		} finally {
			setLoading(false);
		}
	};

	const fetchOfficers = async (teamId) => {
		try {
			const response = await adminAPI.getOfficersByTeam(teamId);
			setOfficers(response.data.data);
		} catch {
			setOfficers([]);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
			// Reset assignedTo when team changes
			...(name === "teamId" ? { assignedTo: "" } : {}),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			await ticketAPI.update(id, formData);
			toast.success("Ticket updated successfully");
			navigate(`/tickets/${id}`);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update ticket");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className='flex justify-center items-center h-64'>Loading...</div>;
	if (!ticket) return null;

	const statuses = ["Open", "In Progress", "Closed"];
	const priorities = ["Low", "Medium", "High"];

	return (
		<div className='max-w-4xl mx-auto'>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<Link
						to={`/tickets/${id}`}
						className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2'>
						<ArrowLeft className='h-4 w-4 mr-1' /> Back to Ticket
					</Link>
					<h1 className='text-3xl font-bold'>
						Manage Ticket{" "}
						<span className='text-indigo-600'>#{ticket.ticketId}</span>
					</h1>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left — ticket info summary */}
				<div className='lg:col-span-1 space-y-4'>
					<div className='card'>
						<h2 className='font-semibold text-gray-700 dark:text-gray-300 mb-3'>Ticket Info</h2>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-gray-500'>Type</span>
								<span className='font-medium'>{ticket.issueType}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-500'>Submitter</span>
								<span className='font-medium'>{ticket.submitterId?.name}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-500'>Status</span>
								<span className={`badge ${getStatusBadge(ticket.status)}`}>
									{ticket.status}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-500'>Priority</span>
								<span className={`badge ${getPriorityBadge(ticket.priority)}`}>
									{ticket.priority}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-500'>Created</span>
								<span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
							</div>
						</div>
					</div>

					{/* Status history */}
					<div className='card'>
						<h2 className='font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center'>
							<Clock className='h-4 w-4 mr-2' /> Status History
						</h2>
						{history.length === 0 ? (
							<p className='text-sm text-gray-400'>No status changes yet</p>
						) : (
							<div className='space-y-3'>
								{history.map((h) => (
									<div key={h._id} className='text-sm border-l-2 border-indigo-200 pl-3'>
										<p className='font-medium text-gray-700 dark:text-gray-300'>
											<span className={`badge ${getStatusBadge(h.oldStatus)} mr-1`}>
												{h.oldStatus}
											</span>
											→
											<span className={`badge ${getStatusBadge(h.newStatus)} ml-1`}>
												{h.newStatus}
											</span>
										</p>
										<p className='text-gray-400 text-xs mt-1'>
											by {h.userId?.name} · {new Date(h.createdAt).toLocaleString()}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Right — management form */}
				<div className='lg:col-span-2'>
					<div className='card'>
						<h2 className='font-semibold text-gray-700 dark:text-gray-300 mb-5'>
							Update Ticket
						</h2>
						<form onSubmit={handleSubmit} className='space-y-5'>
							{/* Status */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
									Status
								</label>
								<select
									name='status'
									value={formData.status}
									onChange={handleChange}
									className='input'>
									{statuses.map((s) => (
										<option key={s} value={s}>{s}</option>
									))}
								</select>
							</div>

							{/* Priority */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
									Priority
								</label>
								<select
									name='priority'
									value={formData.priority}
									onChange={handleChange}
									className='input'>
									{priorities.map((p) => (
										<option key={p} value={p}>{p}</option>
									))}
								</select>
							</div>

							{/* Team — admin only */}
							{user?.role === "admin" && (
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
										Assign Department
									</label>
									<select
										name='teamId'
										value={formData.teamId}
										onChange={handleChange}
										className='input'>
										<option value=''>— Unassigned —</option>
										{teams.map((t) => (
											<option key={t._id} value={t._id}>
												{t.teamName}
												{t.teamName === ticket?.issueType ? ' ✓ (matches issue type)' : ''}
											</option>
										))}
									</select>
									{formData.teamId && (
										<p className='mt-1 text-xs text-gray-400'>
											The assigned officer will be responsible for resolving this ticket
										</p>
									)}
								</div>
							)}

							{/* Assign Officer */}
							{formData.teamId && (
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
										Assign Officer
									</label>
									<select
										name='assignedTo'
										value={formData.assignedTo}
										onChange={handleChange}
										className='input'>
										<option value=''>— Unassigned —</option>
										{officers.map((o) => (
											<option key={o._id} value={o._id}>{o.name}</option>
										))}
									</select>
									{officers.length === 0 && (
										<p className='mt-1 text-xs text-yellow-600'>
											No officers found for this team
										</p>
									)}
								</div>
							)}

							<div className='flex space-x-3 pt-2'>
								<button type='submit' disabled={submitting} className='btn-primary flex-1'>
									<Save className='h-4 w-4 mr-2' />
									{submitting ? "Saving..." : "Save Changes"}
								</button>
								<button
									type='button'
									onClick={() => navigate(`/tickets/${id}`)}
									className='btn-secondary flex-1'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ManageTicket;
