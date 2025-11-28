'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

type AnimationType = 'fade' | 'slide' | 'scale'

interface AnimationWrapperProps {
  className?: string
  children: React.ReactNode
  keyValue?: string | number
  duration?: number
  type?: AnimationType
}

const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  }
}

const AnimationWrapper = ({ className, children, keyValue, duration = 0.6, type = 'fade'}: AnimationWrapperProps) => {
  return (
    <AnimatePresence>
      <motion.div
        variants={animationVariants[type]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, ease: "easeInOut" }}
        className={className}
        key={keyValue}
      >
        {children}
      </motion.div>
    </AnimatePresence>  
  )
}

export default AnimationWrapper