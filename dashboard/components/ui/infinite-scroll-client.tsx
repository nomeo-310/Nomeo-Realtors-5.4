import React from 'react'
import { useInView } from 'react-intersection-observer'

interface infiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void
  className?: string
}

const InfiniteScrollClient = ({onBottomReached, className, children}:infiniteScrollContainerProps) => {
  const { ref } = useInView({
    rootMargin: '200px',
    onChange(inView) {
      if (inView) {
        onBottomReached();
      }
    },
  });

  return (
    <div className={className}>
      {children}
      <div ref={ref} />
    </div>
  )
}

export default InfiniteScrollClient;