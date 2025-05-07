
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HabitSelectProps {
  habits: Array<{ id: string; name: string }>;
  selectedHabit: string;
  onSelectHabit: (habitId: string) => void;
}

const HabitSelect: React.FC<HabitSelectProps> = ({
  habits,
  selectedHabit,
  onSelectHabit,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="habit-select" className="text-sm font-medium">
        Select Habit:
      </label>
      <Select value={selectedHabit} onValueChange={onSelectHabit}>
        <SelectTrigger className="w-[240px]" id="habit-select">
          <SelectValue placeholder="All Habits" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Habits</SelectItem>
          {habits.map((habit) => (
            <SelectItem key={habit.id} value={habit.id}>
              {habit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default HabitSelect;
