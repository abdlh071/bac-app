import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserData } from '../types/telegram';
import { createOrUpdateUser } from '../utils/supabase';

// تعريف نوع البيانات للسياق
interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

// إنشاء السياق
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// مزود السياق (Provider) الذي سيغلف التطبيق
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب الجلسة الأولية عند تحميل التطبيق
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const appUser = await createOrUpdateUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
        });
        setUserData(appUser);
      }
      setLoading(false);
    };

    getInitialSession();

    // الاستماع لأي تغيير في حالة تسجيل الدخول (تسجيل دخول أو خروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
            setLoading(true);
            const appUser = await createOrUpdateUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url,
            });
            setUserData(appUser);
            setLoading(false);
        } else {
            setUserData(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook مخصص لاستخدام السياق بسهولة
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
