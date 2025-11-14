// components/SearchSort.tsx (updated parts only)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, FilterHorizontalIcon, SortByDown01Icon, SortByUp01Icon } from '@hugeicons/core-free-icons';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DateRange, useFilterStore } from '@/hooks/usefilter-store';

export interface SearchSortProps {
  placeholder?: string;
  searchDelay?: number;
  namespace?: string;
  useCalendar?: boolean;
  FilterComponent?: React.ComponentType<FilterComponentProps>;
  onFilterChange?: (filters: any) => void;
  maxWidth?: string; 
}

export interface FilterComponentProps {
  onFiltersChange: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
}

export const SearchSort: React.FC<SearchSortProps> = ({
  placeholder = "Search...",
  searchDelay = 300,
  namespace,
  useCalendar = false,
  FilterComponent,
  onFilterChange,
  maxWidth = "max-w-7xl", // Default max width
}) => {
  const { 
    search, 
    sortOrder, 
    dateRange,
    customFilters,
    setSearch, 
    setSortOrder, 
    setDateRange,
    setCustomFilters,
    clearFilters,
    setNamespace 
  } = useFilterStore();
  
  const [localSearch, setLocalSearch] = useState(search);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Set namespace if provided
  useEffect(() => {
    if (namespace) {
      setNamespace(namespace);
    }
  }, [namespace, setNamespace]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
      }
    }, searchDelay);

    return () => clearTimeout(timer);
  }, [localSearch, searchDelay, search, setSearch]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearch('');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const newDateRange: DateRange = { ...dateRange };

    if (!newDateRange.startDate) {
      newDateRange.startDate = selectedDate;
    } else if (!newDateRange.endDate) {
      if (selectedDate >= newDateRange.startDate) {
        newDateRange.endDate = selectedDate;
      } else {
        newDateRange.endDate = newDateRange.startDate;
        newDateRange.startDate = selectedDate;
      }
    } else {
      newDateRange.startDate = selectedDate;
      newDateRange.endDate = undefined;
    }

    setDateRange(newDateRange);

    if (newDateRange.startDate && newDateRange.endDate) {
      setTimeout(() => setCalendarOpen(false), 300);
    }
  };

  const clearDateRange = () => {
    setDateRange({});
    setCalendarOpen(false);
  };

  const handleCustomFiltersChange = useCallback((filters: Record<string, any>) => {
    const currentFiltersStr = JSON.stringify(customFilters);
    const newFiltersStr = JSON.stringify(filters);
    
    if (currentFiltersStr !== newFiltersStr) {
      setCustomFilters(filters);
      onFilterChange?.(filters);
    }
  }, [customFilters, setCustomFilters, onFilterChange]);

  const handleClearAll = () => {
    clearFilters();
    handleClearSearch();
    setShowFilterPanel(false);
    setCalendarOpen(false);
  };

  const hasActiveFilters = search || sortOrder !== 'asc' || dateRange?.startDate || Object.keys(customFilters).length > 0;

  const formatDateDisplay = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const getDateRangeDisplay = () => {
    if (!dateRange?.startDate) return 'Select date range';
    if (!dateRange.endDate) return `${formatDateDisplay(dateRange.startDate)} - Choose end date`;
    return `${formatDateDisplay(dateRange.startDate)} - ${formatDateDisplay(dateRange.endDate)}`;
  };

  return (
    <div className={`w-full ${maxWidth} flex flex-col gap-2`}>
      {/* Main Search and Controls Row */}
      <div className="flex flex-col sm:flex-row lg:gap-3 gap-2 w-full">
        {/* Search Input */}
        <div className="flex-1 relative flex items-center lg:gap-3 gap-2 min-w-0"> {/* Added min-w-0 for flexbox shrinking */}
          <Search className="size-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            placeholder={placeholder}
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="text-sm lg:text-base flex-1 px-10 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:outline-none w-full min-w-0" // Added min-w-0
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="size-4 lg:size-5" />
            </button>
          )}
        </div>

        {/* Controls Group */}
        <div className="flex lg:gap-3 gap-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
          {/* Sort Order Toggle */}
          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="font-normal flex items-center gap-2 lg:py-2 py-1.5 lg:px-3 px-2 text-sm lg:text-base whitespace-nowrap flex-shrink-0"
          >
            {sortOrder === 'asc' ? (
              <div>
                <HugeiconsIcon icon={SortByUp01Icon} className="size-5 lg:size-6" />
              </div>
            ) : (
              <div>
                <HugeiconsIcon icon={SortByDown01Icon} className="size-5 lg:size-6" />
              </div>
            )}
            <span className="">
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </span>
          </Button>

          {/* Calendar Button */}
          {useCalendar && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`font-normal flex items-center gap-2 lg:py-2 py-1.5 lg:px-3 px-2 text-sm lg:text-base whitespace-nowrap flex-shrink-0 ${
                    dateRange?.startDate ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100' : ''
                  }`}
                >
                  <HugeiconsIcon icon={Calendar01Icon} className="size-4 lg:size-5" />
                  <span className="hidden sm:inline">
                    {getDateRangeDisplay()}
                  </span>
                  <span className="sm:hidden">
                    Date
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: dateRange?.startDate,
                      to: dateRange?.endDate,
                    }}
                    onSelect={(range) => {
                      if (range?.from) {
                        handleDateSelect(range.from);
                      }
                      if (range?.to) {
                        handleDateSelect(range.to);
                      }
                    }}
                    numberOfMonths={2}
                    className="rounded-md border"
                  />
                  
                  {(dateRange?.startDate || dateRange?.endDate) && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="text-sm text-gray-600 font-normal">
                        {dateRange.startDate && (
                          <span>
                            {formatDateDisplay(dateRange.startDate)}
                            {dateRange.endDate ? ` - ${formatDateDisplay(dateRange.endDate)}` : ' (select end)'}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearDateRange}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 font-normal"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Filter Button */}
          {FilterComponent && (
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`font-normal flex items-center gap-2 lg:py-0 py-0 lg:px-3 px-2 text-sm lg:text-base whitespace-nowrap flex-shrink-0 ${
                Object.keys(customFilters).length > 0 ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' : ''
              }`}
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} className="size-5 lg:size-6" />
              <span className="">Filter</span>
            </Button>
          )}

          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-sm lg:py-2 py-1.5 lg:px-3 px-2 hover:bg-gray-50 whitespace-nowrap flex-shrink-0"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel with max width constraint */}
      {showFilterPanel && FilterComponent && (
        <div className="w-full border border-gray-300 rounded-lg bg-white shadow-lg overflow-hidden">
          <FilterComponent 
            onFiltersChange={handleCustomFiltersChange}
            currentFilters={customFilters}
          />
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          {search && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Search: "{search}"
            </span>
          )}
          {dateRange?.startDate && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Date: {formatDateDisplay(dateRange.startDate)}
              {dateRange.endDate && ` - ${formatDateDisplay(dateRange.endDate)}`}
            </span>
          )}
          {Object.entries(customFilters).map(([key, value]) => 
            value && (
              <span key={key} className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {key}: {String(value)}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
};