/**
 * Returns Tailwind CSS classes for a ticket status badge
 */
export const getStatusBadge = (status) => {
    const badges = {
        'Open': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Closed': 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Returns Tailwind CSS classes for a ticket priority badge
 */
export const getPriorityBadge = (priority) => {
    const badges = {
        'High': 'bg-red-100 text-red-800',
        'Medium': 'bg-orange-100 text-orange-800',
        'Low': 'bg-green-100 text-green-800',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
};
