import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AppUser } from '../types/app'; // We will create this file next
import { createOrUpdateUser } from '../utils/supabase';

// Define the shape of the context data
interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: AppUser | null;
  loading: boolean;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the application to provide authentication state.
 * It handles session management and user data fetching.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch the initial session and user data
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const appUser = await createOrUpdateUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
        });
        setUserData(appUser);
      }
      setLoading(false);
    };

    getInitialSession();

    // Set up a listener for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
            setLoading(true);
            const appUser = await createOrUpdateUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name,
                avatar_url: session.user.user_metadata?.avatar_url,
            });
            setUserData(appUser);
            setLoading(false);
        } else {
            // Clear user data on logout
            setUserData(null);
        }
      }
    );

    // Cleanup the subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Provide the auth state to the children components
  return (
    <AuthContext.Provider value={{ session, user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
