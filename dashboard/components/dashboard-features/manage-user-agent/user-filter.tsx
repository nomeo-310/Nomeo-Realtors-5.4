'use client'

import React, { useState } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'

interface FilterOptions {
  search: string
  sort: 'asc' | 'desc'
}

interface UserFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  placeholder?: string
}

const UserFilters: React.FC<UserFiltersProps> = ({ onFiltersChange, placeholder = "Search users..."}) => {
  const [filters, setFilters] = useState<FilterOptions>({ search: '', sort: 'desc'})

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleSort = () => {
    const newSort = filters.sort === 'asc' ? 'desc' : 'asc'
    handleFilterChange('sort', newSort)
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search Input */}
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={placeholder}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-0"
            />
          </div>
        </div>

        {/* Sort Button */}
        <button
          onClick={toggleSort}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort: {filters.sort === 'asc' ? 'A-Z' : 'Z-A'}</span>
        </button>
      </div>
    </div>
  )
}

export default UserFilters