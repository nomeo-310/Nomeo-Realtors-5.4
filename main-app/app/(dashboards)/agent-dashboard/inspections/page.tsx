import InspectionsClient from '@/components/pages/dashboard/inspections-client';
import { Metadata } from 'next';
import React from 'react'
export const metadata: Metadata = {
  title: 'Inspections'
};


const InspectionPage = () => {
  return (
    <InspectionsClient/>
  )
}

export default InspectionPage