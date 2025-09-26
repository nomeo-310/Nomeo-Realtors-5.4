'use client'

import React from 'react'
import { ArrowUp02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const ScrollToTop = () => {
  const [isScrollingUp, setIsScrollingUp] = React.useState(true)
  const [showButton, setShowButton] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const innerHeight = window.innerHeight

      // Show button if scrolled more than 100px
      setShowButton(scrollY > 100)

      // Change direction based on current scroll position
      if (scrollY + innerHeight >= scrollHeight - 100) {
        setIsScrollingUp(true)
      } else if (scrollY <= 100) {
        setIsScrollingUp(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScrollAction = () => {
    if (isScrollingUp) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    }
  }

  return (
    <>
      {showButton && (
        <button
          onClick={handleScrollAction}
          className="fixed bottom-5 md:right-7 right-10 z-[10000] lg:p-3 p-2 rounded-full bg-primary-blue text-white transition-transform"
        >
          <HugeiconsIcon icon={ArrowUp02Icon} className={`transform ${isScrollingUp ? '' : 'rotate-[180deg]'}`} />
        </button>
      )}
    </>
  )
}

export default ScrollToTop
