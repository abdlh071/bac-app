import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Calendar, Tag, AlertTriangle, Star, Archive, Edit3, Trash2, Filter, Clock, ListTodo, Clipboard, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserData } from '@/types/telegram';

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high';
  category?: string | null;
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly';
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
  user_id?: number;
}

interface TDLPageProps {
  userData?: UserData | null;
  onShowFocusTimer?: () => void;
}

const TDLPage: React.FC<TDLPageProps> = ({ userData, onShowFocusTimer }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
    category: '',
    repeat_type: 'none' as const
  });

  // Load todos
  const loadTodos = async () => {
    if (!userData) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos((data || []).map(item => ({
        ...item,
        priority: item.priority as 'low' | 'medium' | 'high',
        repeat_type: item.repeat_type as 'none' | 'daily' | 'weekly' | 'monthly'
      })));
    } catch (error) {
      console.error('Error loading todos:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المهام',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [userData]);

  // Add new todo
  const addTodo = async () => {
    if (!userData || !newTodo.title.trim()) return;

    try {
      const todoData = {
        user_id: userData.id,
        title: newTodo.title,
        description: newTodo.description || null,
        due_date: newTodo.due_date || null,
        priority: newTodo.priority,
        category: newTodo.category || null,
        repeat_type: newTodo.repeat_type
      };

      const { data, error } = await supabase
        .from('todos')
        .insert([todoData])
        .select()
        .single();

      if (error) throw error;

      const addedTodo = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high',
        repeat_type: data.repeat_type as 'none' | 'daily' | 'weekly' | 'monthly'
      };
      setTodos(prev => [addedTodo, ...prev]);
      setNewTodo({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: '',
        repeat_type: 'none'
      });
      setIsAddDialogOpen(false);

      toast({
        title: 'تم الإضافة',
        description: 'تم إضافة المهمة بنجاح'
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة المهمة',
        variant: 'destructive'
      });
    }
  };

  // Toggle todo completion
  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', todoId);

      if (error) throw error;

      setTodos(prev => prev.map(todo => 
        todo.id === todoId 
          ? { ...todo, is_completed: completed }
          : todo
      ));

      toast({
        title: completed ? 'تم الإنجاز' : 'تم الإلغاء',
        description: completed ? 'تم تحديد المهمة كمنجزة' : 'تم إلغاء إنجاز المهمة'
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث المهمة',
        variant: 'destructive'
      });
    }
  };

  // Delete todo
  const deleteTodo = async (todoId: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;

      setTodos(prev => prev.filter(todo => todo.id !== todoId));

      toast({
        title: 'تم الحذف',
        description: 'تم حذف المهمة بنجاح'
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المهمة',
        variant: 'destructive'
      });
    }
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed' && !todo.is_completed) return false;
    if (filter === 'pending' && todo.is_completed) return false;
    if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;
    return true;
  });

  // Priority colors with modern design
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 shadow-red-100/50';
      case 'medium': return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 shadow-amber-100/50';
      case 'low': return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-green-100/50';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 shadow-gray-100/50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} className="drop-shadow-sm" />;
      case 'medium': return <Star size={16} className="drop-shadow-sm" />;
      case 'low': return <Archive size={16} className="drop-shadow-sm" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-1/2 mx-auto"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl shadow-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pt-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-lg opacity-20"></div>
            <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              <ListTodo className="inline-block" size={48} /> قائمة المهام
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">نظم مهامك وحقق أهدافك بكفاءة واحترافية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clipboard size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-1">{todos.length}</div>
              <div className="text-sm font-medium text-blue-600">إجمالي المهام</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-green-700 mb-1">
                {todos.filter(t => t.is_completed).length}
              </div>
              <div className="text-sm font-medium text-green-600">مهام منجزة</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Hourglass size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-700 mb-1">
                {todos.filter(t => !t.is_completed).length}
              </div>
              <div className="text-sm font-medium text-orange-600">مهام معلقة</div>
            </CardContent>
          </Card>

          <Card 
            className="text-center border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={onShowFocusTimer}
          >
            <CardContent className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-1">العداد</div>
              <div className="text-sm font-medium text-purple-600">العداد الذكي</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl px-6 py-3 text-lg font-semibold">
                <Plus size={24} className="ml-2" />
                إضافة مهمة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg mx-auto bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-center pb-4 sticky top-0 bg-gradient-to-br from-white to-gray-50 z-10">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <Plus className="inline-block" size={32} /> إضافة مهمة جديدة
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 px-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">📝 عنوان المهمة</label>
                  <Input
                    value={newTodo.title}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان المهمة"
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 p-3 text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">📄 الوصف</label>
                  <Textarea
                    value={newTodo.description}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف تفصيلي للمهمة (اختياري)"
                    rows={3}
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 p-3"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">🎯 الأولوية</label>
                    <Select value={newTodo.priority} onValueChange={(value) => setNewTodo(prev => ({ ...prev, priority: value as any }))}>
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 p-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="low" className="flex items-center">🟢 منخفضة</SelectItem>
                        <SelectItem value="medium" className="flex items-center">🟡 متوسطة</SelectItem>
                        <SelectItem value="high" className="flex items-center">🔴 مرتفعة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">🔄 التكرار</label>
                    <Select value={newTodo.repeat_type} onValueChange={(value) => setNewTodo(prev => ({ ...prev, repeat_type: value as any }))}>
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 p-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="none">⚪ بدون تكرار</SelectItem>
                        <SelectItem value="daily">📅 يومي</SelectItem>
                        <SelectItem value="weekly">📆 أسبوعي</SelectItem>
                        <SelectItem value="monthly">🗓️ شهري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">📅 تاريخ التنفيذ</label>
                  <Input
                    type="datetime-local"
                    value={newTodo.due_date}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, due_date: e.target.value }))}
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 p-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">🏷️ التصنيف</label>
                  <Input
                    value={newTodo.category}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="مثل: عمل، دراسة، شخصي"
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 p-3"
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <Button 
                    onClick={addTodo} 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 text-lg font-semibold"
                  >
                    <Plus size={24} className="ml-2" />
                    إضافة المهمة
                  </Button>
                  <Button 
                    onClick={() => setIsAddDialogOpen(false)} 
                    variant="outline" 
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 font-semibold transition-all duration-300"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
              <SelectTrigger className="w-40 rounded-xl border-2 border-gray-200 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <Filter size={18} className="ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">📋 جميع المهام</SelectItem>
                <SelectItem value="pending">⏳ معلقة</SelectItem>
                <SelectItem value="completed">✅ منجزة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
              <SelectTrigger className="w-40 rounded-xl border-2 border-gray-200 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <Star size={18} className="ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">🎯 كل الأولويات</SelectItem>
                <SelectItem value="high">🔴 مرتفعة</SelectItem>
                <SelectItem value="medium">🟡 متوسطة</SelectItem>
                <SelectItem value="low">🟢 منخفضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


        {/* Todos List */}
        <div className="space-y-6">
          {filteredTodos.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <CardContent>
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                  <Clipboard size={48} className="text-white" />
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">لا توجد مهام</p>
                <p className="text-gray-500 text-lg">ابدأ بإضافة مهمة جديدة لتنظيم يومك</p>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <Card 
                key={todo.id} 
                className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden ${
                  todo.is_completed 
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 opacity-80' 
                    : 'bg-gradient-to-r from-white to-gray-50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Button
                      onClick={() => toggleTodo(todo.id, !todo.is_completed)}
                      variant="ghost"
                      size="sm"
                      className={`p-2 rounded-full transition-all duration-300 ${
                        todo.is_completed 
                          ? 'bg-green-100 hover:bg-green-200' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle2 
                        size={24} 
                        className={todo.is_completed ? 'text-green-600' : 'text-gray-400'} 
                      />
                    </Button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`text-lg font-bold ${
                          todo.is_completed 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-800'
                        }`}>
                          {todo.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getPriorityColor(todo.priority)} shadow-md border-0 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
                            {getPriorityIcon(todo.priority)}
                            <span>
                              {todo.priority === 'high' ? 'مرتفعة' : 
                               todo.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </span>
                          </Badge>
                          <Button
                            onClick={() => deleteTodo(todo.id)}
                            variant="ghost"
                            size="sm"
                            className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-all duration-300"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>

                      {todo.description && (
                        <p className="text-gray-600 text-base mb-4 leading-relaxed">{todo.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {todo.due_date && (
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                            <Calendar size={16} className="text-blue-600" />
                            <span className="font-medium">{new Date(todo.due_date).toLocaleDateString('ar-SA')}</span>
                          </div>
                        )}
                        {todo.category && (
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                            <Tag size={16} className="text-purple-600" />
                            <span className="font-medium">{todo.category}</span>
                          </div>
                        )}
                        {todo.repeat_type !== 'none' && (
                          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                            <span className="text-lg">🔄</span>
                            <span className="font-medium">
                              {todo.repeat_type === 'daily' ? 'يومي' :
                               todo.repeat_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TDLPage;
