'use client'

import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= halfVisible + 1) {
      for (let i = 1; i <= maxVisiblePages; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - halfVisible; i <= currentPage + halfVisible; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const pagesToDisplay = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="w-full h-10 mt-6 flex items-center md:justify-center justify gap-3">
      <button
        type="button"
        className='lg:text-sm uppercase text-xs font-medium h-full bg-secondary-blue text-white px-6 rounded-lg disabled:opacity-50'
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <div className="flex items-center gap-1">
        {pagesToDisplay.map((page, index) =>
          page === '...' ? (
            <span key={index} className='size-9 md:flex items-center justify-center hidden'>...</span>
          ) : (
            <button
              key={index}
              className={cn('size-9 md:flex items-center justify-center rounded-full hidden', page === currentPage ? 'bg-secondary-blue text-white' : '')}
              onClick={() => onPageChange(Number(page))}
            >
              {page}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        className='lg:text-sm uppercase text-xs font-medium h-full bg-secondary-blue text-white px-6 rounded-lg disabled:opacity-50'
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;