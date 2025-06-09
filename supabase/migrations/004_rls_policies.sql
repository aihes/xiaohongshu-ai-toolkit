-- 行级安全策略 (Row Level Security)
-- 创建时间: 2024-12-15

-- 启用所有表的 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 1. users 表策略
-- 用户只能查看和更新自己的记录
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 2. profiles 表策略
-- 用户可以查看所有档案（用于显示用户名等），但只能更新自己的
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. credit_packages 表策略
-- 所有人都可以查看激活的积分包
CREATE POLICY "Credit packages are viewable by everyone" ON public.credit_packages
    FOR SELECT USING (is_active = true);

-- 4. transactions 表策略
-- 用户只能查看自己的交易记录
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. credit_usage 表策略
-- 用户只能查看自己的积分使用记录
CREATE POLICY "Users can view own credit usage" ON public.credit_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit usage" ON public.credit_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. usage_records 表策略
-- 用户只能查看自己的使用记录
CREATE POLICY "Users can view own usage records" ON public.usage_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage records" ON public.usage_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. api_keys 表策略
-- 用户只能管理自己的 API 密钥
CREATE POLICY "Users can view own api keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- 为服务角色创建绕过策略（用于 Edge Functions）
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all transactions" ON public.transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all credit usage" ON public.credit_usage
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
