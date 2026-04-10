import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI } from '../../services/api';
import { getStatusBadge, getPriorityBadge } from '../../utils/badges';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {    try {
      const response = await ticketAPI.getAll();
      const ticketsData = response.data.data;
      setTickets(ticketsData);
      setStats({
        total: ticketsData.length,
        open: ticketsData.filter(t => t.status === 'Open').length,
        inProgress: ticketsData.filter(t => t.status === 'In Progress').length,
        closed: ticketsData.filter(t => t.status === 'Closed').length,
      });
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {user?.role === 'admin' ? 'Admin Dashboard' : 'Team Dashboard'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Tickets</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="text-indigo-500 text-3xl">📋</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Open</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
            </div>
            <div className="text-yellow-500 text-3xl">🟡</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="text-blue-500 text-3xl">🔵</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Closed</p>
              <p className="text-3xl font-bold text-green-600">{stats.closed}</p>
            </div>
            <div className="text-green-500 text-3xl">✅</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Issue Type</th>
                <th className="text-left py-3 px-4">Priority</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Submitter</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">#{ticket.ticketId}</td>
                  <td className="py-3 px-4">{ticket.issueType}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{ticket.submitterId?.name || 'Unknown'}</td>
                  <td className="py-3 px-4">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Link to={`/tickets/${ticket._id}`} className="text-indigo-600 hover:text-indigo-800">
                      View
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
