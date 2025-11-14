'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterComponentProps } from './search-sort';

interface PropertyFilterProps extends FilterComponentProps {
  maxWidth?: string; // Add maxWidth prop
}

export const PropertyFilter: React.FC<PropertyFilterProps> = ({ 
  onFiltersChange, 
  currentFilters,
  maxWidth = "max-w-4xl" // Default max width
}) => {
  const [filters, setFilters] = useState({
    minRent: currentFilters.minRent || '',
    maxRent: currentFilters.maxRent || '',
    bedrooms: currentFilters.bedrooms || '',
    bathrooms: currentFilters.bathrooms || '',
    toilets: currentFilters.toilets || '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      minRent: '',
      maxRent: '',
      bedrooms: '',
      bathrooms: '',
      toilets: '',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.minRent || filters.maxRent || filters.bedrooms || filters.bathrooms || filters.toilets;

  return (
    <div className={`w-full ${maxWidth} mx-auto space-y-6 p-4`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900 text-lg">Filter Properties</h4>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
            Clear All
          </Button>
        )}
      </div>
      
      {/* Rent Range */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-700 text-base">Rent Range</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Minimum Rent ($)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minRent}
              onChange={(e) => handleFilterChange('minRent', e.target.value)}
              className="w-full"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Maximum Rent ($)
            </label>
            <Input
              type="number"
              placeholder="Any"
              value={filters.maxRent}
              onChange={(e) => handleFilterChange('maxRent', e.target.value)}
              className="w-full"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Room Specifications */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-700 text-base">Property Specifications</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bedrooms */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Bedrooms
            </label>
            <Select
              value={filters.bedrooms}
              onValueChange={(value) => handleFilterChange('bedrooms', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4 Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Bathrooms
            </label>
            <Select
              value={filters.bathrooms}
              onValueChange={(value) => handleFilterChange('bathrooms', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any bathrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bathroom</SelectItem>
                <SelectItem value="2">2 Bathrooms</SelectItem>
                <SelectItem value="3">3 Bathrooms</SelectItem>
                <SelectItem value="4">4+ Bathrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toilets */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Toilets
            </label>
            <Select
              value={filters.toilets}
              onValueChange={(value) => handleFilterChange('toilets', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any toilets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Toilet</SelectItem>
                <SelectItem value="2">2 Toilets</SelectItem>
                <SelectItem value="3">3 Toilets</SelectItem>
                <SelectItem value="4">4+ Toilets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};