import { supabase } from '../integrations/supabase/client';
// ✅ تكييف الأنواع للاعتماد على معرف Supabase (UUID) بدلاً من تيليجرام
// ملاحظة: نبقي أسماء الدوال كما هي للحفاظ على التوافق مع بقية المشروع

// إزالة TelegramUser
// import { TelegramUser, UserData, Task } from '../types/telegram';
import { UserData, Task } from '../types/telegram';

// تعريف مبسط لبيانات مستخدم قادمة من Supabase Auth
type AuthProfile = {
  id: string; // Supabase Auth user id (UUID)
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
};

// Cache for tasks to reduce database calls
let tasksCache: { data: Task[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debouncing map for user updates (باستخدام userId كسلسلة)
const updateTimeouts = new Map<string, NodeJS.Timeout>();

// Session tracking for daily time calculation
interface SessionData {
  userId: string;
  sessionStart: number;
  lastSavedTime: number;
  groups: string[];
}

const activeSessions = new Map<string, SessionData>();

// Helper function to safely extract display name
const getDisplayName = (p?: Pick<AuthProfile, 'name' | 'email' | 'username'>) => {
  if (!p) return 'مستخدم';
  return (
    p.name || p.username || (p.email ? p.email.split('@')[0] : 'مستخدم')
  );
};

// Helper function to get user completed tasks count
export async function getUserCompletedTasksCount(userId: string): Promise<number> {
  try {
    // أولاً نحاول عبر RPC جديد يدعم user_id كنص
    const { data: rpc1, error: rpc1Err } = await supabase.rpc(
      'get_user_completed_tasks_count_by_user_id',
      { p_user_id: userId }
    );
    if (!rpc1Err) return rpc1 || 0;

    // رجوع لـ RPC القديم إن وُجد (قد يكون تم تحديثه داخلياً)
    const { data, error } = await supabase.rpc(
      'get_user_completed_tasks_count',
      { p_user_id: userId }
    );
    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error getting user completed tasks count:', error);
    // محاولة احتياطية عبر query
    try {
      const { count } = await supabase
        .from('user_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return count || 0;
    } catch (e) {
      console.error('Fallback count error:', e);
      return 0;
    }
  }
}

// =============================
//  إنشاء/تحديث المستخدم في جدول users
// =============================
export const createOrUpdateUser = async (
  profile: AuthProfile
): Promise<UserData | null> => {
  try {
    // 1) محاولة جلب المستخدم الحالي (حسب id الجديد)
    const { data: existingUser, error: selError } = await supabase
      .from('users')
      .select('*')
      .eq('id', profile.id)
      .maybeSingle();

    if (selError && selError.code !== 'PGRST116') {
      // PGRST116 = RowNotFound; يمكن تجاهلها
      console.warn('Select user warning:', selError.message);
    }

    const baseName = getDisplayName({ name: profile.name, email: profile.email, username: profile.username });

    if (existingUser) {
      // 2) تحديث مستخدم موجود
      const { data, error } = await supabase
        .from('users')
        .update({
          name: baseName,
          username: profile.username || null,
          photo_url: profile.avatar_url || null,
          email: profile.email || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      // جلب ترتيب المستخدم عبر RPC جديد أو إيجاد بديل
      const rank = await getUserRankById(profile.id, data?.points ?? 0);

      return {
        id: data.id,
        name: data.name,
        username: data.username || undefined,
        photo_url: data.photo_url || undefined,
        points: data.points,
        rank: rank ?? 999,
        timeSpent: data.time_spent,
      } as UserData;
    } else {
      // 3) إنشاء مستخدم جديد
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: profile.id,
          name: baseName,
          username: profile.username || null,
          photo_url: profile.avatar_url || null,
          email: profile.email || null,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        username: data.username || undefined,
        photo_url: data.photo_url || undefined,
        points: data.points,
        rank: 999,
        timeSpent: data.time_spent,
      } as UserData;
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
};

// جلب ترتيب المستخدم حسب user_id
const getUserRankById = async (userId: string, currentPoints: number): Promise<number | null> => {
  try {
    // محاولة عبر RPC حديث
    const { data: rpcRank, error: rpcErr } = await supabase.rpc(
      'get_user_ranking_by_user_id',
      { p_user_id: userId }
    );
    if (!rpcErr && typeof rpcRank === 'number') return rpcRank;
  } catch (e) {
    // نتجاهل الخطأ ونستخدم طريقة بديلة
  }
  try {
    // بديل سريع: عدد المستخدمين الذين نقاطهم > نقاط المستخدم + 1
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('points', currentPoints);
    if (error) throw error;
    return (count || 0) + 1;
  } catch (e) {
    console.error('Fallback rank error:', e);
    return null;
  }
};

// =============================
//  تحديث نقاط المستخدم (مفلترة)
// =============================
export const updateUserPoints = async (
  userId: string,
  points: number
): Promise<void> => {
  try {
    // Clear existing timeout for this user
    if (updateTimeouts.has(userId)) {
      clearTimeout(updateTimeouts.get(userId)!);
    }

    // Set new timeout for debounced update
    const timeout = setTimeout(async () => {
      try {
        // أولوية لـ RPC آمن للسباقات
        const { error: rpcErr } = await supabase.rpc('update_user_points_by_user_id', {
          p_user_id: userId,
          p_points_to_add: points,
        });
        if (rpcErr) {
          // بديل: جلب النقاط الحالية ثم تحديثها (قد لا يكون مثالياً للسباقات)
          const { data: userRow } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single();
          const newPoints = (userRow?.points || 0) + points;
          await supabase
            .from('users')
            .update({ points: newPoints, updated_at: new Date().toISOString() })
            .eq('id', userId);
        }
        updateTimeouts.delete(userId);
      } catch (error) {
        console.error('Error updating user points:', error);
        updateTimeouts.delete(userId);
      }
    }, 1000); // 1 second debounce

    updateTimeouts.set(userId, timeout);
  } catch (error) {
    console.error('Error setting up points update:', error);
  }
};

// =============================
//  تحديث الوقت المستغرق (مفلتر)
// =============================
export const updateUserTimeSpent = async (
  userId: string,
  timeSpent: number
): Promise<void> => {
  try {
    if (updateTimeouts.has(userId)) {
      clearTimeout(updateTimeouts.get(userId)!);
    }

    const timeout = setTimeout(async () => {
      try {
        await supabase
          .from('users')
          .update({ time_spent: timeSpent, updated_at: new Date().toISOString() })
          .eq('id', userId);
        updateTimeouts.delete(userId);
      } catch (error) {
        console.error('Error updating time spent:', error);
        updateTimeouts.delete(userId);
      }
    }, 2000); // 2 seconds debounce for time updates

    updateTimeouts.set(userId, timeout);
  } catch (error) {
    console.error('Error setting up time update:', error);
  }
};

// =============================
//  إدارة الجلسات والتحديات اليومية
// =============================
export const initializeSessionTracking = async (userId: string): Promise<void> => {
  try {
    // Get user's groups
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    const groupIds = userGroups?.map((g) => g.group_id) || [];

    // Initialize session data
    activeSessions.set(userId, {
      userId,
      sessionStart: Date.now(),
      lastSavedTime: Date.now(),
      groups: groupIds,
    });

    console.log(`Session tracking initialized for user ${userId} with ${groupIds.length} groups`);
  } catch (error) {
    console.error('Error initializing session tracking:', error);
  }
};

export const updateSessionGroups = async (userId: string): Promise<void> => {
  try {
    const session = activeSessions.get(userId);
    if (!session) return;

    // Get updated user groups
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    const groupIds = userGroups?.map((g) => g.group_id) || [];

    // Update session data
    session.groups = groupIds;
    activeSessions.set(userId, session);

    console.log(`Session groups updated for user ${userId}: ${groupIds.length} groups`);
  } catch (error) {
    console.error('Error updating session groups:', error);
  }
};

export const saveSessionTimeToDailyChallenge = async (
  userId: string
): Promise<void> => {
  try {
    const session = activeSessions.get(userId);
    if (!session) return;

    const now = Date.now();
    const sessionTimeInSeconds = Math.floor((now - session.lastSavedTime) / 1000);

    if (sessionTimeInSeconds < 1) return; // Don't save if less than 1 second

    const today = new Date().toISOString().split('T')[0];

    // Save time for each group the user is a member of
    for (const groupId of session.groups) {
      await saveDailyTimeSpent(userId, groupId, sessionTimeInSeconds);
    }

    // Update last saved time
    session.lastSavedTime = now;
    activeSessions.set(userId, session);

    console.log(`Saved ${sessionTimeInSeconds}s for user ${userId} across ${session.groups.length} groups`);
  } catch (error) {
    console.error('Error saving session time to daily challenge:', error);
  }
};

// Enhanced daily time tracking functions
export const saveDailyTimeSpent = async (
  userId: string,
  groupId: string,
  additionalTimeSpent: number
): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // First, get the current daily time spent for today
    const { data: existingRecord } = await supabase
      .from('group_daily_challenges')
      .select('daily_time_spent')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('challenge_date', today)
      .maybeSingle();

    const currentTimeSpent = existingRecord?.daily_time_spent || 0;
    const newTotalTime = currentTimeSpent + additionalTimeSpent;

    const { error } = await supabase
      .from('group_daily_challenges')
      .upsert(
        {
          group_id: groupId,
          user_id: userId,
          challenge_date: today,
          daily_time_spent: newTotalTime,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'group_id,user_id,challenge_date',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error('Error saving daily time:', error);
      return false;
    }

    console.log(
      `Daily time updated: User ${userId}, Group ${groupId}, Added: ${additionalTimeSpent}s, Total: ${newTotalTime}s`
    );
    return true;
  } catch (error) {
    console.error('Error saving daily time:', error);
    return false;
  }
};

// Get user's daily time spent for a specific group and date
export const getUserDailyTimeSpent = async (
  userId: string,
  groupId: string,
  date?: string
): Promise<number> => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('group_daily_challenges')
      .select('daily_time_spent')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('challenge_date', targetDate)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user daily time:', error);
      return 0;
    }

    return data?.daily_time_spent || 0;
  } catch (error) {
    console.error('Error fetching user daily time:', error);
    return 0;
  }
};

export const getDailyRanking = async (
  groupId: string,
  date?: string
): Promise<any[]> => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get daily challenges for the group on the specific date
    const { data: dailyChallenges, error: challengesError } = await supabase
      .from('group_daily_challenges')
      .select('user_id, daily_time_spent')
      .eq('group_id', groupId)
      .eq('challenge_date', targetDate)
      .gt('daily_time_spent', 0) // Only include users with positive time
      .order('daily_time_spent', { ascending: false });

    if (challengesError) {
      console.error('Error fetching daily challenges:', challengesError);
      return [];
    }

    if (!dailyChallenges || dailyChallenges.length === 0) {
      return [];
    }

    // Get user details for all users in the ranking
    const userIds = dailyChallenges.map((challenge) => challenge.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, photo_url')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return [];
    }

    // Combine challenge data with user data
    return dailyChallenges.map((challenge, index) => {
      const user = users?.find((u) => u.id === challenge.user_id);
      return {
        user_id: challenge.user_id,
        user_name: user?.name || 'مستخدم غير معروف',
        user_photo_url: user?.photo_url,
        daily_time_spent: challenge.daily_time_spent,
        rank_position: index + 1,
      };
    });
  } catch (error) {
    console.error('Error fetching daily ranking:', error);
    return [];
  }
};

export const getTotalRanking = async (groupId: string): Promise<any[]> => {
  try {
    // Get group members with their user data (عبر الربط التعريفي)
    const { data: memberData, error: memberError } = await supabase
      .from('group_members')
      .select(
        `
        user_id,
        users:user_id (
          id,
          name,
          photo_url,
          time_spent
        )
      `
      )
      .eq('group_id', groupId);

    if (memberError) {
      console.error('Error fetching group members:', memberError);
      return [];
    }

    if (!memberData || memberData.length === 0) {
      return [];
    }

    // Sort by total time spent and add ranking
    return (memberData || [])
      .map((item: any) => ({
        user_id: item.user_id,
        user_name: item.users?.name || 'مستخدم',
        user_photo_url: item.users?.photo_url,
        total_time_spent: item.users?.time_spent || 0,
      }))
      .sort((a, b) => b.total_time_spent - a.total_time_spent)
      .map((item, index) => ({
        ...item,
        rank_position: index + 1,
      }));
  } catch (error) {
    console.error('Error fetching total ranking:', error);
    return [];
  }
};

export const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Clean up session tracking when user logs out or app closes
export const cleanupSessionTracking = async (userId: string): Promise<void> => {
  try {
    // Save any remaining session time
    await saveSessionTimeToDailyChallenge(userId);

    // Remove from active sessions
    activeSessions.delete(userId);

    console.log(`Session tracking cleaned up for user ${userId}`);
  } catch (error) {
    console.error('Error cleaning up session tracking:', error);
  }
};

// Function to handle session time every minute - called by the main app timer
export const handleMinutelySessionUpdate = async (userId: string): Promise<void> => {
  try {
    await saveSessionTimeToDailyChallenge(userId);
  } catch (error) {
    console.error('Error in minutely session update:', error);
  }
};

// Legacy function - keeping for backward compatibility
export const saveUserSessionTime = async (
  userId: string,
  sessionTimeInSeconds: number
): Promise<void> => {
  try {
    // This is now handled by the new session tracking system
    // But we'll keep this for any existing calls
    const session = activeSessions.get(userId);
    if (session && session.groups.length > 0) {
      for (const groupId of session.groups) {
        await saveDailyTimeSpent(userId, groupId, sessionTimeInSeconds);
      }
    }
  } catch (error) {
    console.error('Error saving user session time:', error);
  }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    // Check cache first
    if (tasksCache && Date.now() - tasksCache.timestamp < CACHE_DURATION) {
      console.log('Returning cached tasks');
      return tasksCache.data;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const tasks = data.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      points: task.points,
      type: task.type as 'subscription' | 'daily' | 'link' | 'level' | 'tdl',
      url: task.url || undefined,
      completed: false, // Will be checked separately
    }));

    // Update cache
    tasksCache = {
      data: tasks,
      timestamp: Date.now(),
    };

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Return cached data if available, even if expired
    return tasksCache?.data || [];
  }
};

export const getUserCompletedTasks = async (userId: string): Promise<string[]> => {
  try {
    console.log('Fetching completed tasks for user:', userId);

    const { data, error } = await supabase
      .from('user_tasks')
      .select('task_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user completed tasks:', error);
      return [];
    }

    console.log('Fetched completed tasks data:', data);
    return data ? data.map((item) => item.task_id) : [];
  } catch (error) {
    console.error('Error fetching user completed tasks:', error);
    return [];
  }
};

export const completeTask = async (
  userId: string,
  taskId: string
): Promise<boolean> => {
  try {
    console.log('Attempting to complete task:', { userId, taskId });

    // أولاً التحقق من أن المهمة لم تنجز من قبل
    const { data: existingTask } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .maybeSingle();

    if (existingTask) {
      console.log('Task already completed');
      return true;
    }

    const { data, error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userId,
        task_id: taskId,
      })
      .select();

    if (error) {
      console.error('Error completing task:', error);
      return false;
    }

    console.log('Task completed successfully:', data);
    return true;
  } catch (error) {
    console.error('Error completing task:', error);
    return false;
  }
};

export const getTotalUsersCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching total users count:', error);
    return 0;
  }
};

export const getTopUsers = async (limit: number = 100): Promise<UserData[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map((user: any, index: number) => ({
      id: user.id,
      name: user.name,
      username: user.username || undefined,
      photo_url: user.photo_url || undefined,
      points: user.points,
      rank: index + 1,
      timeSpent: user.time_spent,
    }));
  } catch (error) {
    console.error('Error fetching top users:', error);
    return [];
  }
};

// Add the new subscription tasks with improved error handling
export const addNewSubscriptionTasks = async (): Promise<void> => {
  try {
    // The code for adding or updating the specific tasks has been removed.
    // This function will now do nothing.
    console.log('addNewSubscriptionTasks has been modified to no longer add or update specific tasks.');
  } catch (error) {
    console.error('Error in addNewSubscriptionTasks:', error);
  }
};

// حساب النقاط الكلية بناءً على الوقت المقضي والمهام المكتملة
export const calculateTotalPoints = (
  timeSpentInSeconds: number,
  taskPoints: number
): number => {
  // نقاط الوقت: 1 نقطة كل 10 ثوان
  const timePoints = Math.floor(timeSpentInSeconds / 10);

  // إجمالي النقاط = نقاط الوقت + نقاط المهام
  return timePoints + taskPoints;
};
