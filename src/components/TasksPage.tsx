import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Task } from '../types/telegram';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Calendar,
  Trophy,
  Filter,
  Search,
  X,
  BookOpen,
  Star
} from 'lucide-react';
import { openTelegramLink } from '../utils/telegram';
import {
  getTasks,
  getUserCompletedTasks,
  completeTask,
  getUserCompletedTasksCount,
} from '../utils/supabase';
import { useToast } from '../hooks/use-toast';

interface TasksPageProps {
  onPointsUpdate: (points: number) => void;
  userData?: { id: number; points?: number } | null;
}

type TaskTypeKey = 'all' | 'daily' | 'tdl' | 'level' | 'subscription' | 'link';

const CATEGORY_ORDER: TaskTypeKey[] = ['all', 'daily', 'tdl', 'level', 'subscription', 'link'];

const CATEGORY_META: Record<Exclude<TaskTypeKey, 'all'>, { label: string; Icon: any; color: string; bgColor: string; gradient: string }> = {
  daily: { label: 'المهام اليومية', Icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100', gradient: 'from-blue-500 to-cyan-500' },
  tdl: { label: 'مهام TDL', Icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-100', gradient: 'from-green-500 to-teal-600' },
  level: { label: 'مهام المستوى', Icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-100', gradient: 'from-orange-500 to-red-600' },
  subscription: { label: 'مهام الاشتراك', Icon: ExternalLink, color: 'text-red-600', bgColor: 'bg-red-100', gradient: 'from-purple-500 to-pink-500' },
  link: { label: 'مهام الروابط', Icon: ExternalLink, color: 'text-green-600', bgColor: 'bg-green-100', gradient: 'from-purple-500 to-indigo-600' },
};

const TasksPage: React.FC<TasksPageProps> = memo(({ onPointsUpdate, userData }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);
  const [lastDailyLogin, setLastDailyLogin] = useState<string | null>(
    userData?.id ? localStorage.getItem(`lastDailyLogin_${userData.id}`) : null
  );

  const [activeTab, setActiveTab] = useState<TaskTypeKey | null>(null);

  const { toast } = useToast();

  // تثبيت تاريخ اليوم
  const today = useMemo(() => new Date().toDateString(), []);

  /** تحميل المهام + حالة الإنجاز - مرة واحدة فقط عند تحميل الصفحة */
  const fetchTasks = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      const fetchedTasks = await getTasks();

      const [completedTaskIds, completedCount] = await Promise.all([
        getUserCompletedTasks(userData.id.toString()),
        getUserCompletedTasksCount(userData.id.toString()),
      ]);

      const completedSet = new Set<string>(completedTaskIds);
      setCompletedTasks(completedSet);
      setCompletedTasksCount(completedCount);

      const updated = fetchedTasks.map((task) => {
        // ✨ New: Daily tasks are no longer marked as completed here.
        // Their state will be managed by `lastDailyLogin` in the UI logic.
        if ((task as any).type === 'subscription' || (task as any).type === 'level' || (task as any).type === 'tdl' || (task as any).type === 'link') {
          const isCompleted = completedSet.has((task as any).id);

          if ((task as any).type === 'level') {
            const title: string = (task as any).title || '';
            const requiredPoints = title.includes('5,000')
              ? 5000
              : title.includes('10,000')
              ? 10000
              : title.includes('20,000')
              ? 20000
              : title.includes('40,000')
              ? 40000
              : title.includes('100,000')
              ? 100000
              : 0;
            const userPoints = userData?.points || 0;
            const canComplete = userPoints >= requiredPoints;
            return { ...(task as any), completed: isCompleted, canComplete } as Task & { canComplete: boolean };
          }

          return { ...(task as any), completed: isCompleted } as Task;
        }
        return task;
      });

      setTasks(updated);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'خطأ في تحميل المهام',
        description: 'حدث خطأ أثناء تحميل المهام، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [lastDailyLogin, userData?.id, userData?.points, today, toast]);

  // تحميل البيانات مرة واحدة فقط عند تحميل الصفحة
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /** فحص بداية يوم جديد - فقط للمهام اليومية */
  useEffect(() => {
    if (!userData?.id) return;

    const checkNewDay = () => {
      const currentToday = new Date().toDateString();
      if (lastDailyLogin && lastDailyLogin !== currentToday) {
        // ✨ New: The 'completed' state for daily tasks is handled here
        // This makes sure the button becomes available again at midnight.
        setTasks((prev) =>
          prev.map((task: any) => (task.type === 'daily' ? { ...task, completed: false } : task))
        );
        // localStorage.removeItem(`lastDailyLogin_${userData.id}`); // This line is not needed. The next login will overwrite it.
      }
    };

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timeoutId = window.setTimeout(() => {
      checkNewDay();
    }, msUntilMidnight);

    return () => window.clearTimeout(timeoutId);
  }, [lastDailyLogin, userData?.id]);

  /** إكمال المهام */
  const handleTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!userData?.id) return;

      const task = tasks.find((t: any) => t.id === taskId) as any;
      if (!task || task.completed) return;

      try {
        if (task.type === 'subscription' || task.type === 'link') {
          if (task.url) {
            try {
              openTelegramLink(task.url);
            } catch (e) {
              console.error('Error opening link', e);
            }
          }

          const success = await completeTask(userData.id.toString(), taskId);
          if (success) {
            const next = new Set(completedTasks);
            next.add(taskId);
            setCompletedTasks(next);
            setCompletedTasksCount((c) => c + 1);
            setTasks((prev) => prev.map((t: any) => (t.id === taskId ? { ...t, completed: true } : t)));

            // إضافة النقاط
            setTimeout(() => onPointsUpdate(task.points), 100);

            toast({
              title: 'تم إنجاز المهمة!',
              description: `تم إضافة ${task.points} نقطة إلى رصيدك`,
              variant: 'default',
            });
          } else {
            throw new Error('Failed to complete task in database');
          }
        } else if (task.type === 'daily') {
          const currentToday = new Date().toDateString();
          localStorage.setItem(`lastDailyLogin_${userData.id}`, currentToday);
          setLastDailyLogin(currentToday);
          setTasks((prev) => prev.map((t: any) => (t.id === taskId ? { ...t, completed: true } : t)));
          setTimeout(() => onPointsUpdate(150), 100);
          toast({ title: 'تم تسجيل الدخول اليومي!', description: 'تم إضافة 150 نقطة إلى رصيدك', variant: 'default' });
        } else if (task.type === 'level') {
          const title: string = task.title || '';
          const requiredPoints = title.includes('5,000')
            ? 5000
            : title.includes('10,000')
            ? 10000
            : title.includes('20,000')
            ? 20000
            : title.includes('40,000')
            ? 40000
            : title.includes('100,000')
            ? 100000
            : 0;
          const userPoints = userData?.points || 0;
          if (userPoints < requiredPoints) {
            toast({
              title: 'نقاط غير كافية',
              description: `تحتاج إلى ${requiredPoints.toLocaleString()} نقطة لإنجاز هذه المهمة`,
              variant: 'destructive',
            });
            return;
          }

          const success = await completeTask(userData.id.toString(), taskId);
          if (success) {
            const next = new Set(completedTasks);
            next.add(taskId);
            setCompletedTasks(next);
            setCompletedTasksCount((c) => c + 1);
            setTasks((prev) => prev.map((t: any) => (t.id === taskId ? { ...t, completed: true } : t)));
            setTimeout(() => onPointsUpdate(task.points), 100);
            toast({ title: 'تم إنجاز مهمة المستوى!', description: `تم إضافة ${task.points} نقطة إلى رصيدك`, variant: 'default' });
          } else {
            throw new Error('Failed to complete task in database');
          }
        } else if (task.type === 'tdl') {
          const success = await completeTask(userData.id.toString(), taskId);
          if (success) {
            const next = new Set(completedTasks);
            next.add(taskId);
            setCompletedTasks(next);
            setCompletedTasksCount((c) => c + 1);
            setTasks((prev) => prev.map((t: any) => (t.id === taskId ? { ...t, completed: true } : t)));
            setTimeout(() => onPointsUpdate(task.points), 100);
            toast({ title: 'تم إنجاز مهمة TDL!', description: `تم إضافة ${task.points} نقطة إلى رصيدك`, variant: 'default' });
          } else {
            throw new Error('Failed to complete task in database');
          }
        }
      } catch (error) {
        console.error('Error completing task:', error);
        toast({ title: 'خطأ في إنجاز المهمة', description: 'حدث خطأ أثناء إنجاز المهمة، يرجى المحاولة مرة أخرى', variant: 'destructive' });
      }
    },
    [userData?.id, tasks, completedTasks, onPointsUpdate, toast]
  );

  /** اشتقاقات: تجميع بالأنواع + عدّادات */
  const tasksByType = useMemo(() => {
    const acc: Record<string, (Task & { canComplete?: boolean; unlock_condition?: number })[]> = {};
    for (const t of tasks as any[]) {
      const type = (t.type || 'other') as string;
      if (!acc[type]) acc[type] = [];
      acc[type].push(t);
    }
    return acc;
  }, [tasks]);

  const totalCounts = useMemo(() => {
    const base = { all: tasks.length } as Record<TaskTypeKey, number> & { all: number };
    (['daily', 'tdl', 'level', 'subscription', 'link'] as TaskTypeKey[]).forEach((k) => {
      base[k] = (tasksByType[k] || []).length;
    });
    return base;
  }, [tasks, tasksByType]);

  const completeCounts = useMemo(() => {
    // This is no longer accurate for daily tasks, but it's okay because we check `lastDailyLogin` in `TaskCard`.
    const base = { all: tasks.filter((t: any) => t.completed).length } as Record<TaskTypeKey, number> & { all: number };
    (['daily', 'tdl', 'level', 'subscription', 'link'] as TaskTypeKey[]).forEach((k) => {
      base[k] = (tasksByType[k] || []).filter((t: any) => t.completed).length;
    });
    return base;
  }, [tasks, tasksByType]);

  const filteredTasksForTab = useMemo(() => {
    if (activeTab && activeTab !== 'all') {
      return (tasksByType[activeTab] || []).slice();
    }
    return [];
  }, [activeTab, tasksByType]);

  /** عناصر واجهة المستخدم */
  const TaskCard: React.FC<{ t: any }> = ({ t }) => {
    const type = (t.type || 'other') as TaskTypeKey;
    // We now check `lastDailyLogin` here to determine if the daily task is completed for the current day.
    const isCompleted = type === 'daily' ? lastDailyLogin === today : !!t.completed;
    let canComplete = true;

    if (type === 'level') {
      canComplete = !!t.canComplete;
    } else if (type === 'daily') {
      // The condition is the same, but now it's correctly used to enable/disable the button.
      canComplete = lastDailyLogin !== today;
    } else if (type === 'tdl') {
      const unlockCondition = (t as any).unlock_condition as number | undefined;
      if (unlockCondition) {
        canComplete = completedTasksCount >= unlockCondition;
      }
    }

    return (
      <div
        key={t.id}
        className={`p-4 rounded-2xl border-2 transition-all ${
          isCompleted
            ? 'bg-green-50 border-green-200'
            : canComplete
            ? 'bg-white border-gray-200 hover:border-blue-300'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">{t.title}</h3>
            {t.description && <p className="text-sm text-gray-600 mb-2">{t.description}</p>}
            <div className="flex items-center text-sm gap-2 flex-wrap">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">+{type === 'daily' ? 150 : t.points} نقطة</span>

              {isCompleted && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">{type === 'daily' ? 'مكتمل اليوم' : 'مكتملة'}</span>
              )}

              {type === 'level' && !canComplete && !isCompleted && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">نقاط غير كافية</span>
              )}

              {type === 'tdl' && !canComplete && !isCompleted && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                  مقفل - أكمل {(t as any).unlock_condition || 50} مهمة
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleTaskCompletion(t.id)}
            disabled={!canComplete || isCompleted}
            className={`ml-4 px-4 py-2 rounded-xl font-medium transition-colors ${
              isCompleted
                ? 'bg-green-500 text-white cursor-not-allowed'
                : canComplete
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <CheckCircle size={20} />
            ) : canComplete ? (
              type === 'daily' ? 'سجّل الدخول' : type === 'level' ? 'استلم' : type === 'tdl' ? 'استلم' : 'ابدأ'
            ) : (
              'مقفل'
            )}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 pb-20 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-lg">
          <div className="h-28 bg-gray-300 rounded-2xl"></div>
          <div className="h-28 bg-gray-300 rounded-2xl"></div>
          <div className="h-28 bg-gray-300 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-lg mx-auto">
        {/* New Points Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl relative overflow-hidden transform transition-transform duration-300 hover:scale-105">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-70"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-400 p-2 rounded-full transform rotate-12 transition-transform duration-500">
                <Star size={24} className="text-white animate-spin-slow" />
              </div>
              <h2 className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                أهمية النقاط
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              يمكنك استخدام النقاط في بعض من أقسام التطبيق مثل <b className="text-purple-600">كويز</b> و كذلك رفع مستوى نقاطك للتنافس مع بقية التلاميذ.
            </p>
          </div>
        </div>

        {CATEGORY_ORDER.filter((k) => k !== 'all' && totalCounts[k] > 0).map((k) => {
          const { label, Icon, gradient } = CATEGORY_META[k as Exclude<TaskTypeKey, 'all'>];
          const isActive = activeTab === k;
          
          return (
            <div key={k}>
              <div
                className={`group bg-gradient-to-r ${gradient} p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden cursor-pointer mt-6`}
                onClick={() => setActiveTab(isActive ? null : k as TaskTypeKey)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={24} className="group-hover:animate-bounce transition-transform duration-700" />
                  <span className="text-sm opacity-90">{label}</span>
                </div>
                <div className="text-sm opacity-90">
                  {totalCounts[k] || 0} مهمة متاحة
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              
              {isActive && (
                <div className="mt-6 space-y-4 transition-all duration-500 ease-in-out">
                  {filteredTasksForTab.length === 0 ? (
                    <div className="text-center text-gray-500 border rounded-2xl p-8">
                      لا توجد مهام من هذا النوع.
                    </div>
                  ) : (
                    filteredTasksForTab.map((t: any) => (
                      <TaskCard key={t.id} t={t} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

TasksPage.displayName = 'TasksPage';

export default TasksPage;
