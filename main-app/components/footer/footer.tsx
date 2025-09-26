import React from 'react'
import FooterTop from './footer-top'
import FooterBottom from './footer-bottom'

const Footer = () => {
  return (
    <div className='bg-secondary-blue text-white xl:p-16 md:p-10 p-6 w-full'>
      <FooterTop/>
      <hr className='border-white'/>
      <FooterBottom/>
    </div>
  )
}

export default Footer