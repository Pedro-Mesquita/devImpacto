import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-prato-dark">{title}</h3>
    {action && <div>{action}</div>}
  </div>
);

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'warning';
  icon: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, trendType = 'positive', icon }) => {
  const trendColors = {
    positive: 'text-prato-green',
    negative: 'text-red-500',
    warning: 'text-prato-orange'
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-prato-muted mb-1">{label}</p>
          <h4 className="text-2xl font-bold text-prato-dark">{value}</h4>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trendColors[trendType]}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-prato-light rounded-lg text-prato-dark">
          {icon}
        </div>
      </div>
    </Card>
  );
};