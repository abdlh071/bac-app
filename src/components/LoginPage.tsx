// src/components/LoginPage.tsx
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { BrainCircuit } from 'lucide-react';

const LoginPage = () => {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // Redirect back to the app's base URL after login
      },
    });

    if (error) {
      console.error('Error logging in with Google:', error.message);
      // You can implement a user-facing error message here using a toast notification
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-200">
        <div className="mb-6 flex justify-center items-center gap-3">
          <BrainCircuit className="text-blue-700" size={48} />
          <div>
            <h1 className="text-5xl font-extrabold text-blue-700 drop-shadow-lg logo-font">Revisa</h1>
            <p className="text-md text-gray-600 mt-1 tracking-wide">رفيقك للدراسة والنجاح</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-8 text-lg">
          مرحباً بك! سجّل دخولك عبر حساب جوجل للبدء.
        </p>

        <Button 
          onClick={handleGoogleLogin} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          {/* Google Icon SVG */}
          <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.611 20.083H42V20H24V28H35.303C33.674 32.69 29.213 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L36.842 10.158C33.434 7.062 28.964 5 24 5C14.322 5 6.52 12.822 6.52 22.5C6.52 32.178 14.322 40 24 40C33.678 40 41.48 32.178 41.48 22.5C41.48 21.593 41.381 20.84 41.239 20.083H43.611V20.083Z" fill="#FFC107"/>
            <path d="M43.611 20.083H42V20H24V28H35.303C33.674 32.69 29.213 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L36.842 10.158C33.434 7.062 28.964 5 24 5C14.322 5 6.52 12.822 6.52 22.5C6.52 32.178 14.322 40 24 40C33.678 40 41.48 32.178 41.48 22.5C41.48 21.593 41.381 20.84 41.239 20.083H43.611V20.083Z" fill="white" fillOpacity="0.4"/>
            <path d="M24 12C29.213 12 33.674 15.31 35.303 20H24V12Z" fill="#FF3D00"/>
            <path d="M24 36C18.787 36 14.326 32.69 12.697 28H24V36Z" fill="#4CAF50"/>
            <path d="M36.842 10.158L31.961 15.039C29.842 13.154 27.059 12 24 12V5C28.964 5 33.434 7.062 36.842 10.158Z" fill="#1976D2"/>
            <path d="M6.52 22.5C6.52 12.822 14.322 5 24 5V12C17.373 12 12 17.373 12 24H6.52V22.5Z" fill="#4285F4"/>
          </svg>
          <span>المتابعة باستخدام Google</span>
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
