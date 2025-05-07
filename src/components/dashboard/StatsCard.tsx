
import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  trend,
  trendValue,
  className,
}) => {
  return (
    <div className={cn('bg-card rounded-lg border p-4', className)}>
      <div className="flex flex-col">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="mt-1 flex items-baseline">
          <div className="text-2xl font-semibold">{value}</div>
          {trend && trendValue && (
            <span
              className={cn(
                'ml-2 text-xs',
                trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-destructive' : ''
              )}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
