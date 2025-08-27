
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Medal, Crown, Clock } from 'lucide-react';
import { getTopUsers, getTotalUsersCount } from '../utils/supabase';
import { UserData } from '../types/telegram';

interface RankingPageProps {
  currentUser: UserData | null;
  onTabChange?: (tab: string) => void;
}

const RankingPage: React.FC<RankingPageProps> = ({ currentUser, onTabChange }) => {
  const [topUsers, setTopUsers] = useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankingData = async () => {
      setLoading(true);
      
      // Fetch data in parallel for better performance
      const [users, totalCount] = await Promise.all([
        getTopUsers(100),
        getTotalUsersCount()
      ]);
      
      setTopUsers(users);
      setTotalUsers(totalCount);
      setLoading(false);
    };

    fetchRankingData();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-amber-600" size={24} />;
      default:
        return <Trophy className="text-blue-500" size={20} />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-white border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-300 rounded-2xl"></div>
            <div className="h-20 bg-gray-300 rounded-2xl"></div>
          </div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-300 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">التصنيف</h1>
        <p className="text-gray-600">ترتيب أفضل المستخدمين</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} />
            <span className="text-xs opacity-90">إجمالي الأعضاء</span>
          </div>
          <div className="text-xl font-bold">{totalUsers.toLocaleString()}</div>
        </div>
        
        {currentUser && (
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Trophy size={20} />
              <span className="text-xs opacity-90">ترتيبي الحالي</span>
            </div>
            <div className="text-xl font-bold">#{currentUser.rank}</div>
          </div>
        )}
      </div>

      {/* Timer Info Card */}
      <div 
        className="bg-gradient-to-r from-blue-500 to-green-600 p-6 rounded-2xl text-white shadow-xl mb-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        onClick={() => onTabChange?.('timer')}
      >
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">اضغط هنا لفهم كيفية التصنيف</h3>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {topUsers.map((user) => (
          <div
            key={user.id}
            className={`p-4 rounded-2xl shadow-sm ${getRankStyle(user.rank)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                
                <div>
                  <div className={`font-semibold ${user.rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                    {user.name}
                  </div>
                  <div className={`text-sm ${user.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'}`}>
                    المركز #{user.rank}
                  </div>
                </div>
              </div>
              
              <div className="text-left">
                <div className={`font-bold ${user.rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                  {user.points.toLocaleString()}
                </div>
                <div className={`text-xs ${user.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'}`}>
                  نقطة
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPage;
