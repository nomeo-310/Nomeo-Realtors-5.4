import Footer from '@/components/footer/footer';
import Navigation from '@/components/navigation/navigation';
import React from 'react'

const MainLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <React.Fragment>
      <Navigation/>
      {children}
      <Footer/>
    </React.Fragment>
  )
};

export default MainLayout