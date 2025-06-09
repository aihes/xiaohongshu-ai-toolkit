import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CreditsContextType {
  credits: number;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  decrementCredits: (amount: number) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

interface CreditsProviderProps {
  children: ReactNode;
}

export const CreditsProvider = ({ children }: CreditsProviderProps) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshCredits();
    } else {
      setCredits(0);
    }
  }, [user]);

  const refreshCredits = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('remaining_credits')
        .eq('id', user.id)
        .single();

      if (error) {
        // 如果记录不存在，创建新记录
        if (error.code === 'PGRST116') {
          const { data: newData, error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              remaining_credits: 10,
              total_purchased: 10,
              total_usage: 0
            }, {
              onConflict: 'id'
            })
            .select('remaining_credits')
            .single();

          if (upsertError) {
            console.error('创建用户记录失败:', upsertError);
            setCredits(0);
          } else {
            setCredits(newData?.remaining_credits || 0);
          }
        } else {
          console.error('获取用户积分失败:', error);
          setCredits(0);
        }
      } else {
        setCredits(data?.remaining_credits || 0);
      }
    } catch (error) {
      console.error('获取用户积分失败:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  const decrementCredits = (amount: number) => {
    setCredits(prev => Math.max(0, prev - amount));
  };

  const value = {
    credits,
    loading,
    refreshCredits,
    decrementCredits,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};
