'use client'

import React from 'react'
import Modal from '../ui/modal'
import { useInspectionConditionModal } from '@/hooks/general-store'
import { inspection_terms } from '@/assets/texts/terms'

const InspectionTerms = () => {
  const { isOpen, onClose } = useInspectionConditionModal();
  return (
    <Modal
      useCloseButton
      onClose={onClose}
      isOpen={isOpen}
      title={inspection_terms.title}
      useSeparator
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
    >
      <ol className='flex flex-col gap-1 lg:mt-5 mt-3 list-decimal list-inside'>
        {inspection_terms.content.map((item, index:number) => (
          <li key={index} className='text-sm lg:text-base'>{item}</li>
        ))}
      </ol>
    </Modal>
  )
}

export default InspectionTerms;