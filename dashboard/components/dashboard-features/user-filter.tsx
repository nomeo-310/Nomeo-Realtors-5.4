'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FilterComponentProps } from './search-sort';

export const UserStatusFilter: React.FC<FilterComponentProps> = ({ 
  onFiltersChange, 
  currentFilters 
}) => {
  const [status, setStatus] = useState(currentFilters.status || '');
  const [role, setRole] = useState(currentFilters.role || '');

  useEffect(() => {
    onFiltersChange({ status, role });
  }, [status, role, onFiltersChange]);

  const clearFilters = () => {
    setStatus('');
    setRole('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Filter Users</h4>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-0 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-0 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>
    </div>
  );
};