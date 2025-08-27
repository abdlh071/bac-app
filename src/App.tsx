import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

// ✅ استيراد Supabase Auth بدلاً من تيليجرام
import { supabase } from './integrations/supabase/client';

// ✅ صفحة الدردشة بالذكاء الاصطناعي كما كانت
import AIChatPage from './components/AIChatPage';

// ✅ الأيقونات كما هي (بدون تغيير في المنطق)
import { Plus, Edit, Trash2, Save, Eye, EyeOff, Send, BrainCircuit, Loader2, Book } from 'lucide-react';

// ⛔️ إزالة استيراد تيليجرام نهائياً
// import { initTelegram, getTelegramUser, expandTelegramApp, setupUserInteractionExpand } from './utils/telegram';

// ✅ الإبقاء على نفس أسماء الدوال من supabase utils لكن سيتم تكييفها داخلياً للعمل مع Google Auth
import {
  createOrUpdateUser, // الآن ستستقبل بيانات المستخدم من Supabase Auth بدلاً من Telegram (سنعدلها في الملف الثاني)
  updateUserPoints,
  updateUserTimeSpent,
  addNewSubscriptionTasks,
  initializeSessionTracking,
  updateSessionGroups,
  cleanupSessionTracking,
  handleMinutelySessionUpdate
} from './utils/supabase';

// ✅ نوع البيانات للمستخدم — سنبقيه كما هو اسمًا (UserData) للحفاظ على التوافق مع بقية الكود
// ملاحظة: سنجعل الحقل id من نوع string (معرّف Supabase Auth)
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

// ✅ صفحة تسجيل الدخول الجديدة (سنرسلها في ملف منفصل)
import LoginPage from './components/LoginPage';

// =============================================================
//                    مكون التطبيق الرئيسي
//            (تم تحويله للعمل بجوجل عبر Supabase)
// =============================================================
const App: React.FC = memo(() => {
  // إدارة التبويب النشط
  const [activeTab, setActiveTab] = useState('home');

  // بيانات المستخدم من Supabase (بعد المزامنة مع جدول users)
  const [userData, setUserData] = useState<UserData | null>(null);

  // حالة التحميل الأولي للتطبيق
  const [isLoading, setIsLoading] = useState(true);

  // عرض/إخفاء مؤقّت التركيز
  const [showFocusTimer, setShowFocusTimer] = useState(false);

  // عرض/إخفاء صفحة الدردشة بالذكاء الاصطناعي
  const [showAIChat, setShowAIChat] = useState(false);

  // رسائل التحميل
  const [loadingMessage, setLoadingMessage] = useState('جاري التهيئة...');

  // نسبة التقدم في التحميل
  const [loadingProgress, setLoadingProgress] = useState(0);

  // حالة التوثيق: هل المستخدم مسجل دخولاً عبر Google؟
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // مراجع المؤقتات وتتبع الجلسة
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minuteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPointsUpdateRef = useRef<number>(0);
  const pointsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeUpdateRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const isSessionInitialized = useRef<boolean>(false);

  // =============================================================
  //                 التهيئة العامة للتطبيق + الجلسة
  //     (استبدال منطق تيليجرام بمنطق Supabase Auth + Google)
  // =============================================================
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoadingMessage('... جاري التحقق من جلسة تسجيل الدخول عبر جوجل');
        setLoadingProgress(15);

        // 1) الحصول على الجلسة الحالية من Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Auth session error:', sessionError);
        }

        // 2) الاستماع لتغيّرات حالة المصادقة (تسجيل دخول/خروج)
        supabase.auth.onAuthStateChange(async (_event, newSession) => {
          setIsAuthenticated(!!newSession?.user);
          if (newSession?.user) {
            // عند تسجيل الدخول — قم بمزامنة المستخدم
            await syncUserFromAuth(newSession.user);
          } else {
            // عند تسجيل الخروج
            setUserData(null);
            isSessionInitialized.current = false;
          }
        });

        if (!session?.user) {
          // لا يوجد مستخدم — عرض شاشة تسجيل الدخول
          setIsAuthenticated(false);
          setLoadingProgress(100);
          setTimeout(() => setIsLoading(false), 300);
          return;
        }

        setIsAuthenticated(true);

        // 3) إعداد المهام (كما هو)
        setLoadingMessage('... جاري إعداد المهام اليومية');
        setLoadingProgress(35);
        await addNewSubscriptionTasks();

        // 4) مزامنة بيانات المستخدم مع قاعدة البيانات (users)
        setLoadingMessage('... جاري جلب بيانات حسابك');
        setLoadingProgress(60);
        await syncUserFromAuth(session.user);

        setLoadingProgress(100);
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoadingMessage('حدث خطأ أثناء التحميل');
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    // دالة مساعدة: مزامنة مستخدم Supabase Auth مع جدول users
    const syncUserFromAuth = async (authUser: any) => {
      try {
        setLoadingMessage('... جاري مزامنة بياناتك مع قاعدة البيانات');
        setLoadingProgress((p) => Math.max(p, 75));

        // createOrUpdateUser الآن ستتعامل مع مستخدم Supabase مباشرة (سنعدلها في utils)
        const supabaseUserData = await createOrUpdateUser({
          id: authUser.id,
          email: authUser.email,
          name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.user_metadata?.user_name ||
            authUser.email?.split('@')[0] ||
            'مستخدم',
          avatar_url: authUser.user_metadata?.avatar_url || undefined,
        } as any);

        if (supabaseUserData) {
          // نتوقع أن يعود الشكل: { id: string, name, username?, photo_url?, points, rank, timeSpent }
          setUserData(supabaseUserData);

          // تخزين الوقت محلياً لكل مستخدم
          localStorage.setItem(
            `userTime_${supabaseUserData.id}`,
            (supabaseUserData.timeSpent || 0).toString()
          );

          // تهيئة تتبع الجلسة
          sessionStartTimeRef.current = Date.now();
          localStorage.setItem(
            `sessionStart_${supabaseUserData.id}`,
            sessionStartTimeRef.current.toString()
          );

          // بدء نظام تتبع الجلسة الجديد
          await initializeSessionTracking(supabaseUserData.id);
          isSessionInitialized.current = true;
          console.log('Session tracking initialized for user:', supabaseUserData.id);
        } else {
          // في حال تعذر التزامن لأي سبب — استخدام بيانات محلية افتراضية
          const fallbackId = authUser.id as string;
          const localUserData: UserData = {
            id: fallbackId as unknown as any,
            name:
              authUser.user_metadata?.full_name ||
              authUser.email?.split('@')[0] ||
              'مستخدم',
            username: undefined,
            photo_url: authUser.user_metadata?.avatar_url || undefined,
            points: parseInt(localStorage.getItem(`points_${fallbackId}`) || '0'),
            rank: parseInt(localStorage.getItem(`rank_${fallbackId}`) || '999'),
            timeSpent: parseInt(localStorage.getItem(`userTime_${fallbackId}`) || '0'),
          } as any;

          setUserData(localUserData);

          sessionStartTimeRef.current = Date.now();
          localStorage.setItem(
            `sessionStart_${localUserData.id}`,
            sessionStartTimeRef.current.toString()
          );

          await initializeSessionTracking(localUserData.id as any);
          isSessionInitialized.current = true;
        }
      } catch (e) {
        console.error('syncUserFromAuth error:', e);
      }
    };

    initializeApp();
  }, []);

  // =============================================================
  //        إدارة المؤقتات وتخزين الوقت والنقاط كما كانت
  // =============================================================
  useEffect(() => {
    if (!userData || !isSessionInitialized.current) return;

    const startGlobalTimer = () => {
      // تنظيف المؤقتات القديمة
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
      if (minuteTimerRef.current) {
        clearInterval(minuteTimerRef.current);
        minuteTimerRef.current = null;
      }

      let currentTime =
        userData.timeSpent ||
        parseInt(localStorage.getItem(`userTime_${userData.id}`) || '0');

      // مؤقت رئيسي — كل ثانية
      globalTimerRef.current = setInterval(async () => {
        currentTime++;

        // تحديث الواجهة
        setUserData((prev) => (prev ? { ...prev, timeSpent: currentTime } : null));

        // حفظ محلي
        localStorage.setItem(`userTime_${userData.id}`, currentTime.toString());

        // إضافة نقاط كل 10 ثوان
        if (currentTime > lastPointsUpdateRef.current && currentTime % 10 === 0) {
          lastPointsUpdateRef.current = currentTime;
          const pointsToAdd = 1;
          setUserData((prev) => (prev ? { ...prev, points: (prev.points || 0) + pointsToAdd } : null));

          if (pointsUpdateTimeoutRef.current) {
            clearTimeout(pointsUpdateTimeoutRef.current);
          }

          pointsUpdateTimeoutRef.current = setTimeout(async () => {
            try {
              await updateUserPoints(String(userData.id), pointsToAdd);
              const currentPoints = parseInt(
                localStorage.getItem(`points_${userData.id}`) || '0'
              );
              localStorage.setItem(
                `points_${userData.id}`,
                (currentPoints + pointsToAdd).toString()
              );
            } catch (error) {
              console.error('Error updating points in Supabase:', error);
            }
          }, 500);
        }

        // تحديث الوقت الكلي في Supabase كل دقيقة
        if (Date.now() - lastTimeUpdateRef.current >= 60000) {
          try {
            await updateUserTimeSpent(String(userData.id), currentTime);
            lastTimeUpdateRef.current = Date.now();
            console.log('Total time updated in users table:', currentTime, 'seconds');
          } catch (error) {
            console.error('Error updating time in Supabase:', error);
          }
        }
      }, 1000);

      // مؤقت منفصل لحفظ بيانات الدقيقة
      minuteTimerRef.current = setInterval(async () => {
        try {
          await handleMinutelySessionUpdate(String(userData.id));

          const currentTotalTime = parseInt(
            localStorage.getItem(`userTime_${userData.id}`) || '0'
          );
          await updateUserTimeSpent(String(userData.id), currentTotalTime);

          console.log(
            'Minute-based session time saved for user:',
            userData.id,
            'Total time:',
            currentTotalTime
          );
        } catch (error) {
          console.error('Error in minute-based session update:', error);
        }
      }, 60000); // 60 ثانية

      console.log('Timers started for user:', userData.id);
    };

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // التطبيق بالخلفية — حفظ الوقت الحالي
        try {
          if (isSessionInitialized.current) {
            await handleMinutelySessionUpdate(String(userData.id));

            const currentTotalTime = parseInt(
              localStorage.getItem(`userTime_${userData.id}`) || '0'
            );
            await updateUserTimeSpent(String(userData.id), currentTotalTime);

            console.log('Session time saved on visibility change (hidden)');
          }
        } catch (error) {
          console.error('Error saving session time on visibility change:', error);
        }

        // إيقاف المؤقتات
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
        // العودة للمقدمة — إعادة تشغيل المؤقتات
        startGlobalTimer();
        console.log('Timers restarted on visibility change (visible)');
      }
    };

    const handleBeforeUnload = async () => {
      if (userData?.id && isSessionInitialized.current) {
        try {
          await handleMinutelySessionUpdate(String(userData.id));
          const currentTotalTime = parseInt(
            localStorage.getItem(`userTime_${userData.id}`) || '0'
          );
          await updateUserTimeSpent(String(userData.id), currentTotalTime);
          await cleanupSessionTracking(String(userData.id));
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
          action: 'save_and_cleanup',
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
            await handleMinutelySessionUpdate(String(userData.id));
            const currentTotalTime = parseInt(
              localStorage.getItem(`userTime_${userData.id}`) || '0'
            );
            await updateUserTimeSpent(String(userData.id), currentTotalTime);
            await cleanupSessionTracking(String(userData.id));
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

  // =============================================================
  //  حفظ موضع الصفحة + تحديث مجموعات الجلسة عند الانتقال للتحدي
  // =============================================================
  useEffect(() => {
    // حل مشكلة التمرير — كل تغيير تبويب يرجع للأعلى
    window.scrollTo(0, 0);

    if (userData?.id && isSessionInitialized.current && activeTab === 'challenge') {
      setTimeout(async () => {
        try {
          await updateSessionGroups(String(userData.id));
          console.log('Session groups updated after tab change to challenge');
        } catch (error) {
          console.error('Error updating session groups:', error);
        }
      }, 1000);
    }
  }, [activeTab, userData?.id]);

  // =============================================================
  //                ردود نداء للنقاط والوقت (كما هي)
  // =============================================================
  const handlePointsUpdate = useCallback(
    async (points: number) => {
      if (!userData) return;
      const newPoints = (userData.points || 0) + points;
      setUserData({ ...userData, points: newPoints });

      if (pointsUpdateTimeoutRef.current) {
        clearTimeout(pointsUpdateTimeoutRef.current);
      }

      pointsUpdateTimeoutRef.current = setTimeout(async () => {
        try {
          await updateUserPoints(String(userData.id), points);
        } catch (error) {
          console.error('Error updating points in Supabase:', error);
        }
        localStorage.setItem(`points_${userData.id}`, newPoints.toString());
      }, 500);
    },
    [userData]
  );

  const handleTimeUpdate = useCallback(
    (seconds: number) => {
      if (userData) {
        setUserData((prev) => (prev ? { ...prev, timeSpent: seconds } : null));
      }
    },
    [userData]
  );

  // =============================================================
  //                    تغيير التبويب + حفظ الجلسة
  // =============================================================
  const handleTabChange = useCallback(
    async (tab: string) => {
      setActiveTab(tab);

      if (
        (tab === 'challenge' || activeTab === 'challenge') &&
        userData?.id &&
        isSessionInitialized.current
      ) {
        try {
          await handleMinutelySessionUpdate(String(userData.id));
          await updateSessionGroups(String(userData.id));
          console.log('Session updated for challenge page navigation');
        } catch (error) {
          console.error('Error updating session for challenge navigation:', error);
        }
      }
    },
    [activeTab, userData?.id, isSessionInitialized.current]
  );

  // =============================================================
  //                      شاشات التحميل/الدخول
  // =============================================================
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

  // إن لم يكن المستخدم مسجلاً — نعرض صفحة تسجيل الدخول الجديدة (زر Google فقط)
  if (!isAuthenticated || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100" dir="rtl">
        <LoginPage />
      </div>
    );
  }

  // عند تفعيل صفحة دردشة الذكاء الاصطناعي — نعرضها فقط
  if (showAIChat) {
    return <AIChatPage onClose={() => setShowAIChat(false)} />;
  }

  // =============================================================
  //                 عرض التبويب النشط كما كان سابقًا
  // =============================================================
  const renderActiveTab = () => {
    if (showFocusTimer) return <FocusTimerPage onClose={() => setShowFocusTimer(false)} />;

    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            userData={userData}
            onPointsUpdate={handlePointsUpdate}
            onTabChange={handleTabChange}
          />
        );
      case 'tasks':
        return <TasksPage onPointsUpdate={handlePointsUpdate} userData={userData} />;
      case 'ranking':
        return <RankingPage currentUser={userData} onTabChange={handleTabChange} />;
      case 'bac':
        return <BacPage userData={userData} />;
      case 'timer':
        return (
          <TimerPage
            onPointsUpdate={handlePointsUpdate}
            onTimeUpdate={handleTimeUpdate}
            userData={userData}
          />
        );
      case 'tdl':
        return <TDLPage userData={userData} onShowFocusTimer={() => setShowFocusTimer(true)} />;
      case 'challenge':
        return <ChallengePage currentUser={userData} />;
      default:
        return (
          <HomePage
            userData={userData}
            onPointsUpdate={handlePointsUpdate}
            onTabChange={handleTabChange}
          />
        );
    }
  };

  // إظهار زر الذكاء الاصطناعي في الصفحات المحددة فقط
  const isAIChatButtonVisible =
    ['home', 'ranking', 'tasks', 'bac', 'tdl'].includes(activeTab) &&
    !showFocusTimer &&
    !showAIChat;

  // =============================================================
  //                          الواجهة
  // =============================================================
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

      {/* العرض الرئيسي + شريط التنقل السفلي */}
      {showFocusTimer ? (
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
