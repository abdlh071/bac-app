import { supabase } from '../integrations/supabase/client';
import { AppUser } from '../types/app';

// Type for the user profile data coming from Supabase Auth
type AuthProfile = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

/**
 * Determines the best display name for a user.
 * @param profile - The user's auth profile.
 * @returns The user's full name, or a name derived from their email, or a default name.
 */
const getDisplayName = (profile?: Pick<AuthProfile, 'name' | 'email'>): string => {
  if (!profile) return 'مستخدم';
  return profile.name || (profile.email ? profile.email.split('@')[0] : 'مستخدم');
};

/**
 * Creates a new user profile in the public.users table or updates an existing one.
 * This function is called after a user signs in.
 * @param profile - The user's auth profile from Supabase.
 * @returns The user's application profile from the database.
 */
export const createOrUpdateUser = async (profile: AuthProfile): Promise<AppUser | null> => {
  try {
    const { data: existingUser, error: selError } = await supabase
      .from('users')
      .select('*')
      .eq('id', profile.id) // Use UUID for matching
      .maybeSingle();

    if (selError) throw selError;

    const userDataToUpsert = {
      id: profile.id,
      name: getDisplayName(profile),
      photo_url: profile.avatar_url || null,
      email: profile.email || null,
      updated_at: new Date().toISOString(),
    };

    // If user exists, update their profile; otherwise, insert a new one.
    if (existingUser) {
      const { data, error } = await supabase
        .from('users')
        .update(userDataToUpsert)
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) throw error;
      const rank = await getUserRankById(data.id, data.points);
      return { ...data, rank: rank ?? 999 } as AppUser;
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert(userDataToUpsert)
        .select()
        .single();

      if (error) throw error;
      return { ...data, rank: 999 } as AppUser;
    }
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    return null;
  }
};

/**
 * Fetches the rank of a user based on their points.
 * @param userId - The UUID of the user.
 * @param currentPoints - The user's current points.
 * @returns The user's rank as a number.
 */
export const getUserRankById = async (userId: string, currentPoints: number): Promise<number | null> => {
    try {
        const { data, error } = await supabase.rpc('get_user_rank', {
            user_id_param: userId,
            user_points_param: currentPoints
        });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user rank:', error);
        return null;
    }
};

/**
 * Updates a user's points.
 * @param userId - The UUID of the user.
 * @param points - The number of points to add.
 */
export const updateUserPoints = async (userId: string, points: number): Promise<void> => {
  try {
    const { error } = await supabase.rpc('update_user_points', {
      p_user_id: userId,
      p_points: points,
    });
    if (error) throw error;
  } catch (err) {
    console.error('Error updating points:', err);
  }
};

/**
 * Updates the total time a user has spent in the app.
 * @param userId - The UUID of the user.
 * @param seconds - The number of seconds to add.
 */
export const updateUserTimeSpent = async (userId: string, seconds: number): Promise<void> => {
    try {
        const { error } = await supabase.rpc('update_user_time_spent', {
            p_user_id: userId,
            p_seconds: seconds
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error in updateUserTimeSpent:', error);
    }
};

// --- Session and Challenge Tracking Functions ---

export const initializeSessionTracking = async (userId: string): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('user_sessions')
            .insert({ user_id: userId })
            .select('id')
            .single();
        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error initializing session tracking:', error);
        return null;
    }
};

export const updateSessionGroups = async (userId: string): Promise<void> => {
    try {
        const { data: groups, error } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', userId);
        if (error) throw error;
        const groupIds = groups.map(g => g.group_id);
        const { error: updateError } = await supabase
            .from('user_sessions')
            .update({ active_groups: groupIds })
            .eq('user_id', userId);
        if (updateError) throw updateError;
    } catch (error) {
        console.error('Error updating session groups:', error);
    }
};

export const cleanupSessionTracking = async (sessionId: string, userId: string): Promise<void> => {
    try {
        await supabase.from('user_sessions').delete().eq('id', sessionId);
        await supabase.rpc('reset_daily_challenge_on_logout', { p_user_id: userId });
    } catch (error) {
        console.error('Error during session cleanup:', error);
    }
};

export const handleMinutelySessionUpdate = async (userId: string) => {
    try {
        const { error } = await supabase.rpc('update_all_user_time', { p_user_id: userId });
        if (error) throw error;
    } catch (error) {
        console.error('Error in handleMinutelySessionUpdate:', error);
    }
};
