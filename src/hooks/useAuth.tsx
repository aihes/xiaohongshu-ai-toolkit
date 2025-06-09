import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { captureError, captureMessage, setUser as setSentryUser, addBreadcrumb } from '@/lib/sentry';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 设置认证状态监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // 设置 Sentry 用户上下文
        if (session?.user) {
          setSentryUser({
            id: session.user.id,
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0]
          });
          addBreadcrumb(`User authenticated: ${event}`, 'auth', 'info');
        } else {
          setSentryUser({ id: 'anonymous' });
          addBreadcrumb(`User signed out: ${event}`, 'auth', 'info');
        }

        // 记录认证事件
        captureMessage(`Auth state changed: ${event}`, 'info');
      }
    );

    // 检查现有会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // 设置初始用户上下文
      if (session?.user) {
        setSentryUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0]
        });
      }
    }).catch((error) => {
      captureError(error, { context: 'getSession' });
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getRedirectUrl = () => {
    // 获取当前域名
    const currentOrigin = window.location.origin;

    // 生产环境域名列表
    const productionDomains = [
      'https://redbook-cover-maker-b551cd60-27akk93r2-aihes-projects.vercel.app',
      'https://redbook-cover-maker-b551cd60.vercel.app',
      'https://xhs.cryptopoint.cc' // 自定义域名（如果有）
    ];

    // 如果是生产环境域名，直接使用当前域名
    if (productionDomains.some(domain => currentOrigin.includes(domain.replace('https://', '')))) {
      return currentOrigin + '/';
    }

    // 如果是 Vercel 预览域名
    if (currentOrigin.includes('vercel.app')) {
      return currentOrigin + '/';
    }

    // 如果是 Lovable 预览域名
    if (currentOrigin.includes('lovable.app')) {
      return currentOrigin + '/';
    }

    // 本地开发环境
    if (currentOrigin.includes('localhost')) {
      return 'http://localhost:3000/';
    }

    // 默认使用当前域名
    return currentOrigin + '/';
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const redirectUrl = getRedirectUrl();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) {
        captureError(error, { context: 'signUp', email });
      } else {
        captureMessage('User signed up successfully', 'info');
      }

      return { error };
    } catch (error) {
      captureError(error as Error, { context: 'signUp', email });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        captureError(error, { context: 'signIn', email });
      } else {
        captureMessage('User signed in successfully', 'info');
      }

      return { error };
    } catch (error) {
      captureError(error as Error, { context: 'signIn', email });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    const redirectUrl = getRedirectUrl();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        captureError(error, { context: 'signInWithGoogle' });
      }

      return { error };
    } catch (error) {
      captureError(error as Error, { context: 'signInWithGoogle' });
      return { error };
    }
  };

  const signInWithGitHub = async () => {
    const redirectUrl = getRedirectUrl();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        captureError(error, { context: 'signInWithGitHub' });
      }

      return { error };
    } catch (error) {
      captureError(error as Error, { context: 'signInWithGitHub' });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      captureMessage('User signed out successfully', 'info');
    } catch (error) {
      captureError(error as Error, { context: 'signOut' });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
