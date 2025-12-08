'use client'

import React, { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ScrollableWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxHeight?: string;
  scrollbarStyle?: 'thin' | 'auto' | 'none';
  showScrollbar?: boolean;
  padding?: boolean;
  className?: string;
}

const ScrollableWrapper = forwardRef<HTMLDivElement, ScrollableWrapperProps>(
  ({ 
    children, 
    maxHeight = 'max-h-[80vh]', 
    scrollbarStyle = 'thin',
    showScrollbar = true,
    padding = true,
    className,
    ...props 
  }, ref) => {
    
    const scrollbarClasses = {
      thin: 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
      auto: 'scrollbar-auto',
      none: 'scrollbar-none'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-y-auto',
          showScrollbar && scrollbarClasses[scrollbarStyle],
          maxHeight,
          padding && 'pr-2', // Add right padding for scrollbar space
          className
        )}
        style={{
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          scrollBehavior: 'smooth', // Smooth scrolling
          ...props.style
        }}
        {...props}
      >
        <div className={cn(padding && 'p-1')}>
          {children}
        </div>
      </div>
    );
  }
);

ScrollableWrapper.displayName = 'ScrollableWrapper';

export default ScrollableWrapper;