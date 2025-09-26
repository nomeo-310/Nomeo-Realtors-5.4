import ContactUsClient from '@/components/pages/contact-us/contact-us-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Contact Us'
};

const ContactPage = () => {
  return <ContactUsClient/>
}

export default ContactPage