
import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HabitHeatmapProps {
  month: Date;
  viewType: 'month' | 'year';
  selectedHabit: string;
  completionData: Record<string, Record<string, number>>;
  habits: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

const HabitHeatmap: React.FC<HabitHeatmapProps> = ({
  month,
  viewType,
  selectedHabit,
  completionData,
  habits,
  isLoading = false,
}) => {
  // Function to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDayOfMonth = getFirstDayOfMonth(year, monthIndex);
  
  // Create an array of day cells
  const dayElements = [];
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayElements.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dateString = date.toISOString().split('T')[0];
    const isToday = new Date().toISOString().split('T')[0] === dateString;
    
    let completionValue = 0;
    if (completionData[dateString]) {
      if (selectedHabit === 'all') {
        // Calculate average completion for all habits
        const values = Object.values(completionData[dateString]);
        completionValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      } else {
        // Get completion for selected habit
        completionValue = completionData[dateString][selectedHabit] || 0;
      }
    }

    // Determine cell color based on completion value
    const getCellColor = (value: number) => {
      if (value === 0) return 'bg-muted hover:bg-muted/80';
      if (value < 0.5) return 'bg-accent/30 hover:bg-accent/40';
      if (value < 0.8) return 'bg-accent/50 hover:bg-accent/60';
      return 'bg-accent/80 hover:bg-accent/90';
    };

    // Generate tooltip content
    const getTooltipContent = (date: Date, completionData: Record<string, number> | undefined) => {
      const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      if (!completionData) {
        return (
          <div className="text-center">
            <p className="font-medium">{dateLabel}</p>
            <p className="text-xs text-muted-foreground">No data available</p>
          </div>
        );
      }
      
      const completedCount = Object.values(completionData).filter(v => v === 1).length;
      const totalCount = Object.keys(completionData).length;
      
      return (
        <div className="text-center">
          <p className="font-medium">{dateLabel}</p>
          <p className="text-xs">
            {completedCount} of {totalCount} habits completed
          </p>
          {selectedHabit !== 'all' && (
            <p className="text-xs mt-1 font-medium">
              {completionData[selectedHabit] ? '✓ Completed' : '✗ Not completed'}
            </p>
          )}
        </div>
      );
    };

    dayElements.push(
      <TooltipProvider key={dateString}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'h-8 w-8 rounded-sm flex items-center justify-center cursor-pointer transition-colors',
                getCellColor(completionValue),
                isToday && 'ring-2 ring-primary'
              )}
            >
              <span className="text-xs font-medium">{day}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {getTooltipContent(date, completionData[dateString])}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Render loading skeleton if data is loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array(35).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="mb-4 flex justify-between text-xs text-muted-foreground">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayElements}
      </div>
      <div className="mt-6 flex justify-end items-center gap-2">
        <div className="text-xs text-muted-foreground">Less</div>
        <div className="h-3 w-3 rounded-sm bg-muted"></div>
        <div className="h-3 w-3 rounded-sm bg-accent/30"></div>
        <div className="h-3 w-3 rounded-sm bg-accent/50"></div>
        <div className="h-3 w-3 rounded-sm bg-accent/80"></div>
        <div className="text-xs text-muted-foreground">More</div>
      </div>
    </div>
  );
};

export default HabitHeatmap;
