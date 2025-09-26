'use client'

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react'

type frequentlyAskedQuestionProps = {
  title: string;
  content: string;
  isOpen: boolean;
  onClick: () => void;
};

const FrequentlyAskedQuestionsItem = ({ title, content, isOpen, onClick }:frequentlyAskedQuestionProps) => {

  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      const contentEl = contentRef.current as HTMLDivElement;
      setHeight(contentEl.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className={cn('last:border-b-0 border-b dark:border-b-white', isOpen && '')} onClick={onClick}>
      <div className={cn("w-full flex lg:items-center justify-between lg:p-4 p-3 gap-4 px-0 lg:px-4", isOpen && 'pb-2 lg:pb-3')}>
        <h2 className="lg:text-lg md:text-base text-sm">
          <button className={`font-semibold text-left ${ isOpen ? "font-semibold" : ""}`}>
            {title}
          </button>
        </h2>
        <div>
          { isOpen ? <ChevronUp/> : <ChevronDown/> }
        </div>
      </div>
      <div className="ease-in-out transition-[height] duration-200 overflow-hidden" style={{height: `${height}px`}}>
        <div className="lg:p-4 p-3 px-0 lg:px-4 pt-0 lg:text-base text-sm text-black/60 dark:text-white/70" ref={contentRef}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default FrequentlyAskedQuestionsItem