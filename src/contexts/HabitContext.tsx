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

const calculateStreak = (completedDates: string[], targetDays: string[]): number => {
  if (!completedDates.length) return 0;
  
  // Sort dates in descending order
  const sortedDates = [...completedDates].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Start from most recent date
  let currentDate = new Date(sortedDates[0]);
  currentDate.setHours(0, 0, 0, 0);
  
  // If the most recent completed date is today, start counting streak
  if (currentDate.getTime() === today.getTime()) {
    currentStreak = 1;
    
    // Check previous days
    let checkDate = new Date(today);
    
    while (true) {
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
      
      // Get day name
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // If this day is not a target day, skip it
      if (!targetDays.includes(dayName)) {
        continue;
      }
      
      // Format the date to match our stored format
      const dateString = checkDate.toISOString().split('T')[0];
      
      // If the date is completed, increment streak
      if (completedDates.includes(dateString)) {
        currentStreak++;
      } else {
        // Break the streak
        break;
      }
    }
  }
  
  return currentStreak;
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

          const streak = calculateStreak(habitCompletions, habit.target_days);
          const highestStreak = Math.max(habit.highest_streak || 0, streak);

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
          
          const newStreak = calculateStreak(updatedCompletedDates, habit.targetDays);
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
