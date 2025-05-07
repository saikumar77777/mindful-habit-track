
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface HabitComparisonData {
  name: string;
  completion: number;
}

interface HabitComparisonChartProps {
  data: HabitComparisonData[];
}

const HabitComparisonChart: React.FC<HabitComparisonChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Habit Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ChartContainer
            config={{
              completion: {
                label: "Completion Rate",
                theme: {
                  light: "hsla(var(--accent), 0.8)",
                  dark: "hsla(var(--accent), 0.8)",
                },
              },
            }}
          >
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.3)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={70}
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
                  borderRadius: '0.375rem'
                }}
              />
              <Bar 
                dataKey="completion" 
                fill="hsla(var(--accent), 0.8)" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitComparisonChart;
