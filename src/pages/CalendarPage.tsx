
import React, { useState } from 'react';
import HabitHeatmap from '@/components/calendar/HabitHeatmap';
import HabitSelect from '@/components/calendar/HabitSelect';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock habits data
const habits = [
  { id: '1', name: 'Morning meditation' },
  { id: '2', name: 'Read a book' },
  { id: '3', name: 'Exercise' },
  { id: '4', name: 'Drink water' },
];

// Mock habit completion data
// Format: { [YYYY-MM-DD]: { habitId: percentage } }
const mockCompletionData = {
  '2025-05-01': { '1': 1, '2': 1, '3': 0, '4': 1 }, // Day with mixed completion
  '2025-05-02': { '1': 1, '2': 1, '3': 1, '4': 1 }, // All completed
  '2025-05-03': { '1': 0, '2': 0, '3': 0, '4': 0 }, // None completed
  '2025-05-04': { '1': 1, '2': 0, '3': 1, '4': 0 }, // Half completed
  '2025-05-05': { '1': 1, '2': 1, '3': 0, '4': 1 },
  '2025-05-06': { '1': 0, '2': 1, '3': 1, '4': 1 },
  '2025-05-07': { '1': 0, '2': 0, '3': 0, '4': 0 }, // Current day (incomplete)
};

const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  
  const getMonthLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Habit Calendar</h1>
      <p className="text-muted-foreground mb-8">Track your consistency over time</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <HabitSelect
            habits={habits}
            selectedHabit={selectedHabit}
            onSelectHabit={setSelectedHabit}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewType('month')}
            className={viewType === 'month' ? 'bg-secondary/30' : ''}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewType('year')}
            className={viewType === 'year' ? 'bg-secondary/30' : ''}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <h2 className="text-lg font-medium">
          {getMonthLabel(currentMonth)}
        </h2>
        
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Heatmap */}
      <HabitHeatmap
        month={currentMonth}
        viewType={viewType}
        selectedHabit={selectedHabit}
        completionData={mockCompletionData}
        habits={habits}
      />
    </div>
  );
};

export default CalendarPage;
