'use client'

import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

// Simple mapping - just map what you need
const SEGMENT_MAP: Record<string, string> = {
  // Dashboards
  'admin-dashboard': 'Dashboard',
  'creator-dashboard': 'Dashboard',
  'superadmin-dashboard': 'Dashboard',
  
  // Management
  'manage-users': 'Manage Users',
  'manage-agents': 'Manage Agents', 
  'suspended': 'Suspended',
  
  // Specific pages
  'users': 'Users',
  'agents': 'Agents',
  'create-blog': 'Create Blog',
  'blogs': 'Blogs',
  'apartments': 'Apartments',
  'profile': 'Profile',
  'settings': 'Settings',
  'notifications': 'Notifications',
};

const BreadCrumbs = () => {
  const pathname = usePathname();

  const breadcrumbItems = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items: Array<{ href: string; label: string; isLast: boolean }> = [];
    
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      // Skip admin/creator/superadmin prefixes
      if (['admin', 'creator', 'superadmin'].includes(segment) && index === 0) {
        currentPath += `/${segment}`;
        return;
      }
      
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      let label = SEGMENT_MAP[segment];
      
      if (!label) {
        // Handle dynamic segments (IDs)
        if (/^[a-f0-9]{24}$/.test(segment)) {
          // Determine context from previous segment
          const prevSegment = segments[index - 1];
          if (prevSegment === 'users' || prevSegment === 'manage-users') {
            label = 'User Details';
          } else if (prevSegment === 'agents' || prevSegment === 'manage-agents') {
            label = 'Agent Details';
          } else if (prevSegment === 'blogs') {
            label = 'Blog Details';
          } else if (prevSegment === 'apartments') {
            label = 'Apartment Details';
          } else {
            label = 'Details';
          }
        } else if (segment.length <= 20 && !/^\d+$/.test(segment)) {
          // Only show readable segments
          label = segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
      }
      
      if (label) {
        items.push({
          href: currentPath,
          label,
          isLast
        });
      }
    });
    
    return items;
  }, [pathname]);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 font-semibold tracking-wider text-sm uppercase">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <HugeiconsIcon 
              icon={ArrowRight01Icon} 
              className="size-5 text-gray-400" 
              aria-hidden="true"
            />
          )}
          
          {item.isLast ? (
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadCrumbs;