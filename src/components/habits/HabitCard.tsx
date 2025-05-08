import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, Calendar, Trophy, Trash2, X, Pencil, Clock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EditHabitForm from './EditHabitForm';

interface HabitCardProps {
  habit: Habit;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { toggleHabitCompletion, deleteHabit, getCompletionTimestamp } = useHabits();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    if (isAfter(date, new Date())) return; // Prevent future date selection
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

  const isFutureDate = (date: Date) => {
    return isAfter(date, new Date());
  };

  const getDateStatus = (date: Date) => {
    if (isFutureDate(date)) return 'future';
    if (isDateCompleted(date)) return 'completed';
    if (isTargetDay(date)) return 'missed';
    return 'inactive';
  };

  const getCompletionTime = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const timestamp = getCompletionTimestamp(habit.id, dateString);
    if (!timestamp) return null;
    return format(parseISO(timestamp), 'h:mm a');
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{habit.name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              ID: {habit.id.substring(0, 8)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
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
        </div>
        <div className="text-sm text-muted-foreground">
          Started on {format(parseISO(habit.startDate), 'PPP')}
          {habit.created_at && (
            <div>Created at {format(parseISO(habit.created_at), 'PPP p')}</div>
          )}
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
              const status = getDateStatus(date);
              const completionTime = getCompletionTime(date);
              
              return (
                <TooltipProvider key={date.toString()}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isActive || isFutureDate(date)}
                        onClick={() => handleToggleDay(date)}
                        className={cn(
                          'flex flex-col h-12 items-center justify-center p-1 rounded relative',
                          !isActive && 'opacity-40',
                          status === 'completed' && 'bg-green-500/20',
                          status === 'missed' && 'bg-red-500/20',
                          isToday(date) && 'ring-2 ring-primary',
                          isFutureDate(date) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <span className="text-xs font-medium">{dayLabel}</span>
                        <span className="text-xs">{dayNumber}</span>
                        {status === 'completed' && <Check className="h-3 w-3 text-green-500" />}
                        {status === 'missed' && <X className="h-3 w-3 text-red-500" />}
                        {completionTime && (
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {completionTime}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <span>{format(date, 'MMMM d, yyyy')}</span>
                        {completionTime && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Completed at {completionTime}</span>
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
      <EditHabitForm
        habit={habit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </Card>
  );
};

export default HabitCard;
