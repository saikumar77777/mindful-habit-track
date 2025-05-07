
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TrendChartProps {
  data: number[];
  timeRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

const TrendChart: React.FC<TrendChartProps> = ({ data, timeRange }) => {
  // Convert the raw data to the format expected by recharts
  const formatData = () => {
    // For this example, we'll just use the days of the week
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return data.map((value, index) => ({
      day: labels[index % labels.length],
      value,
    }));
  };
  
  const chartData = formatData();
  
  // Get appropriate title based on time range
  const getTitle = () => {
    switch(timeRange) {
      case 'week': return 'Weekly Trend';
      case 'month': return 'Monthly Trend';
      case 'quarter': return 'Quarterly Trend';
      case 'year': return 'Yearly Trend';
      default: return 'All Time Trend';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ChartContainer
            config={{
              value: {
                label: "Completions",
                theme: {
                  light: "hsla(var(--primary), 0.8)",
                  dark: "hsla(var(--primary), 0.8)",
                },
              },
            }}
          >
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsla(var(--primary), 0.7)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsla(var(--primary), 0.7)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.3)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }} 
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsla(var(--primary), 1)" 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;
