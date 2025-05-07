import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/contexts/HabitContext';
import HabitCard from '@/components/dashboard/HabitCard';
import StreakCard from '@/components/dashboard/StreakCard';
import QuoteCard from '@/components/dashboard/QuoteCard';
import StatsCard from '@/components/dashboard/StatsCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { habits, loading } = useHabits();
  const navigate = useNavigate();

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0];
  const todayHabits = habits.filter(habit => 
    habit.targetDays.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  );
  const completedToday = todayHabits.filter(habit => 
    habit.completedDates.includes(today)
  );
  const completionRate = todayHabits.length > 0 
    ? Math.round((completedToday.length / todayHabits.length) * 100)
    : 0;

  // Calculate streaks
  const currentStreak = Math.max(...habits.map(h => h.streak), 0);
  const highestStreak = Math.max(...habits.map(h => h.highestStreak), 0);

  const handleToggleHabit = async (id: string, completed: boolean) => {
    try {
      await toggleHabitCompletion(id, today);
      toast.success(`Habit ${completed ? 'completed' : 'reset'} successfully`);
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  const addNewHabit = () => {
    navigate('/tracker');
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
          value={currentStreak} 
          label="Current streak" 
        />
        <StreakCard 
          value={highestStreak} 
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

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : todayHabits.length === 0 ? (
          <EmptyState
            title="No habits for today"
            description="Add habits to start tracking your progress."
            actionText="Create your first habit"
            onAction={addNewHabit}
          />
        ) : (
          <div className="space-y-3">
            {todayHabits.map(habit => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                name={habit.name}
                description={`${habit.streak} day streak`}
                completed={habit.completedDates.includes(today)}
                streak={habit.streak}
                onToggle={handleToggleHabit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
