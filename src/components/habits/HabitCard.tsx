
import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, Calendar, Trophy, Trash2 } from 'lucide-react';
import { useHabits } from '@/contexts/HabitContext';
import { Habit } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HabitCardProps {
  habit: Habit;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { toggleHabitCompletion, deleteHabit } = useHabits();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Generate array of dates for current week view
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const previousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleToggleDay = (date: Date) => {
    toggleHabitCompletion(habit.id, date.toISOString().split('T')[0]);
  };

  const isDateCompleted = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return habit.completedDates.includes(dateString);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isTargetDay = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return habit.targetDays.includes(dayName);
  };

  const startDateObj = parseISO(habit.startDate);
  const isAfterStartDate = (date: Date) => {
    return date >= startDateObj;
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{habit.name}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{habit.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteHabit(habit.id)} className="bg-destructive">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-sm text-muted-foreground">
          Started on {format(parseISO(habit.startDate), 'PPP')}
        </div>
        <div className="text-sm flex flex-wrap gap-1 mt-1">
          {habit.targetDays.map((day) => (
            <span key={day} className="bg-secondary/30 rounded-full px-2 py-0.5 text-xs">
              {day.substring(0, 3)}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="flex justify-between items-center mb-2">
            <Button variant="ghost" size="sm" onClick={previousWeek}>
              &lt;
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToCurrentWeek}
              className="text-xs"
            >
              {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </Button>
            <Button variant="ghost" size="sm" onClick={nextWeek}>
              &gt;
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {weekDates.map((date) => {
              const dayLabel = format(date, 'EEE');
              const dayNumber = format(date, 'd');
              const isActive = isAfterStartDate(date);
              const isComplete = isDateCompleted(date);
              const isCurrent = isToday(date);
              const isTarget = isTargetDay(date);
              
              return (
                <Button
                  key={date.toString()}
                  variant="ghost"
                  size="sm"
                  disabled={!isActive}
                  onClick={() => handleToggleDay(date)}
                  className={cn(
                    'flex flex-col h-12 items-center justify-center p-1 rounded',
                    !isActive && 'opacity-40',
                    isComplete && 'bg-accent/30',
                    isCurrent && 'ring-2 ring-primary',
                    isTarget && !isComplete && 'bg-secondary/20',
                    !isTarget && 'opacity-70'
                  )}
                >
                  <span className="text-xs font-medium">{dayLabel}</span>
                  <span className="text-xs">{dayNumber}</span>
                  {isComplete && <Check className="h-3 w-3" />}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center">
          <div className="text-sm mr-4">
            <span className="text-muted-foreground">Current Streak:</span>
            <span className="ml-1 font-medium">{habit.streak} days</span>
          </div>
          <div className="text-sm flex items-center">
            <Trophy className="h-3 w-3 text-primary mr-1" />
            <span className="text-muted-foreground">Best:</span>
            <span className="ml-1 font-medium">{habit.highestStreak} days</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">Full Calendar</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HabitCard;
