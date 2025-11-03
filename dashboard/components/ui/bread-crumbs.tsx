'use client'

import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Home04Icon } from '@hugeicons/core-free-icons';

const BreadCrumbs = () => {
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(segment => segment);

  const pathNamesMap: { [key: string]: string } = {
    'admin-dashboard': 'Admin Dashboard',
    'creator-dashboard': 'Creator Dashboard',
    'superadmin-dashboard': 'Super-Admin Dashboard',
    'notifications': 'Notifications',
    'create-blog': 'Create Blog',
  };

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const href = '/' + pathSegments.slice(0, index + 1).join('/');

    const isId = index === 2 && pathSegments[index - 1] === 'create-blog';

    const text = isId ? 'Edit Blog' : pathNamesMap[segment] || segment.replace(/-/g, ' ');

    return (
      <React.Fragment key={href}>
        <HugeiconsIcon icon={ArrowRight01Icon} className='size-5'/>
        {isLast ? (
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {text}
          </span>
        ) : (
          <Link href={href}>
            {text}
          </Link>
        )}
      </React.Fragment>
    );
  });

  return (
    <div className="hidden md:flex items-center gap-2 font-semibold tracking-wider text-sm uppercase">
      <Link href={'/'}>
        <HugeiconsIcon icon={Home04Icon} />
      </Link>
      {breadcrumbItems}
    </div> 
  );
};

export default BreadCrumbs;