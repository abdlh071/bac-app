import React, { useState, useEffect, useRef } from 'react';

// Simplified icons since lucide-react is not available
const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
);
const Play = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const Pause = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="6" height="16" x="4" y="4"/><rect width="6" height="16" x="14" y="4"/></svg>
);
const CheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.72"/><path d="M22 4 12 14.01l-3-3"/></svg>
);
const Volume2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
);
const VolumeX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9 2 9 2 15 6 15 11 19z"/><path d="m23 9-6 6"/><path d="m17 9 6 6"/></svg>
);
const Minimize2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="m14 10 6-6"/><path d="m4 14 6 6"/></svg>
);
const Maximize2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3 14 10"/><path d="M3 21 10 14"/></svg>
);

// Mock Button component
const Button = ({ onClick, children, className = '', variant = '' }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500';
  const variantClasses = {
    default: 'bg-purple-500 text-white hover:bg-purple-600',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    outline: 'bg-transparent text-white border border-white/30 hover:bg-white/10',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </button>
  );
};

// Add `onClose` prop to the component interface
interface FocusTimerPageProps {
  onClose: () => void;
}

// Main Focus Timer Component
const FocusTimerPage: React.FC<FocusTimerPageProps> = ({ onClose }) => {
  // State for timer duration, time left, and timer status
  const [duration, setDuration] = useState<number>(25); // Default 25 minutes
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  
  // State for task management
  const [currentTask, setCurrentTask] = useState<string>('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  // State for custom modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'goBack' | 'reset' | null>(null);

  // New state for audio and background
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [backgroundStyle, setBackgroundStyle] = useState<string>('from-slate-900 via-purple-900 to-slate-800');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isBackgroundLoading, setIsBackgroundLoading] = useState<boolean>(false);

  // State for minimizing the timer display
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // A comprehensive list of background options including gradients and images.
  const backgroundOptions = [
    
    { name: 'لون ليلي أرجواني', value: 'from-slate-900 via-purple-900 to-slate-800', type: 'gradient' },
    { name: 'صورة مميزة 1', value: 'https://i.ibb.co/MyWCcCXF/420.jpg', type: 'image' },
    { name: 'صورة مميزة 2', value: 'https://i.ibb.co/4n2v2yqw/370.jpg', type: 'image' },
    { name: 'صورة مميزة 3', value: 'https://i.ibb.co/cKZ8H3V4/433.jpg', type: 'image' },
    { name: 'صورة مميزة 4', value: 'https://i.ibb.co/9z3HNkR/495.jpg', type: 'image' },
    { name: 'لون فجر هادئ', value: 'from-blue-400 to-cyan-400', type: 'gradient' },
    { name: 'لون غروب الشمس', value: 'from-orange-500 via-pink-500 to-purple-600', type: 'gradient' },
    { name: 'لون غابة خضراء', value: 'from-green-600 via-green-800 to-lime-900', type: 'gradient' },
    { name: 'لون بحر أزرق', value: 'from-sky-700 to-blue-900', type: 'gradient' },
    { name: 'لون صباح مشرق', value: 'from-yellow-300 via-green-300 to-blue-300', type: 'gradient' },
    { name: 'لون فضاء عميق', value: 'from-slate-950 to-indigo-950', type: 'gradient' },
    { name: 'لون ذهبي', value: 'from-amber-400 to-yellow-600', type: 'gradient' },
    { name: 'لون غروب داكن', value: 'from-orange-900 via-red-900 to-purple-950', type: 'gradient' },
    { name: 'لون غابة ليلية', value: 'from-green-900 via-emerald-950 to-lime-900', type: 'gradient' },
    { name: 'لون بحر عميق', value: 'from-blue-950 via-sky-900 to-cyan-950', type: 'gradient' },
    { name: 'لون الفجر الداكن', value: 'from-indigo-900 via-purple-950 to-slate-950', type: 'gradient' },
    { name: 'لون رماد الليل', value: 'from-gray-800 via-slate-900 to-black', type: 'gradient' },
    { name: 'لون ملكي داكن', value: 'from-purple-900 via-indigo-950 to-blue-950', type: 'gradient' },
    { name: 'لون أحمر ليلي', value: 'from-red-900 via-rose-950 to-pink-900', type: 'gradient' },
    { name: 'لون زمرد غامق', value: 'from-emerald-900 via-green-950 to-teal-900', type: 'gradient' },
    { name: 'لون بركاني', value: 'from-red-950 via-orange-900 to-amber-900', type: 'gradient' },
    { name: 'لون سماوي ليلي', value: 'from-cyan-900 via-teal-950 to-sky-900', type: 'gradient' }


  ];

  // Audio options
  const audioOptions = [
    { name: 'بدون صوت', url: '' },
    { name: 'مطر خفيف', url: 'https://archive.org/download/longambients2/Light%20Rain.mp3' },
    { name: 'أمواج بحر طويلة', url: 'https://archive.org/download/longambients2/Distant%20Ocean%20Surf.mp3' },
    { name: 'نار مشتعلة', url: 'https://archive.org/download/longambients2/Camp%20Fire.mp3' },
    { name: 'غابة وطيور', url: 'https://archive.org/download/longambients2/Forest%20Ambience.mp3' },
    { name: 'نهر هادئ', url: 'https://archive.org/download/longambients2/Babbling%20Brook.mp3' },
    { name: 'الليل والصرصور', url: 'https://archive.org/download/longambients2/Evening%20Crickets.mp3' },
    { name: 'مطر على النافذة', url: 'https://archive.org/download/longambients2/Rain%20On%20Window.mp3' },
    { name: 'شلال هادئ', url: 'https://archive.org/download/longambients2/Waterfall.mp3' },
    { name: 'مطر في المدينة', url: 'https://archive.org/download/longambients2/City%20Rain.mp3' },
  ];

  // Refs for timer interval and beforeunload event
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beforeUnloadRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (currentTask.trim() !== '') {
              setCompletedTasks(prevTasks => [...prevTasks, currentTask]);
              setCurrentTask('');
            }
            // Stop audio when timer completes
            if (audioRef.current) {
              audioRef.current.pause();
              setIsAudioPlaying(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentTask]);

  // Audio playback control function
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // New function to test the sound
  const testSound = () => {
    if (audioRef.current && selectedAudio) {
      // Pause any currently playing sound
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Play the selected sound
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      setIsAudioPlaying(true);
    }
  };

  // Prevent user from leaving page when the timer is running
  useEffect(() => {
    if (isRunning && !isCompleted) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'سيتم فقدان تقدمك إذا غادرت الصفحة. هل أنت متأكد؟';
        return e.returnValue;
      };

      beforeUnloadRef.current = handleBeforeUnload;
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        if (beforeUnloadRef.current) {
          window.removeEventListener('beforeunload', beforeUnloadRef.current);
        }
      };
    }
  }, [isRunning, isCompleted]);

  // Start the timer and audio
  const startTimer = () => {
    if (!hasStarted) {
      setTimeLeft(duration * 60);
      setHasStarted(true);
    }
    // Start the timer
    setIsRunning(true);
    setIsCompleted(false);

    // Start audio if a source is selected. This is the correct way to handle
    // audio playback to avoid browser autoplay policy issues.
    if (audioRef.current && selectedAudio) {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      setIsAudioPlaying(true);
    }
  };
  
  // Pause the timer and audio
  const pauseTimer = () => {
    setIsRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };
  
  // Handle go back action with a confirmation modal
  const handleGoBack = () => {
    if (isRunning) {
      setShowConfirmModal(true);
      setConfirmAction('goBack');
    } else {
      // Use the onClose prop to go back to the parent TDLPage
      onClose();
    }
  };
  
  // Handle reset action with a confirmation modal
  const handleReset = () => {
    if (isRunning) {
      setShowConfirmModal(true);
      setConfirmAction('reset');
    } else {
      resetTimer();
    }
  };
  
  // Reset the timer and tasks
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsCompleted(false);
    setHasStarted(false);
    setCurrentTask('');
    // Stop and reset audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      audioRef.current.currentTime = 0;
    }
  };

  // Format the time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate the progress percentage for the circular timer
  const progress = hasStarted ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  // Handle modal confirmation
  const handleConfirm = () => {
    if (confirmAction === 'goBack') {
      // Use the onClose prop to go back to the parent TDLPage
      onClose();
    } else if (confirmAction === 'reset') {
      resetTimer();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Handle modal cancellation
  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };
  
  // Handle background selection change
  const handleBackgroundChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = backgroundOptions.find(opt => opt.value === event.target.value);
    if (selectedOption) {
      if (selectedOption.type === 'image') {
        setIsBackgroundLoading(true); // Start loading state
        const img = new Image();
        img.src = selectedOption.value;
        img.onload = () => {
          setBackgroundStyle(''); // Clear gradient class
          setBackgroundImage(selectedOption.value); // Set background image URL
          setIsBackgroundLoading(false); // End loading state
        };
        img.onerror = () => {
          console.error("Failed to load image:", selectedOption.value);
          setIsBackgroundLoading(false); // End loading state on error
        };
      } else {
        setBackgroundImage(''); // Clear image URL
        setBackgroundStyle(selectedOption.value); // Set gradient class
      }
    }
  };
  
  // Handle audio selection change
  const handleAudioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAudioUrl = event.target.value;
    setSelectedAudio(newAudioUrl);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      audioRef.current.src = newAudioUrl;
      audioRef.current.load(); // Load the new audio source
      if (isRunning) {
        // If the timer is running, automatically play the new sound
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        setIsAudioPlaying(true);
      }
    }
  };
  
  // Conditional background style for the main container
  const mainBackgroundStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image 0.5s ease-in-out' }
    : {};
  
  // The main container's class to remove bottom padding
  const mainContainerClasses = `min-h-screen ${backgroundImage ? 'bg-black' : `bg-gradient-to-br ${backgroundStyle}`} flex flex-col font-sans`;

  if (isCompleted) {
    return (
      <div className={`${mainContainerClasses} items-center justify-center p-6 text-center font-sans`} style={mainBackgroundStyle}>
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl animate-fade-in-up">
          <div className="text-6xl mb-6 animate-pulse-slow">✨</div>
          <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">تهانينا!</h1>
          <p className="text-white/80 text-lg mb-8">
            لقد أكملت جلسة التركيز بنجاح لمدة {duration} دقيقة
          </p>
          {completedTasks.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-4 mb-8 text-left">
              <h3 className="text-white text-xl font-semibold mb-3 border-b border-white/20 pb-2">المهام المنجزة</h3>
              <ul className="list-disc list-inside space-y-2">
                {completedTasks.map((task, index) => (
                  <li key={index} className="text-white/80 text-lg flex items-center">
                    <CheckCircle size={16} className="text-green-400 mr-2 flex-shrink-0" />
                    <span className="break-words">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-4">
            <Button
              onClick={resetTimer}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              جلسة جديدة
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 py-3 rounded-xl text-lg transition-all duration-300"
            >
              العودة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${mainContainerClasses} flex flex-col`} style={mainBackgroundStyle}>
      {/* Audio Element */}
      <audio ref={audioRef} loop preload="auto" />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-6 flex items-center justify-center border-b border-white/10 backdrop-blur-sm z-50">
        <h1 className="text-xl font-bold text-white">العداد الذكي للتركيز</h1>
      </div>
      
      {/* Fixed Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          onClick={handleGoBack}
          variant="ghost"
          className="text-white hover:bg-white/10 p-2 rounded-xl transition-colors duration-200"
        >
          <ArrowLeft size={24} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative pt-24">
        
        {!hasStarted ? (
          // Duration Selection & Task Input
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-white text-center mb-8">اختر مدة التركيز</h2>
            
            <div className="mb-8">
              <label htmlFor="task-input" className="block text-white/80 text-sm font-medium mb-2">المهمة الحالية:</label>
              <input
                id="task-input"
                type="text"
                placeholder="مثال: مراجعة درس الرياضيات"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                className="w-full bg-white/5 text-white placeholder-white/50 p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              />
            </div>
            
            {/* Background and Audio Settings */}
            <div className="mb-8">
              <label htmlFor="background-select" className="block text-white/80 text-sm font-medium mb-2">خلفية التطبيق</label>
              <select
                id="background-select"
                value={backgroundImage || backgroundStyle}
                onChange={handleBackgroundChange}
                className="w-full bg-white/5 text-white p-2 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                {backgroundOptions.map((option, index) => (
                  <option key={index} value={option.value} className="bg-slate-800 text-white">{option.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-8">
              <label htmlFor="audio-select" className="block text-white/80 text-sm font-medium mb-2">صوت الخلفية</label>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <select
                  id="audio-select"
                  value={selectedAudio}
                  onChange={handleAudioChange}
                  className="w-full bg-white/5 text-white p-2 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  {audioOptions.map((option, index) => (
                    <option key={index} value={option.url} className="bg-slate-800 text-white">{option.name}</option>
                  ))}
                </select>
                <Button onClick={testSound} variant="outline" className="p-2">
                    <Play size={20} />
                </Button>
              </div>
            </div>

            <div className="mb-8">
              <input
                type="range"
                min="1"
                max="60"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((duration - 1) / 59) * 100}%, rgba(255,255,255,0.2) ${((duration - 1) / 59) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-white/60 text-sm mt-2">
                <span>1 دقيقة</span>
                <span>60 دقيقة</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-white mb-2">{duration}</div>
              <div className="text-white/80 text-lg">دقيقة</div>
            </div>

            <Button
              onClick={startTimer}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4 rounded-xl text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Play size={24} className="mr-2" /> ابدأ التركيز
            </Button>
          </div>
        ) : (
          <>
            {/* Full Timer Display */}
            {!isMinimized && (
              <div
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl animate-fade-in-up"
              >
                {/* Minimize Button */}
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setIsMinimized(true)} variant="ghost" className="p-2">
                    <Minimize2 size={24} className="text-white" />
                  </Button>
                </div>

                {/* Progress Circle */}
                <div className="relative w-64 h-64 mx-auto mb-8 pointer-events-none">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-mono font-bold text-white mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-white/60 text-sm">
                      {isRunning ? 'وفقك الله' : 'متوقف'}
                    </div>
                  </div>
                </div>
                
                {/* Audio Controls */}
                {selectedAudio && (
                  <div className="flex justify-center mb-6">
                    <Button onClick={toggleAudio} className="w-16 h-16 rounded-full">
                      {isAudioPlaying ? <Volume2 size={32} /> : <VolumeX size={32} />}
                    </Button>
                  </div>
                )}

                {/* Progress Info */}
                <div className="text-center text-white/60 mb-4 pointer-events-none">
                  <div className="text-sm">التقدم: {Math.round(progress)}%</div>
                </div>
                
                {/* Points & Task Info */}
                <div className="text-center text-white/80 pointer-events-none">
                    <p className="text-lg font-semibold animate-pulse">نقاطك في التطبيق ترتفع حاليا</p>
                    <p className="text-sm text-white/60 mt-2">المهمة: {currentTask || 'لم يتم تحديد مهمة'}</p>
                </div>
                
                {/* Play/Pause/Reset Buttons */}
                <div className="flex justify-center mt-8 space-x-4 rtl:space-x-reverse">
                  {isRunning ? (
                    <Button onClick={pauseTimer} className="py-2 px-6 rounded-full bg-red-500 hover:bg-red-600">
                      <Pause size={24} className="mr-2" /> إيقاف مؤقت
                    </Button>
                  ) : (
                    <Button onClick={startTimer} className="py-2 px-6 rounded-full bg-green-500 hover:bg-green-600">
                      <Play size={24} className="mr-2" /> استئناف
                    </Button>
                  )}
                  <Button onClick={handleReset} variant="outline" className="py-2 px-6 rounded-full">
                    إعادة تعيين
                  </Button>
                </div>
              </div>
            )}
            
            {/* Minimized Timer Display at the top, centered */}
            {isMinimized && (
              <div
                className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm p-3 rounded-xl cursor-pointer hover:bg-white/20 transition-all z-50 animate-fade-in"
                onClick={() => setIsMinimized(false)}
              >
                <div className="text-lg font-bold text-white font-mono">
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-xl max-w-sm w-full text-center">
            <h4 className="text-xl font-bold text-white mb-4">هل أنت متأكد؟</h4>
            <p className="text-white/80 mb-6">سيتم فقدان تقدمك الحالي إذا قمت بالمتابعة.</p>
            <div className="flex justify-around space-x-4 rtl:space-x-reverse">
              <Button onClick={handleCancel} variant="outline" className="w-full text-lg">إلغاء</Button>
              <Button onClick={handleConfirm} className="w-full text-lg bg-red-500 hover:bg-red-600">تأكيد</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading overlay for background image */}
      {isBackgroundLoading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 animate-fade-in">
          <div className="text-white text-lg animate-pulse">يتم تحميل الخلفية...</div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fade-in-up {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s infinite;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default FocusTimerPage;
