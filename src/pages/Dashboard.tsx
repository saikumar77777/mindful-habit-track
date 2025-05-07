
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HabitCard from '@/components/dashboard/HabitCard';
import StreakCard from '@/components/dashboard/StreakCard';
import QuoteCard from '@/components/dashboard/QuoteCard';
import StatsCard from '@/components/dashboard/StatsCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const initialHabits = [
  {
    id: '1',
    name: 'Morning meditation',
    description: '10 minutes of mindfulness',
    completed: false,
    streak: 5,
  },
  {
    id: '2',
    name: 'Read a book',
    description: 'At least 10 pages',
    completed: true,
    streak: 12,
  },
  {
    id: '3',
    name: 'Exercise',
    description: '30 minutes of physical activity',
    completed: false,
    streak: 3,
  },
  {
    id: '4',
    name: 'Drink water',
    description: '8 glasses throughout the day',
    completed: false,
    streak: 8,
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState(initialHabits);

  const pendingHabits = habits.filter(habit => !habit.completed);
  const completedHabits = habits.filter(habit => habit.completed);
  const completionRate = habits.length > 0 
    ? Math.round((completedHabits.length / habits.length) * 100)
    : 0;

  const handleToggleHabit = (id: string, completed: boolean) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === id 
          ? { 
              ...habit, 
              completed,
              streak: completed ? habit.streak + 1 : Math.max(0, habit.streak - 1)
            } 
          : habit
      )
    );
    
    toast.success(`Habit ${completed ? 'completed' : 'reset'} successfully`);
  };

  const addNewHabit = () => {
    toast.info("This functionality will be implemented soon!");
  };

  return (
    <div className="container py-8 animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user?.name || 'Friend'}
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </header>

      {/* Daily quote */}
      <QuoteCard className="mb-8" />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Completion rate" 
          value={`${completionRate}%`}
        />
        <StreakCard 
          value={12} 
          label="Current streak" 
        />
        <StreakCard 
          value={30} 
          label="Highest streak" 
          isHighest
        />
        <StatsCard 
          title="Active habits" 
          value={habits.length}
        />
      </div>

      {/* Today's habits */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Today's Habits</h2>
          <Button size="sm" onClick={addNewHabit}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>

        {habits.length === 0 ? (
          <EmptyState
            title="No habits yet"
            description="Start tracking your first habit to build a consistent routine."
            actionText="Create your first habit"
            onAction={addNewHabit}
          />
        ) : (
          <div className="space-y-3">
            {pendingHabits.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Pending ({pendingHabits.length})
                </h3>
                {pendingHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    id={habit.id}
                    name={habit.name}
                    description={habit.description}
                    completed={habit.completed}
                    streak={habit.streak}
                    onToggle={handleToggleHabit}
                  />
                ))}
              </>
            )}

            {completedHabits.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 mt-6">
                  Completed ({completedHabits.length})
                </h3>
                {completedHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    id={habit.id}
                    name={habit.name}
                    description={habit.description}
                    completed={habit.completed}
                    streak={habit.streak}
                    onToggle={handleToggleHabit}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Streaks at risk */}
      <div>
        <h2 className="text-xl font-medium mb-4">Streaks at Risk</h2>
        <div className="bg-card rounded-lg border p-6 text-center text-muted-foreground">
          <p>No streaks at risk today. Great job!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
