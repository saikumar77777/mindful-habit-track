
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { setItem, getItem } from '@/lib/local-storage';
import { v4 as uuidv4 } from 'uuid';

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'highestStreak' | 'completedDates'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
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

  // Load habits from localStorage on mount
  useEffect(() => {
    const savedHabits = getItem<Habit[]>('habits', []);
    
    // Recalculate streaks on load
    const habitsWithUpdatedStreaks = savedHabits.map(habit => {
      const streak = calculateStreak(habit.completedDates, habit.targetDays);
      const highestStreak = Math.max(habit.highestStreak || 0, streak);
      
      return {
        ...habit,
        streak,
        highestStreak
      };
    });
    
    setHabits(habitsWithUpdatedStreaks);
    setLoading(false);
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      setItem('habits', habits);
    }
  }, [habits, loading]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'highestStreak' | 'completedDates'>) => {
    const newHabit: Habit = {
      id: uuidv4(),
      ...habitData,
      completedDates: [],
      streak: 0,
      highestStreak: 0
    };
    
    setHabits(prev => [...prev, newHabit]);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(prev => 
      prev.map(habit => {
        if (habit.id !== habitId) return habit;
        
        let updatedCompletedDates: string[];
        
        if (habit.completedDates.includes(date)) {
          // Remove date if already completed
          updatedCompletedDates = habit.completedDates.filter(d => d !== date);
        } else {
          // Add date if not completed
          updatedCompletedDates = [...habit.completedDates, date];
        }
        
        // Calculate new streak
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
