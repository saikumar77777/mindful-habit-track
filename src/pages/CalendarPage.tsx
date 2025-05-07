
import React, { useState } from 'react';
import HabitHeatmap from '@/components/calendar/HabitHeatmap';
import HabitSelect from '@/components/calendar/HabitSelect';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Mock habit categories
const categories = [
  { id: 'health', name: 'Health & Wellness' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'learning', name: 'Learning' },
  { id: 'social', name: 'Social' },
];

// Mock habits data with categories
const habits = [
  { id: '1', name: 'Morning meditation', categoryId: 'health' },
  { id: '2', name: 'Read a book', categoryId: 'learning' },
  { id: '3', name: 'Exercise', categoryId: 'health' },
  { id: '4', name: 'Drink water', categoryId: 'health' },
  { id: '5', name: 'Code practice', categoryId: 'learning' },
  { id: '6', name: 'Journal writing', categoryId: 'productivity' },
  { id: '7', name: 'Call a friend', categoryId: 'social' },
];

// Mock habit completion data
// Format: { [YYYY-MM-DD]: { habitId: percentage } }
const mockCompletionData = {
  '2025-05-01': { '1': 1, '2': 1, '3': 0, '4': 1, '5': 1, '6': 0, '7': 0 },
  '2025-05-02': { '1': 1, '2': 1, '3': 1, '4': 1, '5': 0, '6': 1, '7': 1 },
  '2025-05-03': { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 },
  '2025-05-04': { '1': 1, '2': 0, '3': 1, '4': 0, '5': 1, '6': 0, '7': 1 },
  '2025-05-05': { '1': 1, '2': 1, '3': 0, '4': 1, '5': 1, '6': 1, '7': 0 },
  '2025-05-06': { '1': 0, '2': 1, '3': 1, '4': 1, '5': 0, '6': 1, '7': 1 },
  '2025-05-07': { '1': 1, '2': 0, '3': 0, '4': 0, '5': 1, '6': 0, '7': 0 },
  // Previous month data
  '2025-04-15': { '1': 1, '2': 1, '3': 1, '4': 0, '5': 0, '6': 1, '7': 1 },
  '2025-04-16': { '1': 0, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 0 },
  '2025-04-17': { '1': 1, '2': 0, '3': 1, '4': 1, '5': 0, '6': 0, '7': 1 },
  // Next month data
  '2025-06-01': { '1': 1, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1 },
  '2025-06-02': { '1': 0, '2': 0, '3': 1, '4': 1, '5': 1, '6': 0, '7': 1 },
};

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const getMonthLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePreviousMonth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      });
      setIsLoading(false);
    }, 300); // Simulate loading delay
  };

  const handleNextMonth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      });
      setIsLoading(false);
    }, 300); // Simulate loading delay
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // If a specific category is selected, reset habit selection to 'all'
    if (categoryId !== 'all') {
      setSelectedHabit('all');
      toast({
        title: "Category filter applied",
        description: `Showing habits in ${categories.find(c => c.id === categoryId)?.name || 'selected category'}`,
      });
    }
  };
  
  // Filter habits by selected category
  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.categoryId === selectedCategory);

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Habit Calendar</h1>
      <p className="text-muted-foreground mb-8">Track your consistency over time</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <HabitSelect
            habits={filteredHabits}
            selectedHabit={selectedHabit}
            onSelectHabit={setSelectedHabit}
            categories={categories}
            showCategories={selectedCategory === 'all'}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCategoryChange('all')}>
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem 
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewType('month')}
            className={viewType === 'month' ? 'bg-secondary/30' : ''}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewType('year')}
            className={viewType === 'year' ? 'bg-secondary/30' : ''}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <h2 className="text-lg font-medium">
          {viewType === 'month' 
            ? getMonthLabel(currentMonth)
            : currentMonth.getFullYear().toString()}
        </h2>
        
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Heatmap */}
      <HabitHeatmap
        month={currentMonth}
        viewType={viewType}
        selectedHabit={selectedHabit}
        completionData={mockCompletionData}
        habits={habits}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CalendarPage;
