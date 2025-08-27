import React from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Chrome } from 'lucide-react';

/**
 * Login page component.
 * Provides a method for users to sign in using Google.
 */
const LoginPage: React.FC = () => {
  
  /**
   * Handles the Google sign-in process.
   */
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // Redirect back to the app after login
      },
    });
    if (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">مرحباً بك</h1>
        <p className="text-gray-600 mb-8">
          سجّل دخولك للمتابعة إلى لوحة التحكم الخاصة بك.
        </p>
        <Button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg text-lg hover:shadow-xl transition-shadow"
        >
          <Chrome className="ml-2" />
          تسجيل الدخول باستخدام جوجل
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
