-- 触发器定义
-- 创建时间: 2024-12-15

-- 1. 用户注册时自动创建档案的触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 2. 用户更新时同步档案信息的触发器
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新用户基本信息
    UPDATE public.users 
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    -- 更新用户档案
    UPDATE public.profiles 
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

-- 3. 删除用户时清理相关数据的触发器
CREATE OR REPLACE FUNCTION cleanup_user_data()
RETURNS TRIGGER AS $$
BEGIN
    -- 删除用户相关的所有数据
    DELETE FROM public.api_keys WHERE user_id = OLD.id;
    DELETE FROM public.usage_records WHERE user_id = OLD.id;
    DELETE FROM public.credit_usage WHERE user_id = OLD.id;
    DELETE FROM public.transactions WHERE user_id = OLD.id;
    DELETE FROM public.profiles WHERE id = OLD.id;
    DELETE FROM public.users WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION cleanup_user_data();
