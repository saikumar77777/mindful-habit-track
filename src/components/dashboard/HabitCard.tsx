
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface HabitCardProps {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  streak: number;
  onToggle: (id: string, completed: boolean) => void;
  className?: string;
}

const HabitCard: React.FC<HabitCardProps> = ({
  id,
  name,
  description,
  completed,
  streak,
  onToggle,
  className,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleToggle = () => {
    setIsChecking(true);
    // Simulate a small delay for the animation
    setTimeout(() => {
      onToggle(id, !completed);
      setIsChecking(false);
    }, 300);
  };

  return (
    <div
      className={cn(
        'relative bg-card rounded-lg border p-5 hover:shadow-sm transition-all duration-200',
        completed && 'border-accent/40 bg-accent/5',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-4">
        <button
          className={cn(
            'checkbox-container',
            completed ? 'checkbox-checked' : 'border-muted-foreground/30',
            isChecking && 'scale-90'
          )}
          onClick={handleToggle}
          aria-label={completed ? `Mark ${name} as not done` : `Mark ${name} as done`}
        >
          {completed && <Check className="h-4 w-4" />}
        </button>
        
        <div className="flex-1">
          <h3 className={cn(
            'font-medium',
            completed && 'text-muted-foreground'
          )}>
            {name}
          </h3>
          {description && (
            <p className={cn(
              'text-sm text-muted-foreground mt-1',
              completed && 'text-muted-foreground/70'
            )}>
              {description}
            </p>
          )}
        </div>
        
        {streak > 0 && (
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-medium bg-secondary',
            completed && 'bg-accent/20'
          )}>
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
