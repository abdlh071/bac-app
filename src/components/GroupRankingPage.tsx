import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Medal, Crown, Calendar, Clock, Users, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  telegram_id: number;
  name: string;
  photo_url?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  group_code: string;
  admin_id: number;
  created_at: string;
}

interface RankingUser {
  user_id: number;
  user_name: string;
  user_photo_url?: string;
  daily_time_spent: number;
  rank_position: number;
}

interface GroupRankingPageProps {
  group: Group;
  currentUser: User | null;
  onBack: () => void;
  onGroupDeleted: () => void;
}

const GroupRankingPage: React.FC<GroupRankingPageProps> = ({
  group,
  currentUser,
  onBack,
  onGroupDeleted
}) => {
  const [todayRanking, setTodayRanking] = useState<RankingUser[]>([]);
  const [yesterdayRanking, setYesterdayRanking] = useState<RankingUser[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday'>('today');
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRankingData();
    loadMemberCount();
  }, [group.id]);

  useEffect(() => {
    // Update current user rank when ranking data changes
    if (currentUser) {
      const currentRanking = activeTab === 'today' ? todayRanking : yesterdayRanking;
      const userRankData = currentRanking.find(user => user.user_id === currentUser.telegram_id);
      setCurrentUserRank(userRankData ? userRankData.rank_position : null);
    }
  }, [todayRanking, yesterdayRanking, activeTab, currentUser]);

  const loadMemberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      if (error) throw error;
      setMemberCount(count || 0);
    } catch (error) {
      console.error('Error loading member count:', error);
    }
  };

  const loadRankingData = async () => {
    try {
      setLoading(true);
      
      const today = getTodayDate();
      const yesterday = getYesterdayDate();

      // Load today's ranking
      const todayData = await getDailyRanking(group.id, today);
      setTodayRanking(todayData);

      // Load yesterday's ranking
      const yesterdayData = await getDailyRanking(group.id, yesterday);
      setYesterdayRanking(yesterdayData);

    } catch (error) {
      console.error('Error loading ranking data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الترتيب",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getYesterdayDate = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const getDailyRanking = async (groupId: string, date: string): Promise<RankingUser[]> => {
    try {
      // Get daily challenges for the group on the specific date
      const { data: dailyChallenges, error: challengesError } = await supabase
        .from('group_daily_challenges')
        .select('user_id, daily_time_spent')
        .eq('group_id', groupId)
        .eq('challenge_date', date)
        .gt('daily_time_spent', 0)
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

  const deleteGroup = async () => {
    if (!currentUser || (currentUser.telegram_id !== group.admin_id && currentUser.telegram_id !== 5705054777)) {
      toast({
        title: "خطأ",
        description: "ليس لديك صلاحية لحذف هذه المجموعة",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المجموعة بنجاح"
      });
      onGroupDeleted();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المجموعة",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  };

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

  const currentRanking = activeTab === 'today' ? todayRanking : yesterdayRanking;

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
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
          
          {currentUser && (currentUser.telegram_id === group.admin_id || currentUser.telegram_id === 5705054777) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteGroup}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              حذف المجموعة
            </Button>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{group.name}</h1>
        <p className="text-gray-600">ترتيب أعضاء المجموعة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} />
            <span className="text-xs opacity-90">إجمالي الأعضاء</span>
          </div>
          <div className="text-xl font-bold">{memberCount.toLocaleString()}</div>
        </div>
        
        {currentUser && currentUserRank && (
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Trophy size={20} />
              <span className="text-xs opacity-90">ترتيبي الحالي</span>
            </div>
            <div className="text-xl font-bold">#{currentUserRank}</div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-lg">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'today'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          اليوم
        </button>
        <button
          onClick={() => setActiveTab('yesterday')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'yesterday'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          الأمس
        </button>
      </div>

      {/* Ranking List */}
      {currentRanking.length > 0 ? (
        <div className="space-y-3">
          {currentRanking.map((user) => (
            <div
              key={`${user.user_id}-${activeTab}`}
              className={`p-4 rounded-2xl shadow-sm ${getRankStyle(user.rank_position)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(user.rank_position)}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    {user.user_photo_url ? (
                      <img
                        src={user.user_photo_url}
                        alt={user.user_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {user.user_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className={`font-semibold ${user.rank_position <= 3 ? 'text-white' : 'text-gray-800'}`}>
                      {user.user_name}
                    </div>
                    <div className={`text-sm ${user.rank_position <= 3 ? 'text-white opacity-90' : 'text-gray-600'}`}>
                      المركز #{user.rank_position}
                    </div>
                  </div>
                </div>
                
                <div className="text-left">
                  <div className={`font-bold ${user.rank_position <= 3 ? 'text-white' : 'text-gray-800'}`}>
                    {formatTime(user.daily_time_spent)}
                  </div>
                  <div className={`text-xs ${user.rank_position <= 3 ? 'text-white opacity-90' : 'text-gray-600'}`}>
                    وقت الدراسة
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            لا توجد بيانات للترتيب
          </h3>
          <p className="text-gray-500 text-sm">
            {activeTab === 'today' 
              ? 'لم يسجل أي عضو وقت دراسة اليوم بعد'
              : 'لم يسجل أي عضو وقت دراسة بالأمس'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupRankingPage;
