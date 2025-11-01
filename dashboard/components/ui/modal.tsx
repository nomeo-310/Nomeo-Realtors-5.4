'use client'

import { cn } from '@/lib/utils'
import React from 'react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type modalProps = {
  children: React.ReactNode
  isOpen: boolean
  title: string
  description?: string
  onClose: () => void
  useCloseButton?: boolean
  useSeparator?:boolean
  width?:string
}

const Modal = ({useCloseButton, description, children, isOpen, title, onClose, useSeparator, width}: modalProps) => {
  const [showModal, setShowModal] = React.useState(isOpen);

  React.useEffect(() => {
    setShowModal(isOpen)
  },[isOpen]);

  const handleClose = React.useCallback(() => {
    setShowModal(false);

    setTimeout(() => {
      onClose();
    }, 300)
  }, [onClose]);

  return (
    <React.Fragment>
      { isOpen &&
        <div className='fixed inset-0 overflow-hidden flex items-center justify-center outline-none focus:outline-none z-[80000] bg-neutral-800/70'>
          <div className={cn("relative lg:w-[430px] xl:w-[500px] md:w-[450px] w-[94%] my-6 mx-auto h-auto md:h-auto lg:h-auto", width)}>
            <div className={`translate duration-300 h-full ${showModal ? 'translate-y-0' : 'translate-y-full'} ${showModal ? 'opacity-100' : 'opacity-0'}`}>
              <div className="translate h-full lg:h-auto md:h-auto border-0 rounded shadow-lg relative flex flex-col w-full bg-white dark:bg-[#424242] outline-none focus:outline-none">
                <div className="flex xl:p-5 md:p-4 p-3 xl:pb-0 md:pb-0 pb-0 justify-between w-full items-start">
                  <div className="text-base md:text-lg xl:text-xl font-semibold font-quicksand">{title}</div>
                  <button onClick={handleClose} className={cn('p-1 border border-transparent hover:border-black/30 dark:hover:border-white/60 rounded hover:opacity-70 transition', !useCloseButton && 'invisible')}>
                    <HugeiconsIcon icon={Cancel01Icon} />
                  </button>
                </div>
                <div className='xl:p-5 md:p-4 p-3 xl:pt-0 md:pt-0 pt-0'>
                  {description && <div className="sm:text-base text-sm my-4 w-full">{description}</div>}
                  {useSeparator && <hr className='xl:my-4 my-3 -mx-3 xl:-mx-5 md:-mx-4 dark:border-white/70'/>}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </React.Fragment>
  )
}

export default Modal;