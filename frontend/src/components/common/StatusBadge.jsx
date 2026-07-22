const statusColors = {
  'New': 'bg-primary/20 text-primary border-primary/30',
  'Contacted': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Qualified': 'bg-purple-100 text-purple-700 border-purple-200',
  'Proposal': 'bg-orange-100 text-orange-700 border-orange-200',
  'Closed Won': 'bg-green-100 text-green-700 border-green-200',
  'Closed Lost': 'bg-red-100 text-red-700 border-red-200',
};

const StatusBadge = ({ status }) => {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {status === 'New' ? '🟢' : ''} {status}
    </span>
  );
};

export default StatusBadge;