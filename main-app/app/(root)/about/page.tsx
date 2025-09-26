import AboutClient from '@/components/pages/about/about-client'
import { Metadata } from 'next'
import React from 'react'

export const metadata:Metadata = {
  title: 'About Us'
};

const AboutPage = () => {

  return <AboutClient/>
}

export default AboutPage