import ForRentClient from '@/components/pages/for-rent/for-rent-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'For Rent'
};

const ForRentPage = () => {
  return <ForRentClient/>
}

export default ForRentPage