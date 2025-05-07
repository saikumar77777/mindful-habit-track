
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, ChartLine, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompletionChart from '@/components/analytics/CompletionChart';
import TrendChart from '@/components/analytics/TrendChart';
import HabitComparisonChart from '@/components/analytics/HabitComparisonChart';
import DayAnalysisChart from '@/components/analytics/DayAnalysisChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getItem, setItem } from '@/lib/local-storage';

// Time range options for analytics
type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const AnalyticsPage: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Load the last selected time range from localStorage
  const [timeRange, setTimeRange] = useState<TimeRange>(
    getItem('analytics_range', 'week') as TimeRange
  );

  // Save time range selection to localStorage
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    setItem('analytics_range', range);
  };
  
  // Mock data - we'll replace this with actual data later
  const mockData = {
    completionRate: 68,
    streakData: [5, 7, 2, 8, 6, 9, 4],
    habitComparison: [
      { name: 'Meditation', completion: 90 },
      { name: 'Exercise', completion: 75 },
      { name: 'Reading', completion: 60 },
      { name: 'Water', completion: 85 },
    ],
    bestDays: [
      { name: 'Mon', value: 82 },
      { name: 'Tue', value: 65 },
      { name: 'Wed', value: 78 },
      { name: 'Thu', value: 90 },
      { name: 'Fri', value: 85 },
      { name: 'Sat', value: 50 },
      { name: 'Sun', value: 55 },
    ]
  };

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Analytics</h1>
      <p className="text-muted-foreground mb-8">Track your progress and analyze your habits</p>

      {/* Time Range Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('month')}
          >
            Month
          </Button>
          <Button 
            variant={timeRange === 'quarter' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('quarter')}
          >
            Quarter
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('year')}
          >
            Year
          </Button>
          <Button 
            variant={timeRange === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('all')}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Charts */}
      {isMobile ? (
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
            <CompletionChart data={mockData.completionRate} />
            <HabitComparisonChart data={mockData.habitComparison} />
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <TrendChart data={mockData.streakData} timeRange={timeRange} />
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-6">
            <DayAnalysisChart data={mockData.bestDays} />
          </TabsContent>
        </Tabs>
      ) : (
        // Desktop layout with grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompletionChart data={mockData.completionRate} />
          <HabitComparisonChart data={mockData.habitComparison} />
          <TrendChart data={mockData.streakData} timeRange={timeRange} />
          <DayAnalysisChart data={mockData.bestDays} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
