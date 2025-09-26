import React from 'react'
import FrequentlyAskedQuestionsItem from './frequently-asked-questions-item'

type FaqItem = {
  question: string;
  answer: string;
};

type FrequentlyAskedQuestionsProps = {
  faqs: FaqItem[];
};

const FrequentlyAskedQuestions = ({ faqs }: FrequentlyAskedQuestionsProps) => {

  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const toggleAccordion = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);



  return (
    <section>
      <div className="flex-1 h-full flex flex-col justify-center">
        {faqs.map((item, index:number) => (
          <FrequentlyAskedQuestionsItem
            key={index}
            onClick={() =>toggleAccordion(index)}
            isOpen={index === currentIndex}
            title={item.question}
            content={item.answer}
          />
        ))}
      </div>
    </section>
  )
}

export default FrequentlyAskedQuestions