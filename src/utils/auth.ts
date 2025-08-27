// Google Authentication utilities for Supabase
import { supabase } from '../integrations/supabase/client';

export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Legacy telegram utilities - kept for compatibility
export const openTelegramLink = (url: string) => {
  try {
    if (url.startsWith('https://t.me/')) {
      window.open(url, '_blank');
    } else {
      console.warn('Invalid Telegram URL:', url);
    }
  } catch (error) {
    console.error('Error opening Telegram link:', error);
  }
};