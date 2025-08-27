// src/components/bac/cards/CardsComponent.tsx

import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from './types';
import { historyCardsData } from './history';
import { geographyCardsData } from './geography';
import { islamicSciencesCardsData } from './islamic-sciences';

interface CardConfig {
  subject: string;
  section: string;
  unit: string;
}

interface CardsComponentProps {
  cardConfig: CardConfig;
  onBack: () => void;
}

const CardsComponent: React.FC<CardsComponentProps> = ({ cardConfig, onBack }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);

  // Effect to load cards based on cardConfig
  useEffect(() => {
    const { subject, section, unit } = cardConfig;
    let loadedCards: Card[] = [];
    let subjectData: any;

    // Select the correct data source based on the subject
    if (subject === 'history') {
      subjectData = historyCardsData;
    } else if (subject === 'geography') {
      subjectData = geographyCardsData;
    } else if (subject === 'islamic-sciences') {
      subjectData = islamicSciencesCardsData;
    }

    // Ensure all parts of the path exist before trying to access
    if (subjectData && section && unit && subjectData[section] && subjectData[section][unit]) {
      loadedCards = subjectData[section][unit];
    }

    setCards(loadedCards);
    setCurrentCardIndex(0); // Reset to the first card when config changes
  }, [cardConfig]);

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const currentCard = cards[currentCardIndex];

  // Determine colors based on subject
  const getCardColors = () => {
    switch (cardConfig.subject) {
      case 'history':
        return 'bg-gradient-to-br from-orange-400 to-red-500';
      case 'geography':
        return 'bg-gradient-to-br from-teal-400 to-cyan-500';
      case 'islamic-sciences':
        return 'bg-gradient-to-br from-green-400 to-emerald-500';
      default:
        return 'bg-gradient-to-br from-blue-400 to-purple-500';
    }
  };

  // Function to get display title for the page
  const getPageTitle = () => {
    switch (cardConfig.subject) {
      case 'history':
        return 'التاريخ';
      case 'geography':
        return 'الجغرافيا';
      case 'islamic-sciences':
        return 'العلوم الإسلامية';
      default:
        return 'البطاقات';
    }
  };

  // Function to get display description for the page
  const getPageDescription = () => {
    const { subject, section, unit } = cardConfig;

    if (subject === 'history') {
      if (section === 'terms') return 'المصطلحات';
      if (section === 'personalities') return 'الشخصيات';
    } else if (subject === 'geography' || subject === 'islamic-sciences') {
      return unit;
    }
    return '';
  };

  return (
    <div className="p-6 pb-20 flex flex-col items-center min-h-screen">
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 text-sm">
            {getPageDescription()}
            {cardConfig.subject === 'history' && cardConfig.unit ? ` - ${cardConfig.unit}` : ''}
          </p>
        </div>
        <div className="w-10"></div> {/* Placeholder for alignment */}
      </div>

      {cards.length > 0 ? (
        <>
          <div className={`relative w-full max-w-md h-96 rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center text-center ${getCardColors()} text-white mb-8`}>
            <span className="absolute top-4 right-4 text-sm font-bold opacity-80">
              {currentCardIndex + 1} / {cards.length}
            </span>
            <h2 className="text-3xl font-bold mb-4">{currentCard.front}</h2>
            {currentCard.back ? (
              <p className="text-xl leading-relaxed font-arabic-serif">
                {currentCard.back}
              </p>
            ) : (
              <p className="text-lg text-gray-500">
                لا يوجد تعريف متاح لهذه البطاقة.
              </p>
            )}
          </div>

          <div className="flex justify-between w-full max-w-md">
            <button
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
              className="bg-gray-200 text-gray-700 p-4 rounded-full shadow-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={24} />
            </button>
            <button
              onClick={handleNextCard}
              disabled={currentCardIndex === cards.length - 1}
              className="bg-blue-500 text-white p-4 rounded-full shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-600 text-lg mt-10">
          <p>لا توجد بطاقات متاحة لهذا القسم حاليًا.</p>
          <p>يرجى العودة واختيار قسم آخر.</p>
        </div>
      )}
    </div>
  );
};

export default CardsComponent;
