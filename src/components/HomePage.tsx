import React from 'react';
import { UserData } from '../types/telegram';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen, CheckSquare, BarChart3, Trophy, Star } from 'lucide-react';

interface HomePageProps {
  userData: UserData | null;
  onPointsUpdate?: (points: number) => Promise<void>;
  onTabChange?: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ userData, onTabChange }) => {
  
  if (!userData) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-16 w-24 h-24 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-8 w-40 h-40 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 right-12 w-28 h-28 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 p-6 pb-20">
        {/* Header with user info */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            {userData.photo_url ? (
              <img
                src={userData.photo_url}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-2xl hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-2xl hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl font-bold animate-pulse">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center animate-bounce">
              <Star className="text-white" size={16} />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-in">
            {userData.name}
          </h1>
          
          {userData.username && (
            <p className="text-gray-600 text-sm mb-4 animate-fade-in delay-100">@{userData.username}</p>
          )}
        </div>

        {/* Stats Cards with enhanced effects */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="group bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1">
            <div className="flex items-center justify-between mb-2">
              <Star size={24} className="group-hover:animate-spin transition-transform duration-500" />
              <span className="text-xs opacity-90">النقاط</span>
            </div>
            <div className="text-2xl font-bold animate-pulse">{userData.points.toLocaleString()}</div>
            <div className="text-xs opacity-90">نقطة</div>
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1">
            <div className="flex items-center justify-between mb-2">
              <Trophy size={24} className="group-hover:animate-bounce transition-transform duration-500" />
              <span className="text-xs opacity-90">الترتيب</span>
            </div>
            <div className="text-2xl font-bold animate-pulse">#{userData.rank}</div>
            <div className="text-xs opacity-90">الترتيب الحالي</div>
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Time Spent with glow effect */}
        <div 
          className="group bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl mb-8 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} className="group-hover:animate-spin transition-transform duration-700" />
            <span className="text-sm opacity-90">توقيتك داخل التطبيق</span>
          </div>
          <div className="text-xl font-bold animate-pulse">
            {formatTime(userData.timeSpent)}
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Challenge Section */}
        <div 
          className="group bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl mb-8 transition-all duration-300 transform hover:scale-105 relative overflow-hidden cursor-pointer"
          onClick={() => onTabChange?.('challenge')}
        >
          <div className="flex items-center justify-between mb-2">
            <Trophy size={24} className="group-hover:animate-bounce transition-transform duration-700" />
            <span className="text-sm opacity-90">التحدي</span>
          </div>
          <div className="text-sm opacity-90">
            انضم الى مجموعات و إبدأ في تحدي الغير
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Bac Section */}
        <div 
          className="group bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl mb-8 transition-all duration-300 transform hover:scale-105 relative overflow-hidden cursor-pointer"
          onClick={() => onTabChange?.('bac')}
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen size={24} className="group-hover:animate-bounce transition-transform duration-700" />
            <span className="text-sm opacity-90">كل ما تحتاجه في بكالوريا</span>
          </div>
          <div className="text-sm opacity-90">
            اكثر من 15 فرع مختلف هنا
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* TDL Section */}
        <div 
          className="group bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl mb-8 transition-all duration-300 transform hover:scale-105 relative overflow-hidden cursor-pointer"
          onClick={() => onTabChange?.('tdl')}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckSquare size={24} className="group-hover:animate-pulse transition-transform duration-700" />
            <span className="text-sm opacity-90">قائمة مهام TDL</span>
          </div>
          <div className="text-sm opacity-90">
            ضع قائمة مهام TDL خاصة بك لتساعدتك على ترتيب وقتك في البكالوريا
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Welcome Message with animated border */}
        <div className="relative bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
          <h2 className="text-lg font-bold mb-2 animate-fade-in">Revisa</h2>
          <p className="text-sm opacity-90 animate-fade-in delay-200">
            استمر في جمع النقاط من خلال إكمال المهام واستخدام العداد الذكي. 
            نتمنى لك التوفيق في رحلتك نحو البكالوريا!
          </p>
          
          {/* حدود متحركة */}
          <div className="absolute inset-0 rounded-2xl">
            <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-white/30 rounded-full animate-ping delay-300"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/30 rounded-full animate-ping delay-500"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/30 rounded-full animate-ping delay-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;