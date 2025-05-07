import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'highestStreak' | 'completedDates'>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  getCompletedDatesForHabit: (habitId: string) => string[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
  loading: boolean;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

// Calculate the current streak up to the most recent completion
const calculateCurrentStreak = (completedDates: string[], targetDays: string[]): number => {
  if (!completedDates.length) return 0;
  // Sort dates ascending
  const sortedDates = [...completedDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  let streak = 0;
  let prevDate: Date | null = null;
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!targetDays.includes(dayName)) continue;
    if (prevDate) {
      // Find the next expected date (skip non-target days)
      let nextExpected = new Date(prevDate);
      do {
        nextExpected.setDate(nextExpected.getDate() + 1);
        const nextDayName = nextExpected.toLocaleDateString('en-US', { weekday: 'long' });
        if (targetDays.includes(nextDayName)) break;
      } while (true);
      if (date.getTime() !== nextExpected.getTime()) {
        streak = 1;
      } else {
        streak++;
      }
    } else {
      streak = 1;
    }
    prevDate = date;
  }
  return streak;
};

// Calculate the highest streak from all completions
const calculateHighestStreak = (completedDates: string[], targetDays: string[]): number => {
  if (!completedDates.length) return 0;
  // Sort dates ascending
  const sortedDates = [...completedDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  let maxStreak = 0;
  let streak = 0;
  let prevDate: Date | null = null;
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!targetDays.includes(dayName)) continue;
    if (prevDate) {
      // Find the next expected date (skip non-target days)
      let nextExpected = new Date(prevDate);
      do {
        nextExpected.setDate(nextExpected.getDate() + 1);
        const nextDayName = nextExpected.toLocaleDateString('en-US', { weekday: 'long' });
        if (targetDays.includes(nextDayName)) break;
      } while (true);
      if (date.getTime() !== nextExpected.getTime()) {
        streak = 1;
      } else {
        streak++;
      }
    } else {
      streak = 1;
    }
    if (streak > maxStreak) maxStreak = streak;
    prevDate = date;
  }
  return maxStreak;
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load habits from Supabase on mount
  useEffect(() => {
    const fetchHabits = async () => {
      if (!user) {
        setHabits([]);
        setLoading(false);
        return;
      }

      try {
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id);

        if (habitsError) throw habitsError;

        const { data: completionsData, error: completionsError } = await supabase
          .from('habit_completions')
          .select('*')
          .in('habit_id', habitsData.map(h => h.id));

        if (completionsError) throw completionsError;

        // Process habits with their completions
        const processedHabits = habitsData.map(habit => {
          const habitCompletions = completionsData
            .filter(c => c.habit_id === habit.id)
            .map(c => c.completion_date);

          const streak = calculateCurrentStreak(habitCompletions, habit.target_days);
          const highestStreak = calculateHighestStreak(habitCompletions, habit.target_days);

          return {
            id: habit.id,
            name: habit.name,
            targetDays: habit.target_days,
            startDate: habit.start_date,
            completedDates: habitCompletions,
            streak,
            highestStreak
          };
        });

        setHabits(processedHabits);
      } catch (error) {
        console.error('Error fetching habits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [user]);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'streak' | 'highestStreak' | 'completedDates'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habitData.name,
          target_days: habitData.targetDays,
          start_date: habitData.startDate,
          streak: 0,
          highest_streak: 0
        })
        .select()
        .single();

      if (error) throw error;

      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        targetDays: data.target_days,
        startDate: data.start_date,
        completedDates: [],
        streak: 0,
        highestStreak: 0
      };

      setHabits(prev => [...prev, newHabit]);
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHabits(prev => prev.filter(habit => habit.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const isCompleted = habit.completedDates.includes(date);

      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completion_date', date);

        if (error) throw error;
      } else {
        // Add completion
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            completion_date: date
          });

        if (error) throw error;
      }

      // Update local state
      setHabits(prev => 
        prev.map(habit => {
          if (habit.id !== habitId) return habit;
          
          let updatedCompletedDates: string[];
          
          if (isCompleted) {
            updatedCompletedDates = habit.completedDates.filter(d => d !== date);
          } else {
            updatedCompletedDates = [...habit.completedDates, date];
          }
          
          const newStreak = calculateCurrentStreak(updatedCompletedDates, habit.targetDays);
          const newHighestStreak = Math.max(habit.highestStreak, newStreak);
          
          return {
            ...habit,
            completedDates: updatedCompletedDates,
            streak: newStreak,
            highestStreak: newHighestStreak
          };
        })
      );
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  };

  const getCompletedDatesForHabit = (habitId: string): string[] => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.completedDates : [];
  };

  const isHabitCompletedOnDate = (habitId: string, date: string): boolean => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.completedDates.includes(date) : false;
  };

  const value = {
    habits,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    getCompletedDatesForHabit,
    isHabitCompletedOnDate,
    loading
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};
