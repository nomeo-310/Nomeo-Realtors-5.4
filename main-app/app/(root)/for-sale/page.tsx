import ForSaleClient from '@/components/pages/for-sale/for-sale-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'For Sale'
};


const ForSalePage = () => {
  return <ForSaleClient/>
}

export default ForSalePage