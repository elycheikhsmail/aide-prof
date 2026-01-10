import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  'data-testid'?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className = '', 'data-testid': testId }: StatCardProps) {
  return (
    <div data-testid={testId} className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="bg-blue-100 rounded-full p-3">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
