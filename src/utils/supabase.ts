import { supabase } from '../integrations/supabase/client';
import { TelegramUser, UserData, Task } from '../types/telegram';

// Cache for tasks to reduce database calls
let tasksCache: { data: Task[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debouncing map for user updates
const updateTimeouts = new Map<number, NodeJS.Timeout>();

// Session tracking for daily time calculation
interface SessionData {
  userId: number;
  sessionStart: number;
  lastSavedTime: number;
  groups: string[];
}

const activeSessions = new Map<number, SessionData>();

// Helper function to get user completed tasks count
export async function getUserCompletedTasksCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_user_completed_tasks_count', {
      p_user_id: parseInt(userId)
    });
    
    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error getting user completed tasks count:', error);
    return 0;
  }
}

export const createOrUpdateUser = async (telegramUser: TelegramUser): Promise<UserData | null> => {
  try {
    // First, try to get existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single();

    if (existingUser) {
      // Update existing user with optimized query
      const { data, error } = await supabase
        .from('users')
        .update({
          name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
          username: telegramUser.username,
          photo_url: telegramUser.photo_url,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', telegramUser.id)
        .select()
        .single();

      if (error) throw error;

      // Get user ranking with optimized query
      const { data: rankData } = await supabase.rpc('get_user_ranking', {
        p_telegram_id: telegramUser.id
      });

      return {
        id: data.telegram_id,
        name: data.name,
        username: data.username || undefined,
        photo_url: data.photo_url || undefined,
        points: data.points,
        rank: rankData || 999,
        timeSpent: data.time_spent
      };
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramUser.id,
          name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
          username: telegramUser.username,
          photo_url: telegramUser.photo_url
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.telegram_id,
        name: data.name,
        username: data.username || undefined,
        photo_url: data.photo_url || undefined,
        points: data.points,
        rank: 999,
        timeSpent: data.time_spent
      };
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
};

export const updateUserPoints = async (telegramId: number, points: number): Promise<void> => {
  try {
    // Clear existing timeout for this user
    if (updateTimeouts.has(telegramId)) {
      clearTimeout(updateTimeouts.get(telegramId)!);
    }

    // Set new timeout for debounced update
    const timeout = setTimeout(async () => {
      try {
        await supabase.rpc('update_user_points', {
          p_telegram_id: telegramId,
          p_points_to_add: points
        });
        updateTimeouts.delete(telegramId);
      } catch (error) {
        console.error('Error updating user points:', error);
        updateTimeouts.delete(telegramId);
      }
    }, 1000); // 1 second debounce

    updateTimeouts.set(telegramId, timeout);
  } catch (error) {
    console.error('Error setting up points update:', error);
  }
};

export const updateUserTimeSpent = async (telegramId: number, timeSpent: number): Promise<void> => {
  try {
    // Clear existing timeout for this user time update
    const timeKey = `time_${telegramId}`;
    if (updateTimeouts.has(telegramId)) {
      clearTimeout(updateTimeouts.get(telegramId)!);
    }

    // Set new timeout for debounced time update
    const timeout = setTimeout(async () => {
      try {
        await supabase
          .from('users')
          .update({ time_spent: timeSpent, updated_at: new Date().toISOString() })
          .eq('telegram_id', telegramId);
        updateTimeouts.delete(telegramId);
      } catch (error) {
        console.error('Error updating time spent:', error);
        updateTimeouts.delete(telegramId);
      }
    }, 2000); // 2 seconds debounce for time updates

    updateTimeouts.set(telegramId, timeout);
  } catch (error) {
    console.error('Error setting up time update:', error);
  }
};

// Initialize session tracking for a user
export const initializeSessionTracking = async (userId: number): Promise<void> => {
  try {
    // Get user's groups
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    const groupIds = userGroups?.map(g => g.group_id) || [];
    
    // Initialize session data
    activeSessions.set(userId, {
      userId,
      sessionStart: Date.now(),
      lastSavedTime: Date.now(),
      groups: groupIds
    });

    console.log(`Session tracking initialized for user ${userId} with ${groupIds.length} groups`);
  } catch (error) {
    console.error('Error initializing session tracking:', error);
  }
};

// Update session tracking when user joins/leaves groups
export const updateSessionGroups = async (userId: number): Promise<void> => {
  try {
    const session = activeSessions.get(userId);
    if (!session) return;

    // Get updated user groups
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    const groupIds = userGroups?.map(g => g.group_id) || [];
    
    // Update session data
    session.groups = groupIds;
    activeSessions.set(userId, session);

    console.log(`Session groups updated for user ${userId}: ${groupIds.length} groups`);
  } catch (error) {
    console.error('Error updating session groups:', error);
  }
};

// Save current session time to daily challenges for all user groups
export const saveSessionTimeToDailyChallenge = async (userId: number): Promise<void> => {
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
export const saveDailyTimeSpent = async (userId: number, groupId: string, additionalTimeSpent: number): Promise<boolean> => {
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
      .upsert({
        group_id: groupId,
        user_id: userId,
        challenge_date: today,
        daily_time_spent: newTotalTime,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'group_id,user_id,challenge_date',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving daily time:', error);
      return false;
    }

    console.log(`Daily time updated: User ${userId}, Group ${groupId}, Added: ${additionalTimeSpent}s, Total: ${newTotalTime}s`);
    return true;
  } catch (error) {
    console.error('Error saving daily time:', error);
    return false;
  }
};

// Get user's daily time spent for a specific group and date
export const getUserDailyTimeSpent = async (userId: number, groupId: string, date?: string): Promise<number> => {
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

export const getDailyRanking = async (groupId: string, date?: string): Promise<any[]> => {
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
    const userIds = dailyChallenges.map(challenge => challenge.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('telegram_id, name, photo_url')
      .in('telegram_id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return [];
    }

    // Combine challenge data with user data
    return dailyChallenges.map((challenge, index) => {
      const user = users?.find(u => u.telegram_id === challenge.user_id);
      return {
        user_id: challenge.user_id,
        user_name: user?.name || 'مستخدم غير معروف',
        user_photo_url: user?.photo_url,
        daily_time_spent: challenge.daily_time_spent,
        rank_position: index + 1
      };
    });
  } catch (error) {
    console.error('Error fetching daily ranking:', error);
    return [];
  }
};

export const getTotalRanking = async (groupId: string): Promise<any[]> => {
  try {
    // Get group members with their user data
    const { data: memberData, error: memberError } = await supabase
      .from('group_members')
      .select(`
        user_id,
        users:user_id (
          name,
          photo_url,
          time_spent
        )
      `)
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
        total_time_spent: item.users?.time_spent || 0
      }))
      .sort((a, b) => b.total_time_spent - a.total_time_spent)
      .map((item, index) => ({
        ...item,
        rank_position: index + 1
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
export const cleanupSessionTracking = async (userId: number): Promise<void> => {
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
export const handleMinutelySessionUpdate = async (userId: number): Promise<void> => {
  try {
    await saveSessionTimeToDailyChallenge(userId);
  } catch (error) {
    console.error('Error in minutely session update:', error);
  }
};

// Legacy function - keeping for backward compatibility
export const saveUserSessionTime = async (userId: number, sessionTimeInSeconds: number): Promise<void> => {
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
    if (tasksCache && (Date.now() - tasksCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached tasks');
      return tasksCache.data;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const tasks = data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      points: task.points,
      type: task.type as 'subscription' | 'daily' | 'link' | 'level' | 'tdl',
      url: task.url || undefined,
      completed: false // Will be checked separately
    }));

    // Update cache
    tasksCache = {
      data: tasks,
      timestamp: Date.now()
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
      .eq('user_id', parseInt(userId)); // تحويل userId إلى bigint

    if (error) {
      console.error('Error fetching user completed tasks:', error);
      return [];
    }

    console.log('Fetched completed tasks data:', data);
    return data ? data.map(item => item.task_id) : [];
  } catch (error) {
    console.error('Error fetching user completed tasks:', error);
    return [];
  }
};

export const completeTask = async (userId: string, taskId: string): Promise<boolean> => {
  try {
    console.log('Attempting to complete task:', { userId, taskId });
    
    // تحويل userId إلى رقم bigint
    const userIdNumber = parseInt(userId);
    
    // أولاً التحقق من أن المهمة لم تنجز من قبل
    const { data: existingTask } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userIdNumber)
      .eq('task_id', taskId)
      .maybeSingle();

    if (existingTask) {
      console.log('Task already completed');
      return true;
    }

    const { data, error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userIdNumber,
        task_id: taskId
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

    return data.map((user, index) => ({
      id: user.telegram_id,
      name: user.name,
      username: user.username || undefined,
      photo_url: user.photo_url || undefined,
      points: user.points,
      rank: index + 1,
      timeSpent: user.time_spent
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
export const calculateTotalPoints = (timeSpentInSeconds: number, taskPoints: number): number => {
  // نقاط الوقت: 1 نقطة كل 10 ثوان
  const timePoints = Math.floor(timeSpentInSeconds / 10);
  
  // إجمالي النقاط = نقاط الوقت + نقاط المهام
  return timePoints + taskPoints;
};
