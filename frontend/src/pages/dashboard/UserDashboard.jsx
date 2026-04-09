import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserDashboard = () => {
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
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await ticketAPI.delete(id);
      toast.success('Ticket deleted successfully');
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Open': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Closed': 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Link 
          to="/tickets/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          + New Ticket
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Issue Type</th>
                <th className="text-left py-3 px-4">Priority</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">#{ticket.ticketId}</td>
                  <td className="py-3 px-4">{ticket.issueType}</td>
                  <td className="py-3 px-4">{ticket.priority}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link to={`/tickets/${ticket._id}`} className="text-blue-600 hover:text-blue-800">
                        View
                      </Link>
                      {(ticket.status === 'Open' || ticket.status === 'In Progress') && (
                        <Link to={`/tickets/${ticket._id}/edit`} className="text-yellow-600 hover:text-yellow-800">
                          Edit
                        </Link>
                      )}
                      <button onClick={() => handleDelete(ticket._id)} className="text-red-600 hover:text-red-800">
                        Delete
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
