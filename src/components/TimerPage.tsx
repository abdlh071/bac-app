
import React, { useState, useEffect, useRef, memo } from 'react';
import { RotateCcw, Clock } from 'lucide-react';

interface TimerPageProps {
  onPointsUpdate: (points: number) => void;
  onTimeUpdate: (seconds: number) => void;
  userData?: { id: number } | null;
}

const TimerPage: React.FC<TimerPageProps> = memo(({ onPointsUpdate, onTimeUpdate, userData }) => {
  const [seconds, setSeconds] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const lastActiveRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pointsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer state
  useEffect(() => {
    if (!userData?.id) return;
    
    const savedTime = parseInt(localStorage.getItem(`userTime_${userData.id}`) || '0');
    const sessionStartTime = parseInt(localStorage.getItem(`sessionStart_${userData.id}`) || Date.now().toString());
    const currentTime = Date.now();
    
    // Reset session points on page load to prevent accumulation
    const calculatedSessionPoints = 0;
    
    setSeconds(savedTime);
    setSessionPoints(calculatedSessionPoints);
    
    // Update parent with initial time
    onTimeUpdate(savedTime);
  }, [userData?.id, onTimeUpdate]);

  // Main timer effect
  useEffect(() => {
    if (!userData?.id) return;

    const startTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        
        setSeconds(prev => {
          const newSeconds = prev + 1;
          
          // Save to localStorage every second
          localStorage.setItem(`userTime_${userData.id}`, newSeconds.toString());
          
          // Update parent component
          onTimeUpdate(newSeconds);
          
          // Add points every 10 seconds with debouncing
          if (newSeconds % 10 === 0) {
            if (pointsUpdateTimeoutRef.current) {
              clearTimeout(pointsUpdateTimeoutRef.current);
            }
            
            pointsUpdateTimeoutRef.current = setTimeout(() => {
              onPointsUpdate(1);
              setSessionPoints(prev => prev + 1);
            }, 100); // Small delay to avoid conflicts
          }
          
          return newSeconds;
        });
      }, 1000);
    };

    // Handle visibility change to pause/resume timer
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        localStorage.setItem(`lastVisit_${userData.id}`, Date.now().toString());
      } else {
        const lastVisit = parseInt(localStorage.getItem(`lastVisit_${userData.id}`) || Date.now().toString());
        const currentTime = Date.now();
        const timeDifference = currentTime - lastVisit;
        
        // Reset session if away for more than 1 minute
        if (timeDifference > 60000) {
          setSessionPoints(0);
          localStorage.setItem(`sessionStart_${userData.id}`, currentTime.toString());
        } else {
          // Don't accumulate points when returning to the page
          setSessionPoints(0);
        }
        
        localStorage.setItem(`lastVisit_${userData.id}`, currentTime.toString());
        startTimer();
      }
    };

    // Start timer immediately
    startTimer();

    // Set up session start if not exists
    if (!localStorage.getItem(`sessionStart_${userData.id}`)) {
      localStorage.setItem(`sessionStart_${userData.id}`, Date.now().toString());
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => {
      if (userData?.id) {
        localStorage.setItem(`lastVisit_${userData.id}`, Date.now().toString());
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pointsUpdateTimeoutRef.current) {
        clearTimeout(pointsUpdateTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userData?.id, onPointsUpdate, onTimeUpdate]);

  const reset = () => {
    if (!userData?.id) return;
    
    setSeconds(0);
    setSessionPoints(0);
    localStorage.removeItem(`userTime_${userData.id}`);
    localStorage.removeItem(`sessionStart_${userData.id}`);
    localStorage.setItem(`sessionStart_${userData.id}`, Date.now().toString());
    localStorage.setItem(`lastVisit_${userData.id}`, Date.now().toString());
    onTimeUpdate(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">العداد الذكي</h1>
        <p className="text-gray-600">اكسب نقطة واحدة كل 10 ثوانٍ</p>
      </div>

      {/* مؤشر الحالة */}
      <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-medium text-green-600">
            العداد يعمل تلقائياً
          </span>
        </div>
      </div>

      {/* عرض المؤقت */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-3xl text-white text-center shadow-2xl mb-8">
        <div className="mb-4">
          <Clock size={48} className="mx-auto mb-4 opacity-80" />
          <div className="text-5xl font-bold font-mono tracking-wider">
            {formatTime(seconds)}
          </div>
          <div className="text-sm opacity-80 mt-2">
            {seconds < 3600 ? 'دقيقة:ثانية' : 'ساعة:دقيقة:ثانية'}
          </div>
        </div>
      </div>


      {/* معلومات محسنة */}
      <div className="mt-8 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-3xl border-2 border-cyan-200 shadow-lg">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -ml-8 -mb-8"></div>
          
          <div className="relative z-10">
            <h3 className="font-bold text-xl text-cyan-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse mr-2"></div>
              كيف يعمل العداد الذكي؟
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-cyan-200/50 hover:bg-white/90 transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                <span className="text-cyan-700 font-medium">يعمل العداد تلقائياً عند دخول التطبيق</span>
              </div>
              <div className="flex items-center p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-cyan-200/50 hover:bg-white/90 transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                <span className="text-cyan-700 font-medium">كل 10 ثوانٍ تحصل على نقطة واحدة</span>
              </div>
              <div className="flex items-center p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-cyan-200/50 hover:bg-white/90 transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                <span className="text-cyan-700 font-medium">يعمل في جميع صفحات التطبيق</span>
              </div>
              <div className="flex items-center p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-cyan-200/50 hover:bg-white/90 transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mr-3 group-hover:scale-110 transition-transform"></div>
                <span className="text-cyan-700 font-medium">يتوقف عند إغلاق التطبيق تماماً</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TimerPage.displayName = 'TimerPage';

export default TimerPage;
