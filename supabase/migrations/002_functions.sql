-- 数据库函数定义
-- 创建时间: 2024-12-15

-- 1. 添加积分函数
CREATE OR REPLACE FUNCTION add_credits(user_id_param UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    -- 更新用户积分
    UPDATE public.users 
    SET 
        remaining_credits = COALESCE(remaining_credits, 0) + amount,
        total_purchased = COALESCE(total_purchased, 0) + amount,
        updated_at = NOW()
    WHERE id = user_id_param;
    
    -- 如果用户不存在，抛出异常
    IF NOT FOUND THEN
        RAISE EXCEPTION '用户不存在: %', user_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 扣减积分函数
CREATE OR REPLACE FUNCTION decrement_credits(user_id_param UUID, amount INTEGER)
RETURNS VOID AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    -- 获取当前积分
    SELECT remaining_credits INTO current_credits 
    FROM public.users 
    WHERE id = user_id_param;
    
    -- 检查用户是否存在
    IF NOT FOUND THEN
        RAISE EXCEPTION '用户不存在: %', user_id_param;
    END IF;
    
    -- 检查积分是否足够
    IF COALESCE(current_credits, 0) < amount THEN
        RAISE EXCEPTION '积分不足，当前积分: %, 需要积分: %', COALESCE(current_credits, 0), amount;
    END IF;
    
    -- 扣减积分
    UPDATE public.users 
    SET 
        remaining_credits = remaining_credits - amount,
        total_usage = COALESCE(total_usage, 0) + amount,
        updated_at = NOW()
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 获取用户积分函数
CREATE OR REPLACE FUNCTION get_user_credits(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    credits INTEGER;
BEGIN
    SELECT remaining_credits INTO credits 
    FROM public.users 
    WHERE id = user_id_param;
    
    RETURN COALESCE(credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建用户档案函数（注册时自动调用）
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- 插入用户基本信息
    INSERT INTO public.users (id, email, remaining_credits, total_purchased, total_usage)
    VALUES (
        NEW.id, 
        NEW.email, 
        10, -- 新用户默认10积分
        0, 
        0
    );
    
    -- 插入用户档案
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    -- 记录新用户获得积分
    INSERT INTO public.credit_usage (user_id, action_type, credits_used, metadata)
    VALUES (
        NEW.id,
        'welcome_bonus',
        -10, -- 负数表示获得积分
        '{"description": "新用户注册奖励"}'::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 记录积分使用函数
CREATE OR REPLACE FUNCTION record_credit_usage(
    user_id_param UUID, 
    action_type_param TEXT, 
    credits_used_param INTEGER,
    metadata_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.credit_usage (user_id, action_type, credits_used, metadata)
    VALUES (user_id_param, action_type_param, credits_used_param, metadata_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 记录使用记录函数
CREATE OR REPLACE FUNCTION record_usage(
    user_id_param UUID,
    image_format_param TEXT,
    image_width_param INTEGER DEFAULT NULL,
    image_height_param INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usage_records (user_id, image_format, image_width, image_height)
    VALUES (user_id_param, image_format_param, image_width_param, image_height_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 生成封面并扣减积分的组合函数
CREATE OR REPLACE FUNCTION generate_cover_with_credits(
    user_id_param UUID,
    image_format_param TEXT,
    image_width_param INTEGER DEFAULT NULL,
    image_height_param INTEGER DEFAULT NULL,
    credits_cost INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    current_credits INTEGER;
    result JSONB;
BEGIN
    -- 检查积分是否足够
    SELECT remaining_credits INTO current_credits 
    FROM public.users 
    WHERE id = user_id_param;
    
    IF COALESCE(current_credits, 0) < credits_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '积分不足',
            'current_credits', COALESCE(current_credits, 0),
            'required_credits', credits_cost
        );
    END IF;
    
    -- 扣减积分
    PERFORM decrement_credits(user_id_param, credits_cost);
    
    -- 记录积分使用
    PERFORM record_credit_usage(
        user_id_param, 
        'generate_cover', 
        credits_cost,
        jsonb_build_object(
            'image_format', image_format_param,
            'image_width', image_width_param,
            'image_height', image_height_param
        )
    );
    
    -- 记录使用记录
    PERFORM record_usage(user_id_param, image_format_param, image_width_param, image_height_param);
    
    -- 返回成功结果
    RETURN jsonb_build_object(
        'success', true,
        'credits_used', credits_cost,
        'remaining_credits', current_credits - credits_cost
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
