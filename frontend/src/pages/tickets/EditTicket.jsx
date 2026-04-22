import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    priority: 'Medium',
    status: '',
  });

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await ticketAPI.getOne(id);
      const ticket = response.data.data;
      setFormData({
        issueType: ticket.issueType,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
      });
    } catch (error) {
      toast.error('Failed to load ticket');
      navigate('/user-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ticketAPI.update(id, formData);
      toast.success('Ticket updated successfully');
      navigate(`/tickets/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const issueTypes = ['Hardware', 'Software', 'Network', 'Account Access', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Ticket #{id}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Issue Type *</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/tickets/${id}`)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;
