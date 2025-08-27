import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
// The AIChatPage component is now imported from its new location
import AIChatPage from './components/AIChatPage';
// The BrainCircuit icon is now correctly imported
import { Plus, Edit, Trash2, Save, Eye, EyeOff, Send, BrainCircuit, Loader2, Book } from 'lucide-react';

// Assume these imports and types are available from the user's project
import { initTelegram, getTelegramUser, expandTelegramApp, setupUserInteractionExpand } from './utils/telegram';
import {
  createOrUpdateUser,
  updateUserPoints,
  updateUserTimeSpent,
  addNewSubscriptionTasks,
  initializeSessionTracking,
  updateSessionGroups,
  cleanupSessionTracking,
  handleMinutelySessionUpdate
} from './utils/supabase';
import { UserData } from './types/telegram';
import BottomNavigation from './components/BottomNavigation';
import HomePage from './components/HomePage';
import TasksPage from './components/TasksPage';
import RankingPage from './components/RankingPage';
// تم تحديث مسار الاستيراد لصفحة البكالوريا
import BacPage from './components/bac/BacPage';
import TimerPage from './components/TimerPage';
import TDLPage from './components/TDLPage';
import ChallengePage from './components/ChallengePage';
import FocusTimerPage from './components/FocusTimerPage';
// Remove AdminPanel import

const App: React.FC = memo(() => {
  // State to manage the active tab in the bottom navigation
  const [activeTab, setActiveTab] = useState('home');
  // State to hold the user's data from Supabase or local storage
  const [userData, setUserData] = useState<UserData | null>(null);
  // State to manage the initial loading screen of the app
  const [isLoading, setIsLoading] = useState(true);
  // State to control the visibility of the focus timer page
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  // State to control the visibility of the AI chat page
  const [showAIChat, setShowAIChat] = useState(false);
  // State to display loading messages during app initialization
  const [loadingMessage, setLoadingMessage] = useState('جاري التهيئة...');
  // State to track and display the loading progress
  const [loadingProgress, setLoadingProgress] = useState(0);

  // useRef hooks for managing timers and session tracking without causing re-renders
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minuteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPointsUpdateRef = useRef<number>(0);
  const pointsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeUpdateRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const isSessionInitialized = useRef<boolean>(false);
  
  // This useEffect hook is responsible for initializing the app, connecting to Telegram,
  // fetching user data, and setting up initial timers. It runs only once on component mount.
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoadingMessage('... جاري الاتصال بخوادم تيليجرام');
        setLoadingProgress(20);
        const tg = initTelegram();
        setupUserInteractionExpand();
        setTimeout(() => expandTelegramApp(), 1000);

        setLoadingMessage('... جاري إعداد المهام اليومية');
        setLoadingProgress(40);
        await addNewSubscriptionTasks();

        setLoadingMessage('... جاري جلب بيانات حسابك');
        setLoadingProgress(60);
        const telegramUser = getTelegramUser();

        if (telegramUser) {
          setLoadingMessage('... جاري مزامنة بيانات الخاصة بك');
          setLoadingProgress(80);
          const supabaseUserData = await createOrUpdateUser(telegramUser);
          if (supabaseUserData) {
            setUserData(supabaseUserData);
            localStorage.setItem(
              `userTime_${supabaseUserData.id}`,
              supabaseUserData.timeSpent.toString()
            );

            // Initialize session tracking
            sessionStartTimeRef.current = Date.now();
            localStorage.setItem(`sessionStart_${supabaseUserData.id}`, sessionStartTimeRef.current.toString());

            // Initialize the new session tracking system
            await initializeSessionTracking(supabaseUserData.id);
            isSessionInitialized.current = true;
            console.log('Session tracking initialized for user:', supabaseUserData.id);

          } else {
            setLoadingMessage('... جاري استخدام البيانات المحلي');
            const localUserData: UserData = {
              id: telegramUser.id,
              name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
              username: telegramUser.username,
              photo_url: telegramUser.photo_url,
              points: parseInt(localStorage.getItem(`points_${telegramUser.id}`) || '0'),
              rank: parseInt(localStorage.getItem(`rank_${telegramUser.id}`) || '999'),
              timeSpent: parseInt(localStorage.getItem(`userTime_${telegramUser.id}`) || '0')
            };
            setUserData(localUserData);
            sessionStartTimeRef.current = Date.now();
            localStorage.setItem(`sessionStart_${localUserData.id}`, sessionStartTimeRef.current.toString());

            // Initialize session tracking for local user too
            await initializeSessionTracking(localUserData.id);
            isSessionInitialized.current = true;
          }
        } else {
          setLoadingMessage('... جاري تحميل بيانات وضع المطور');
          setUserData({
            id: 123456789,
            name: 'Askeladd Dev',
            username: 'testuser',
            points: 1250,
            rank: 15,
            timeSpent: 3600
          });
          sessionStartTimeRef.current = Date.now();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoadingMessage('حدث خطأ أثناء تحميل');
      } finally {
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    initializeApp();
  }, []);

  // This hook manages the session timers and data saving to the database.
  useEffect(() => {
    if (!userData || !isSessionInitialized.current) return;

    const startGlobalTimer = () => {
      // Clear existing timers to prevent duplicates
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
      if (minuteTimerRef.current) {
        clearInterval(minuteTimerRef.current);
        minuteTimerRef.current = null;
      }

      let currentTime = userData.timeSpent || parseInt(localStorage.getItem(`userTime_${userData.id}`) || '0');

      // Main timer - updates every second
      globalTimerRef.current = setInterval(async () => {
        currentTime++;

        // Update UI
        setUserData(prev => prev ? { ...prev, timeSpent: currentTime } : null);

        // Save locally
        localStorage.setItem(`userTime_${userData.id}`, currentTime.toString());

        // Add points every 10 seconds
        if (currentTime > lastPointsUpdateRef.current && currentTime % 10 === 0) {
          lastPointsUpdateRef.current = currentTime;
          const pointsToAdd = 1;
          setUserData(prev => prev ? { ...prev, points: (prev.points || 0) + pointsToAdd } : null);

          if (pointsUpdateTimeoutRef.current) {
            clearTimeout(pointsUpdateTimeoutRef.current);
          }

          pointsUpdateTimeoutRef.current = setTimeout(async () => {
            try {
              await updateUserPoints(userData.id, pointsToAdd);
              const currentPoints = parseInt(localStorage.getItem(`points_${userData.id}`) || '0');
              localStorage.setItem(`points_${userData.id}`, (currentPoints + pointsToAdd).toString());
            } catch (error) {
              console.error('Error updating points in Supabase:', error);
            }
          }, 500);
        }

        // Update total time in Supabase every minute
        if (Date.now() - lastTimeUpdateRef.current >= 60000) {
          try {
            await updateUserTimeSpent(userData.id, currentTime);
            lastTimeUpdateRef.current = Date.now();
            console.log('Total time updated in users table:', currentTime, 'seconds');
          } catch (error) {
            console.error('Error updating time in Supabase:', error);
          }
        }
      }, 1000);

      // Separate timer for minute-based database saves
      minuteTimerRef.current = setInterval(async () => {
        try {
          await handleMinutelySessionUpdate(userData.id);

          const currentTotalTime = parseInt(localStorage.getItem(`userTime_${userData.id}`) || '0');
          await updateUserTimeSpent(userData.id, currentTotalTime);

          console.log('Minute-based session time saved for user:', userData.id, 'Total time:', currentTotalTime);
        } catch (error) {
          console.error('Error in minute-based session update:', error);
        }
      }, 60000); // 60 seconds

      console.log('Timers started for user:', userData.id);
    };

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App is going to background - save current session time
        try {
          if (isSessionInitialized.current) {
            await handleMinutelySessionUpdate(userData.id);

            const currentTotalTime = parseInt(localStorage.getItem(`userTime_${userData.id}`) || '0');
            await updateUserTimeSpent(userData.id, currentTotalTime);

            console.log('Session time saved on visibility change (hidden)');
          }
        } catch (error) {
          console.error('Error saving session time on visibility change:', error);
        }

        // Clear all timers
        if (globalTimerRef.current) {
          clearInterval(globalTimerRef.current);
          globalTimerRef.current = null;
        }
        if (minuteTimerRef.current) {
          clearInterval(minuteTimerRef.current);
          minuteTimerRef.current = null;
        }
        if (pointsUpdateTimeoutRef.current) {
          clearTimeout(pointsUpdateTimeoutRef.current);
          pointsUpdateTimeoutRef.current = null;
        }
      } else {
        // App is back to foreground - restart timers
        startGlobalTimer();
        console.log('Timers restarted on visibility change (visible)');
      }
    };

    const handleBeforeUnload = async () => {
      if (userData?.id && isSessionInitialized.current) {
        try {
          await handleMinutelySessionUpdate(userData.id);
          const currentTotalTime = parseInt(localStorage.getItem(`userTime_${userData.id}`) || '0');
          await updateUserTimeSpent(userData.id, currentTotalTime);
          await cleanupSessionTracking(userData.id);
          console.log('Session cleaned up on app close');
        } catch (error) {
          console.error('Error cleaning up session on app close:', error);
        }
        localStorage.setItem(`lastVisit_${userData.id}`, Date.now().toString());
      }
    };

    const handleUnload = () => {
      if (userData?.id && isSessionInitialized.current) {
        const data = JSON.stringify({
          userId: userData.id,
          timestamp: Date.now(),
          action: 'save_and_cleanup'
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/session-cleanup', data);
        }

        localStorage.setItem(`lastVisit_${userData.id}`, Date.now().toString());
      }
    };

    startGlobalTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      if (userData?.id && isSessionInitialized.current) {
        const finalCleanup = async () => {
          try {
            await handleMinutelySessionUpdate(userData.id);
            const currentTotalTime = parseInt(localStorage.getItem(`userTime_${userData.id}`) || '0');
            await updateUserTimeSpent(userData.id, currentTotalTime);
            await cleanupSessionTracking(userData.id);
            console.log('Final cleanup completed on component unmount');
          } catch (error) {
            console.error('Error in final cleanup:', error);
          }
        };
        finalCleanup();
      }

      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
      }
      if (minuteTimerRef.current) {
        clearInterval(minuteTimerRef.current);
      }
      if (pointsUpdateTimeoutRef.current) {
        clearTimeout(pointsUpdateTimeoutRef.current);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [userData?.id, isSessionInitialized.current]);

  // Handle tab changes and update session tracking for groups
  useEffect(() => {
    // -- بداية التعديل --
    // هذا هو السطر الذي يحل المشكلة
    // سيتم تنفيذه في كل مرة يتغير فيها activeTab
    window.scrollTo(0, 0);
    // -- نهاية التعديل --

    if (userData?.id && isSessionInitialized.current && activeTab === 'challenge') {
      setTimeout(async () => {
        try {
          await updateSessionGroups(userData.id);
          console.log('Session groups updated after tab change to challenge');
        } catch (error) {
          console.error('Error updating session groups:', error);
        }
      }, 1000);
    }
  }, [activeTab, userData?.id]);

  // Callback function to handle points updates
  const handlePointsUpdate = useCallback(async (points: number) => {
    if (!userData) return;
    const newPoints = (userData.points || 0) + points;
    setUserData({ ...userData, points: newPoints });

    if (pointsUpdateTimeoutRef.current) {
      clearTimeout(pointsUpdateTimeoutRef.current);
    }

    pointsUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateUserPoints(userData.id, points);
      } catch (error) {
        console.error('Error updating points in Supabase:', error);
      }
      localStorage.setItem(`points_${userData.id}`, newPoints.toString());
    }, 500);
  }, [userData]);

  // Callback function to handle time updates
  const handleTimeUpdate = useCallback((seconds: number) => {
    if (userData) {
      setUserData(prev => prev ? { ...prev, timeSpent: seconds } : null);
    }
  }, [userData]);

  // Force session save when user navigates to challenge page
  const handleTabChange = useCallback(async (tab: string) => {
    setActiveTab(tab);

    if ((tab === 'challenge' || activeTab === 'challenge') && userData?.id && isSessionInitialized.current) {
      try {
        await handleMinutelySessionUpdate(userData.id);
        await updateSessionGroups(userData.id);
        console.log('Session updated for challenge page navigation');
      } catch (error) {
        console.error('Error updating session for challenge navigation:', error);
      }
    }
  }, [activeTab, userData?.id, isSessionInitialized.current]);

  // Display a loading screen while the app is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="mb-8 transform scale-100 animate-pulse-once">
          <h1 className="text-6xl font-extrabold text-blue-700 drop-shadow-lg logo-font">Revisa</h1>
          <p className="text-lg text-gray-600 mt-2 tracking-wide">رفيقك للدراسة والنجاح</p>
        </div>

        <div className="w-64 bg-gray-200 rounded-full h-3 mb-6 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>

        <p className="text-gray-700 text-lg font-medium mb-3">{loadingMessage}</p>
        <p className="text-gray-500 text-sm">{loadingProgress}%</p>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 opacity-80 mt-8"></div>
      </div>
    );
  }

  // If the AI chat page is active, render it and nothing else.
  // The 'onClose' prop allows the chat page to return to the main app view.
  if (showAIChat) {
    return <AIChatPage onClose={() => setShowAIChat(false)} />;
  }

  // A function to render the currently active tab component
  const renderActiveTab = () => {
    // Pass the onClose prop to the FocusTimerPage
    if (showFocusTimer) return <FocusTimerPage onClose={() => setShowFocusTimer(false)} />;

    switch (activeTab) {
      case 'home': return <HomePage userData={userData} onPointsUpdate={handlePointsUpdate} onTabChange={handleTabChange} />;
      case 'tasks': return <TasksPage onPointsUpdate={handlePointsUpdate} userData={userData} />;
      case 'ranking': return <RankingPage currentUser={userData} onTabChange={handleTabChange} />;
      case 'bac': return <BacPage userData={userData} />;
      case 'timer': return <TimerPage onPointsUpdate={handlePointsUpdate} onTimeUpdate={handleTimeUpdate} userData={userData} />;
      case 'tdl': return <TDLPage userData={userData} onShowFocusTimer={() => setShowFocusTimer(true)} />;
      case 'challenge': return <ChallengePage currentUser={userData} />;
      default: return <HomePage userData={userData} onPointsUpdate={handlePointsUpdate} onTabChange={handleTabChange} />;
    }
  };

  // Determine if the AI chat button should be visible based on the current view
  const isAIChatButtonVisible = ['home', 'ranking', 'tasks', 'bac', 'tdl'].includes(activeTab) && !showFocusTimer && !showAIChat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100" dir="rtl">
      {isAIChatButtonVisible && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:scale-110 active:scale-95 animate-pulse-once"
          title="مساعد الذكاء الاصطناعي"
        >
          <BrainCircuit size={24} />
        </button>
      )}

      {/* Conditional rendering of main content and BottomNavigation */}
      {showFocusTimer ? (
        // The FocusTimerPage takes the full screen and does not need a bottom bar
        renderActiveTab()
      ) : (
        <>
          <main className="min-h-screen pb-20">{renderActiveTab()}</main>
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}
    </div>
  );
});

App.displayName = 'App';
export default App;
