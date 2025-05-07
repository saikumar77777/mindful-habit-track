import React, { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, ChartLine, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompletionChart from '@/components/analytics/CompletionChart';
import TrendChart from '@/components/analytics/TrendChart';
import HabitComparisonChart from '@/components/analytics/HabitComparisonChart';
import DayAnalysisChart from '@/components/analytics/DayAnalysisChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getItem, setItem } from '@/lib/local-storage';
import { useHabits } from '@/contexts/HabitContext';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from 'date-fns';

// Time range options for analytics
type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const AnalyticsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { habits, loading } = useHabits();
  
  // Load the last selected time range from localStorage
  const [timeRange, setTimeRange] = useState<TimeRange>(
    getItem('analytics_range', 'week') as TimeRange
  );

  // Save time range selection to localStorage
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    setItem('analytics_range', range);
  };

  // Calculate date range based on selected time range
  const dateRange = useMemo(() => {
    const end = endOfDay(new Date());
    let start: Date;

    switch (timeRange) {
      case 'week':
        start = subDays(end, 7);
        break;
      case 'month':
        start = subDays(end, 30);
        break;
      case 'quarter':
        start = subDays(end, 90);
        break;
      case 'year':
        start = subDays(end, 365);
        break;
      case 'all':
      default:
        start = new Date(0); // Beginning of time
    }

    return { start, end };
  }, [timeRange]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (loading || !habits.length) {
      return {
        completionRate: 0,
        streakData: [],
        habitComparison: [],
        bestDays: []
      };
    }

    // Get all days in the selected range
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    // Calculate completion rate
    const totalCompletions = habits.reduce((sum, habit) => {
      return sum + habit.completedDates.filter(date => {
        const completionDate = new Date(date);
        return completionDate >= dateRange.start && completionDate <= dateRange.end;
      }).length;
    }, 0);

    const totalPossibleCompletions = habits.reduce((sum, habit) => {
      return sum + days.filter(day => 
        habit.targetDays.includes(day.toLocaleDateString('en-US', { weekday: 'long' }))
      ).length;
    }, 0);

    const completionRate = totalPossibleCompletions > 0
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
      : 0;

    // Calculate streak data (last 7 days)
    const streakData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split('T')[0];
      
      const completions = habits.filter(habit => 
        habit.completedDates.includes(dateStr) &&
        habit.targetDays.includes(date.toLocaleDateString('en-US', { weekday: 'long' }))
      ).length;

      const total = habits.filter(habit =>
        habit.targetDays.includes(date.toLocaleDateString('en-US', { weekday: 'long' }))
      ).length;

      return total > 0 ? Math.round((completions / total) * 100) : 0;
    }).reverse();

    // Calculate habit comparison
    const habitComparison = habits.map(habit => {
      const completions = habit.completedDates.filter(date => {
        const completionDate = new Date(date);
        return completionDate >= dateRange.start && completionDate <= dateRange.end;
      }).length;

      const total = days.filter(day =>
        habit.targetDays.includes(day.toLocaleDateString('en-US', { weekday: 'long' }))
      ).length;

      return {
        name: habit.name,
        completion: total > 0 ? Math.round((completions / total) * 100) : 0
      };
    });

    // Calculate best days
    const dayNameMap = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
      Sun: 'Sunday',
    };
    const bestDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
      const fullDay = dayNameMap[day];
      const dayCompletions = habits.reduce((sum, habit) => {
        if (!habit.targetDays.includes(fullDay)) return sum;
        const completions = habit.completedDates.filter(date => {
          const completionDate = new Date(date);
          return completionDate >= dateRange.start && 
                 completionDate <= dateRange.end &&
                 completionDate.toLocaleDateString('en-US', { weekday: 'short' }) === day;
        }).length;
        return sum + completions;
      }, 0);

      const totalPossible = habits.reduce((sum, habit) => {
        if (!habit.targetDays.includes(fullDay)) return sum;
        const possibleCompletions = days.filter(d =>
          d.toLocaleDateString('en-US', { weekday: 'short' }) === day
        ).length;
        return sum + possibleCompletions;
      }, 0);

      return {
        name: day,
        value: totalPossible > 0 ? Math.round((dayCompletions / totalPossible) * 100) : 0
      };
    });

    return {
      completionRate,
      streakData,
      habitComparison,
      bestDays
    };
  }, [habits, loading, dateRange]);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeRangeChange('week')}
            className={timeRange === 'week' ? 'bg-secondary/30' : ''}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeRangeChange('month')}
            className={timeRange === 'month' ? 'bg-secondary/30' : ''}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeRangeChange('quarter')}
            className={timeRange === 'quarter' ? 'bg-secondary/30' : ''}
          >
            Quarter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeRangeChange('year')}
            className={timeRange === 'year' ? 'bg-secondary/30' : ''}
          >
            Year
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeRangeChange('all')}
            className={timeRange === 'all' ? 'bg-secondary/30' : ''}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Fallback for no data */}
      {(!loading && habits.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold mb-2">No analytics data available</h2>
          <p className="text-muted-foreground mb-4">You have no habits to analyze yet. Add some habits to start tracking your progress!</p>
          <Button onClick={() => window.location.href = '/tracker'}>Add Habit</Button>
        </div>
      ) : isMobile ? (
        // Mobile layout with tabs
        <Tabs defaultValue="summary">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="summary">
              <Star className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="trends">
              <ChartLine className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="breakdown">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Breakdown</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            <CompletionChart data={analyticsData.completionRate} />
            <HabitComparisonChart data={analyticsData.habitComparison} />
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <TrendChart data={analyticsData.streakData} timeRange={timeRange} />
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-6">
            <DayAnalysisChart data={analyticsData.bestDays} />
          </TabsContent>
        </Tabs>
      ) : (
        // Desktop layout with grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompletionChart data={analyticsData.completionRate} />
          <HabitComparisonChart data={analyticsData.habitComparison} />
          <TrendChart data={analyticsData.streakData} timeRange={timeRange} />
          <DayAnalysisChart data={analyticsData.bestDays} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
