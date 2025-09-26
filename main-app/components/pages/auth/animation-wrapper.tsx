import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

const AnimationWrapper = ({className, children, keyValue}:{className?:string, children:React.ReactNode, keyValue?:any}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 3 }} 
        className={className}
        key={keyValue}
      >
        {children}
      </motion.div>
    </AnimatePresence>  
  )
}

export default AnimationWrapper