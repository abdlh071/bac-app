import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trophy, Trash2, LogOut, Calendar, Clock, TrendingUp, Crown, Medal, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GroupRankingPage from './GroupRankingPage';
import { UserData } from '../types/telegram';
import { 
  getDailyRanking, 
  getTodayDate, 
  updateSessionGroups, 
  handleMinutelySessionUpdate 
} from '../utils/supabase';

// تعريف الواجهة (Interface) للمجموعة
interface Group {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  group_code: string;
  admin_id: number;
  created_at: string;
  member_count?: number;
  daily_top_users?: Array<{
    user_id: number;
    user_name: string;
    user_photo_url?: string;
    daily_time_spent: number;
    rank_position: number;
  }>;
}

// تعريف الواجهة (Interface) لخصائص المكون
interface ChallengePageProps {
  currentUser: UserData | null;
}

const ChallengePage: React.FC<ChallengePageProps> = ({ currentUser }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showRankingPage, setShowRankingPage] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // تحميل بيانات المجموعات مرة واحدة عند تحميل الصفحة
  useEffect(() => {
    if (currentUser?.id) {
      loadUserGroups();
      
      // حفظ وقت الجلسة عند تحميل المكون
      saveCurrentSessionTime();
    }
  }, [currentUser?.id]);

  // دالة لحفظ وقت الجلسة الحالية
  const saveCurrentSessionTime = async () => {
    if (!currentUser?.id) return;
    
    try {
      await handleMinutelySessionUpdate(currentUser.id);
      console.log('Session time saved on ChallengePage mount');
    } catch (error) {
      console.error('Error saving session time on mount:', error);
    }
  };

  // دالة التحديث اليدوي للبيانات فقط عند الضغط على زر التحديث
  const refreshGroupData = async () => {
    if (!currentUser?.id || refreshing) return;
    
    try {
      setRefreshing(true);
      
      // حفظ وقت الجلسة قبل التحديث
      await handleMinutelySessionUpdate(currentUser.id);
      
      // تحديث بيانات المجموعات
      await loadUserGroups();
      
    } catch (error) {
      console.error('Error refreshing group data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // دالة للتأكد من وجود المستخدم في قاعدة البيانات
  const ensureUserExists = async () => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('users')
      .upsert({
        telegram_id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        photo_url: currentUser.photo_url,
      }, { onConflict: 'telegram_id' })
      .select('id')
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      throw new Error("فشل في تسجيل المستخدم في قاعدة البيانات.");
    }
  };

  // دالة لتحميل مجموعات المستخدم وبياناتها
  const loadUserGroups = async () => {
    try {
      setLoading(true);
      await ensureUserExists();
      if (!currentUser) return;

      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name,
            description,
            image_url,
            group_code,
            admin_id,
            created_at
          )
        `)
        .eq('user_id', currentUser.id);

      if (memberError) throw memberError;

      // تحميل بيانات المجموعات مع عدد الأعضاء وأفضل المستخدمين لهذا اليوم
      const newGroupsWithData = await Promise.all(
        (memberGroups || []).map(async (mg: any) => {
          const group = mg.groups;
          
          // الحصول على عدد الأعضاء
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          // الحصول على أفضل 3 مستخدمين لهذا اليوم مع بياناتهم الكاملة
          const todayDate = getTodayDate();
          
          // الحصول على بيانات التحدي اليومي للمجموعة
          const { data: dailyChallenges, error: challengesError } = await supabase
            .from('group_daily_challenges')
            .select('user_id, daily_time_spent')
            .eq('group_id', group.id)
            .eq('challenge_date', todayDate)
            .gt('daily_time_spent', 0)
            .order('daily_time_spent', { ascending: false })
            .limit(3);

          let dailyTopUsers = [];
          
          if (!challengesError && dailyChallenges && dailyChallenges.length > 0) {
            // الحصول على تفاصيل المستخدمين (الاسم والصورة)
            const userIds = dailyChallenges.map(challenge => challenge.user_id);
            const { data: users, error: usersError } = await supabase
              .from('users')
              .select('telegram_id, name, photo_url')
              .in('telegram_id', userIds);

            if (!usersError && users) {
              dailyTopUsers = dailyChallenges.map((challenge, index) => {
                const user = users.find(u => u.telegram_id === challenge.user_id);
                return {
                  user_id: challenge.user_id,
                  user_name: user?.name || 'مستخدم غير معروف',
                  user_photo_url: user?.photo_url,
                  daily_time_spent: challenge.daily_time_spent,
                  rank_position: index + 1
                };
              });
            }
          }

          return { 
            ...group, 
            member_count: count || 0,
            daily_top_users: dailyTopUsers
          };
        })
      );

      setGroups(newGroupsWithData);
      
      // تحديث المجموعات في الجلسة
      if (currentUser?.id) {
        await updateSessionGroups(currentUser.id);
      }
      
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "خطأ",
        description: `فشل في تحميل المجموعات: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // دالة لمغادرة مجموعة
  const leaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      await handleMinutelySessionUpdate(currentUser.id);
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      toast({ title: "تم المغادرة", description: "تم خروجك من المجموعة بنجاح." });
      
      await updateSessionGroups(currentUser.id);
      
      await loadUserGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "خطأ",
        description: `فشل في مغادرة المجموعة: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };

  // دالة لحذف مجموعة
  const deleteGroup = async (groupId: string) => {
    try {
      if (currentUser?.id) {
        await handleMinutelySessionUpdate(currentUser.id);
      }
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف المجموعة بنجاح" });
      
      if (currentUser?.id) {
        await updateSessionGroups(currentUser.id);
      }
      
      await loadUserGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({ title: "خطأ", description: "فشل في حذف المجموعة", variant: "destructive" });
    }
  };

  // دالة لإنشاء مجموعة جديدة
  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المجموعة", variant: "destructive" });
      return;
    }
    if (!currentUser) return;

    try {
      await ensureUserExists();
      
      await handleMinutelySessionUpdate(currentUser.id);
      
      const groupCode = `Revisa_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({ name: newGroupName, admin_id: currentUser.id, group_code: groupCode })
        .select()
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: groupData.id, user_id: currentUser.id });

      if (memberError) {
        await supabase.from('groups').delete().eq('id', groupData.id);
        throw memberError;
      }

      toast({ title: "تم إنشاء المجموعة", description: `كود المجموعة: ${groupCode}` });
      setCreateGroupOpen(false);
      setNewGroupName('');
      
      await updateSessionGroups(currentUser.id);
      
      await loadUserGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({ title: "خطأ", description: `فشل في إنشاء المجموعة: ${(error as Error).message}`, variant: "destructive" });
    }
  };

  // دالة للانضمام إلى مجموعة
  const joinGroup = async () => {
    if (!joinCode.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال كود المجموعة", variant: "destructive" });
      return;
    }
    if (!currentUser) return;

    try {
      await ensureUserExists();
      
      await handleMinutelySessionUpdate(currentUser.id);
      
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('group_code', joinCode)
        .single();

      if (groupError || !group) {
        toast({ title: "خطأ", description: "كود المجموعة غير صحيح", variant: "destructive" });
        return;
      }

      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (existingMember) {
        toast({ title: "تنبيه", description: "أنت عضو في هذه المجموعة بالفعل", variant: "destructive" });
        return;
      }

      const { error: joinError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: currentUser.id });

      if (joinError) throw joinError;

      toast({ title: "تم الانضمام", description: "تم انضمامك للمجموعة بنجاح" });
      setJoinGroupOpen(false);
      setJoinCode('');
      
      await updateSessionGroups(currentUser.id);
      
      await loadUserGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({ title: "خطأ", description: `فشل في الانضمام للمجموعة: ${(error as Error).message}`, variant: "destructive" });
    }
  };

  // دالة للانتقال إلى صفحة الترتيب
  const handleViewRanking = useCallback(async (group: Group) => {
    try {
      if (currentUser?.id) {
        await handleMinutelySessionUpdate(currentUser.id);
      }
      
      setSelectedGroup(group);
      setShowRankingPage(true);
    } catch (error) {
      console.error('Error saving session before viewing ranking:', error);
      setSelectedGroup(group);
      setShowRankingPage(true);
    }
  }, [currentUser?.id]);

  // دالة للعودة من صفحة الترتيب
  const handleBackFromRanking = useCallback(async () => {
    setShowRankingPage(false);
    setSelectedGroup(null);
    
    // تحديث البيانات عند العودة (اختياري)
    if (currentUser?.id) {
      await refreshGroupData();
    }
  }, [currentUser?.id]);

  // عرض صفحة الترتيب إذا كانت مجموعة محددة
  if (showRankingPage && selectedGroup) {
    return (
      <GroupRankingPage
        group={selectedGroup}
        currentUser={currentUser ? { id: currentUser.id, telegram_id: currentUser.id, name: currentUser.name } : null}
        onBack={handleBackFromRanking}
        onGroupDeleted={() => { 
          setShowRankingPage(false); 
          setSelectedGroup(null); 
          loadUserGroups(); 
        }}
      />
    );
  }

  // عرض شاشة التحميل
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل بيانات المستخدم...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-primary">التحدي اليومي</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshGroupData}
              disabled={refreshing}
              className="text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-muted-foreground">انضم الى مجموعات و إبدأ في تحدي الغير</p>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-2xl p-4 mt-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <Calendar className="w-6 h-6 text-blue-500" />
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-blue-800 text-sm font-semibold mb-1">
              تحدي كل 24 ساعة لمن يدرس أكثر
            </p>
            <p className="text-blue-600 text-xs">
              يتم تحديث الترتيب عند الدخول للصفحة • مراجعة ترتيب الأمس متاح
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 justify-center">
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="w-4 h-4" /> إنشاء مجموعة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>إنشاء مجموعة جديدة</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input 
                  placeholder="اسم المجموعة" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)} 
                  className="text-right"
                />
                <Button onClick={createGroup} className="w-full">إنشاء المجموعة</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-2 border-blue-200 hover:bg-blue-50">
                <Users className="w-4 h-4" /> الانضمام الى مجموعة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>الانضمام الى مجموعة</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input 
                  placeholder="كود المجموعة (مثل: Revisa_001)" 
                  value={joinCode} 
                  onChange={(e) => setJoinCode(e.target.value)} 
                  className="text-right"
                />
                <Button onClick={joinGroup} className="w-full">انضم للمجموعة</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups List */}
        <div className="grid gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-xl mb-2">
                      <Users className="w-5 h-5" />
                      {group.name}
                      {currentUser && group.admin_id === currentUser.id && (
                        <Badge className="bg-white/20 text-white border-white/30">مدير</Badge>
                      )}
                    </CardTitle>
                    <div className="flex flex-col gap-1 text-sm opacity-90">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.member_count} عضو
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-mono">
                          {group.group_code}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUser && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); leaveGroup(group.id); }} 
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    )}
                    {currentUser && (group.admin_id === currentUser.id || currentUser.id === 5705054777) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }} 
                        className="h-8 w-8 p-0 text-white hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Top 3 users for today */}
                {group.daily_top_users && group.daily_top_users.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      أبطال اليوم
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {group.daily_top_users.map((user, index) => (
                        <div key={user.user_id} className={`p-3 rounded-xl relative ${
                          index === 0 ? 'bg-gradient-to-b from-yellow-100 to-yellow-200 border-2 border-yellow-400' :
                          index === 1 ? 'bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400' :
                          'bg-gradient-to-b from-orange-100 to-orange-200 border-2 border-orange-400'
                        }`}>
                          {/* Rank Crown/Medal */}
                          <div className="flex justify-center mb-2">
                            {index === 0 ? <Crown className="text-yellow-600 w-6 h-6" /> :
                             index === 1 ? <Medal className="text-gray-600 w-5 h-5" /> :
                             <Medal className="text-orange-600 w-5 h-5" />}
                          </div>
                          
                          {/* User Avatar with photo support */}
                          <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                              {user.user_photo_url ? (
                                <img
                                  src={user.user_photo_url}
                                  alt={user.user_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {user.user_name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Position Indicator Only */}
                          <div className={`text-xs font-semibold ${
                            index === 0 ? 'text-yellow-700' :
                            index === 1 ? 'text-gray-700' :
                            'text-orange-700'
                          }`}>
                            المركز {index + 1}
                          </div>
                          
                          {/* Current User Indicator - Small badge */}
                          {currentUser && user.user_id === currentUser.id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No activity message */}
                {(!group.daily_top_users || group.daily_top_users.length === 0) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">لا يوجد نشاط اليوم بعد</p>
                    <p className="text-gray-500 text-xs mt-1">ابدأ في الدراسة لتظهر في الترتيب!</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleViewRanking(group)} 
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    عرض الترتيب التفصيلي
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {groups.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">لا توجد مجموعات</h3>
            <p className="text-muted-foreground mb-6">ابدأ بإنشاء مجموعة جديدة أو انضم إلى مجموعة موجودة</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setCreateGroupOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> إنشاء مجموعة
              </Button>
              <Button variant="outline" onClick={() => setJoinGroupOpen(true)} className="flex items-center gap-2">
                <Users className="w-4 h-4" /> انضمام لمجموعة
              </Button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">كيفية عمل التحدي اليومي</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>تحدي جديد كل يوم من 12:00 ص</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Clock className="w-5 h-5 text-green-500" />
              <span>تسجيل الوقت تلقائياً كل دقيقة</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>ترتيب محدث عند دخول الصفحة</span>
            </div>
          </div>
          {refreshing && (
            <div className="mt-4 text-blue-600 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              جاري تحديث البيانات...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
