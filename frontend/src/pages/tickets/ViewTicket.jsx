import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ViewTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await ticketAPI.getOne(id);
      setTicket(response.data.data);
      setComments(response.data.comments || []);
    } catch (error) {
      toast.error('Failed to load ticket');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmitting(true);
    try {
      await ticketAPI.addComment(id, { commentText });
      toast.success('Comment added');
      setCommentText('');
      fetchTicket();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
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

  const getPriorityBadge = (priority) => {
    const badges = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-orange-100 text-orange-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!ticket) return <div className="text-center py-8">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ticket #{ticket.ticketId}</h1>
        <div className="space-x-2">
          {(user?.role === 'admin' || user?.role === 'senior_officer') && (
            <Link to={`/tickets/${id}/manage`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
              Manage Ticket
            </Link>
          )}
          {(user?.role === 'submitter' && (ticket.status === 'Open' || ticket.status === 'In Progress')) && (
            <Link to={`/tickets/${id}/edit`} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
              Edit Ticket
            </Link>
          )}
          <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
            Back
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Issue Type:</strong> {ticket.issueType}</div>
          <div><strong>Priority:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(ticket.priority)}`}>{ticket.priority}</span></div>
          <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(ticket.status)}`}>{ticket.status}</span></div>
          <div><strong>Submitter:</strong> {ticket.submitterId?.name}</div>
          <div><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
          <div><strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</div>
        </div>
        <div className="mt-4">
          <strong>Description:</strong>
          <p className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">{ticket.description}</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-2"
            rows="3"
            placeholder="Add a comment..."
          />
          <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
        
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b pb-3">
              <div className="flex justify-between mb-2">
                <strong>{comment.authorId?.name}</strong>
                <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p>{comment.commentText}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-center">No comments yet</p>}
        </div>
      </div>
    </div>
  );
};

export default ViewTicket;
