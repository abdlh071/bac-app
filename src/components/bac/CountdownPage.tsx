import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface CountdownPageProps {
  onBack: () => void;
}

const CountdownPage: React.FC<CountdownPageProps> = ({ onBack }) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date('2026-06-15T08:00:00');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 pb-20">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">العد التنازلي للبكالوريا</h1>
          <p className="text-gray-600">الوقت المتبقي لامتحان البكالوريا 2026</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-pink-600 p-8 rounded-3xl text-white text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-6">العـد التنــازلــي</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-3xl font-bold">{countdown.days}</div>
            <div className="text-sm opacity-90">يوم</div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-3xl font-bold">{countdown.hours}</div>
            <div className="text-sm opacity-90">ساعة</div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-3xl font-bold">{countdown.minutes}</div>
            <div className="text-sm opacity-90">دقيقة</div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-3xl font-bold">{countdown.seconds}</div>
            <div className="text-sm opacity-90">ثانية</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownPage;
