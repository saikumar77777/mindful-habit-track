import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DayAnalysisData {
  name: string;
  value: number;
}

interface DayAnalysisChartProps {
  data: DayAnalysisData[];
}

const DayAnalysisChart: React.FC<DayAnalysisChartProps> = ({ data }) => {
  // Find the best day (highest value)
  const bestDay = data.reduce((prev, current) => {
    return (prev.value > current.value) ? prev : current;
  });

  // Transform data to include a color property
  const dataWithColor = data.map(item => ({
    ...item,
    fill: item.name === bestDay.name ? 'hsla(var(--primary), 0.8)' : 'hsla(var(--secondary), 0.6)'
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Best Days Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ChartContainer
            config={{
              value: {
                label: "Completion Rate",
                theme: {
                  light: "hsla(var(--secondary), 0.6)",
                  dark: "hsla(var(--secondary), 0.6)",
                },
              },
              bestDay: {
                label: "Best Day",
                theme: {
                  light: "hsla(var(--primary), 0.8)",
                  dark: "hsla(var(--primary), 0.8)",
                },
              },
            }}
          >
            <BarChart data={dataWithColor} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.3)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Completion Rate']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.375rem',
                }}
              />
              <Bar
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                name="Completion Rate"
                fillOpacity={0.8}
                // Use fill from data
                fill={({ payload }) => payload.fill}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm">
            <span className="font-medium">{bestDay.name}</span> is your most productive day at <span className="font-medium">{bestDay.value}%</span> completion
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayAnalysisChart;
