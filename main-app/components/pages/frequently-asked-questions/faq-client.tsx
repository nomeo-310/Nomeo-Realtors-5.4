'use client'

import React from 'react'
import FrequentlyAskedQuestions from './frequently-asked-questions';
import { all_faqs } from '@/assets/texts/faq';
import FaqContactForm from './faq-contact-form';

const FAQClient = () => {
  const [activeTab, setActiveTab] = React.useState('general');

  const TabButton = ({ tab, title, onClick }:{title:string, onClick: (tab:string) => void; tab:string}) => (
    <button
      className={`w-fit md:w-full text-left py-1.5 px-3 rounded-md text-sm lg:text-base font-quicksand ${activeTab === tab ? 'bg-neutral-300 dark:bg-[#424242] font-semibold' : ''}`}
      onClick={() => onClick(tab)}
    >
      {title}
    </button>
  );

  return (
    <div className='w-full md:min-h-screen pt-[70px] lg:pt-[70px] xl:px-16 md:px-10 px-6 h-full flex flex-col justify-center'>
      <div>
        <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand md:text-center'>Frequently Asked Questions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3 md:text-center lg:text-lg text-base font-medium mb-5">Have questions about finding or listing a property? You&apos;re in the right place.</p>
        <div className="min-h-[55vh] flex xl:gap-12 lg:gap-8 gap-6 w-full h-full md:flex-row flex-col">
          <div className="h-full md:w-1/5 lg:w-[230px] xl:w-[220px] 2xl:w-[200px] w-full flex md:flex-col gap-2">
            <TabButton title="General" tab="general" onClick={setActiveTab} />
            <TabButton title="Rentals" tab="rentals" onClick={setActiveTab} />
            <TabButton title="Sales" tab="sales" onClick={setActiveTab} />
            <TabButton title="Others" tab="others" onClick={setActiveTab} />
            <TabButton title="Requests" tab="requests" onClick={setActiveTab} />
          </div>
          <div className="h-full md:w-4/5 lg:flex-1 w-full">
          {activeTab === 'general' && (<FrequentlyAskedQuestions  faqs={all_faqs.general}/>)}
          {activeTab === 'rentals' && (<FrequentlyAskedQuestions  faqs={all_faqs.rentals}/>)}
          {activeTab === 'sales' && (<FrequentlyAskedQuestions  faqs={all_faqs.sales}/>)}
          {activeTab === 'others' && (<FrequentlyAskedQuestions  faqs={all_faqs.others}/>)}
          {activeTab === 'requests' && (<FaqContactForm/>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQClient