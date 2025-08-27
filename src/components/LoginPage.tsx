import React from 'react';
import { signInWithGoogle } from '../utils/auth';
import { useToast } from '../hooks/use-toast';

export default function LoginPage() {
  const { toast } = useToast();
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("خطأ أثناء تسجيل الدخول:", err.message);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء تسجيل الدخول بحساب Google. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-100" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center w-80 border border-gray-100">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Revisa</h1>
          <p className="text-gray-600">رفيقك للدراسة والنجاح</p>
        </div>
        
        <h2 className="text-xl font-bold mb-6 text-gray-800">تسجيل الدخول</h2>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
            fill="currentColor"
          >
            <path d="M488 261.8c0-17.8-1.6-35-4.7-51.8H249v98.1h134.7c-5.8 31.3-23.1 57.8-49.2 75.6v62h79.5c46.4-42.7 73-105.7 73-184z" />
            <path d="M249 492c66.4 0 122.1-21.9 162.8-59.5l-79.5-62c-22.1 14.9-50.3 23.7-83.3 23.7-63.9 0-118-43.1-137.4-101.1h-81v63.5C71.9 432.1 153.7 492 249 492z" />
            <path d="M111.6 293.1c-4.9-14.9-7.6-30.8-7.6-47.1s2.7-32.2 7.6-47.1v-63.5h-81C15.1 172.7 9 210.1 9 246s6.1 73.3 21.6 110.6l81-63.5z" />
            <path d="M249 97.3c36.1 0 68.6 12.5 94.1 37.1l70.4-70.4C371.1 24.1 315.4 2 249 2 153.7 2 71.9 61.9 29.6 151.4l81 63.5C131 140.4 185.1 97.3 249 97.3z" />
          </svg>
          الدخول بحساب Google
        </button>
        
        <p className="text-gray-500 text-sm mt-6">
          سجل الدخول بحساب Google للوصول إلى جميع ميزات التطبيق والمزامنة عبر الأجهزة
        </p>
      </div>
    </div>
  );
}
