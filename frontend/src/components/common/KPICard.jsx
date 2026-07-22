
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, trend, trendLabel, color = 'primary' }) => {
  const isPositive = trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const isPrimary = color === 'brand-green' || color === 'primary';
  const textColor = isPrimary ? 'text-primary' : `text-${color}`;
  const bgColor = isPrimary ? 'bg-primary/10' : `bg-${color}/10`;

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100 hover:shadow-soft-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-3">
          <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-sm text-gray-500">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;