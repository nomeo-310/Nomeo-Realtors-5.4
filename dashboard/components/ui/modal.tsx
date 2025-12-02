'use client'

import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  title: string | ReactNode
  description?: string | ReactNode
  onClose: () => void
  useCloseButton?: boolean
  useSeparator?: boolean
  width?: string
  className?: string
  overlayClassName?: string
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
}

const Modal = ({
  useCloseButton,
  description,
  children,
  isOpen,
  title,
  onClose,
  useSeparator,
  width,
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true, // Default to true for backward compatibility
  closeOnEsc = true, // Default to true for backward compatibility
}: ModalProps) => {
  const [showModal, setShowModal] = React.useState(isOpen);

  React.useEffect(() => {
    setShowModal(isOpen)
  }, [isOpen]);

  const handleClose = React.useCallback(() => {
    setShowModal(false);

    setTimeout(() => {
      onClose();
    }, 300)
  }, [onClose]);

  // Handle Escape key press
  React.useEffect(() => {
    if (!closeOnEsc) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose, closeOnEsc]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlayClick) return;
    
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Show warning for important modals
  React.useEffect(() => {
    if (isOpen && !closeOnOverlayClick && !closeOnEsc && !useCloseButton) {
      console.warn('Modal is configured to be non-dismissible. Make sure there is an alternative way for users to close it.');
    }
  }, [isOpen, closeOnOverlayClick, closeOnEsc, useCloseButton]);

  return (
    <React.Fragment>
      {isOpen && (
        <div 
          className={cn(
            'fixed inset-0 overflow-hidden flex items-center justify-center outline-none focus:outline-none z-[80000]',
            closeOnOverlayClick ? 'cursor-pointer' : 'cursor-default',
            overlayClassName
          )}
          onClick={handleOverlayClick}
          style={{
            backgroundColor: closeOnOverlayClick ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.9)'
          }}
        >
          <div className={cn(
            "relative lg:w-[430px] xl:w-[500px] md:w-[450px] w-[94%] my-6 mx-auto h-auto md:h-auto lg:h-auto",
            width
          )}>
            <div className={cn(
              "translate duration-300 h-full",
              showModal ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            )}>
              <div className={cn(
                "translate h-full lg:h-auto md:h-auto border-0 rounded shadow-lg relative flex flex-col w-full bg-white dark:bg-[#424242] outline-none focus:outline-none",
                className
              )}
              onClick={(e) => e.stopPropagation()} // Prevent overlay click when clicking inside modal
              >
                <div className="flex xl:p-5 md:p-4 p-3 xl:pb-0 md:pb-0 pb-0 justify-between w-full items-start">
                  <div className="flex-1">
                    {/* Title - supports both string and ReactNode */}
                    <div className="text-base md:text-lg xl:text-xl font-semibold font-quicksand">
                      {typeof title === 'string' ? (
                        <span>{title}</span>
                      ) : (
                        <div className="flex items-center gap-2">{title}</div>
                      )}
                    </div>
                    
                    {/* Description - supports both string and ReactNode */}
                    {description && (
                      <div className="mt-1 sm:text-sm text-xs text-gray-600 dark:text-gray-300">
                        {typeof description === 'string' ? (
                          <span>{description}</span>
                        ) : (
                          <div>{description}</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {useCloseButton && (
                    <button 
                      onClick={handleClose} 
                      className={cn(
                        'p-1 border border-transparent hover:border-black/30 dark:hover:border-white/60 rounded hover:opacity-70 transition ml-2 flex-shrink-0',
                        !closeOnOverlayClick && !closeOnEsc && 'ring-2 ring-red-300 ring-offset-1' // Visual indicator for non-dismissible modals
                      )}
                      aria-label="Close modal"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} />
                    </button>
                  )}

                  {/* Warning indicator for completely non-dismissible modals */}
                  {!closeOnOverlayClick && !closeOnEsc && !useCloseButton && (
                    <div className="ml-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="This modal cannot be dismissed"></div>
                    </div>
                  )}
                </div>
                
                <div className='xl:p-5 md:p-4 p-3 xl:pt-2 md:pt-2 pt-2'>
                  {useSeparator && (
                    <hr className='xl:my-4 my-3 -mx-3 xl:-mx-5 md:-mx-4 dark:border-white/70'/>
                  )}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

export default Modal