const QuickActionButton = ({ label, icon: Icon, color, onClick }) => {
  // If color is brand-green or primary, use primary color
  const isPrimary = color === 'brand-green' || color === 'primary';
  const textColor = isPrimary ? 'text-primary' : `text-${color}`;
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:shadow-soft hover:border-primary/30 transition-all duration-200 group w-full justify-center"
    >
      <Icon className={`w-4 h-4 ${textColor}`} />
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {label}
      </span>
    </button>
  );
};

export default QuickActionButton;