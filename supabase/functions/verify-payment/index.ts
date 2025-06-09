
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("缺少会话ID");
    }

    // 初始化 Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // 获取支付会话信息
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const userId = session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits || "0");
      const packageName = session.metadata?.package_name;

      if (userId && credits > 0) {
        try {
          // 检查交易是否已经处理过
          const { data: existingTransaction, error: checkError } = await supabaseService
            .from("transactions")
            .select("metadata")
            .eq("payment_id", sessionId)
            .single();

          if (checkError) {
            console.error("检查交易状态失败:", checkError);
            throw new Error("检查交易状态失败");
          }

          // 如果交易已经完成，直接返回
          if (existingTransaction?.metadata?.status === "completed") {
            console.log("交易已经处理过，跳过积分添加");
            return new Response(JSON.stringify({
              status: session.payment_status,
              credits: credits.toString(),
              message: "交易已处理"
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }

          // 获取当前用户数据
          const { data: userData, error: userError } = await supabaseService
            .from("users")
            .select("remaining_credits, total_purchased")
            .eq("id", userId)
            .single();

          if (userError) {
            console.error("获取用户数据失败:", userError);
            throw new Error("获取用户数据失败");
          }

          // 添加积分到用户账户
          const { error: updateError } = await supabaseService
            .from("users")
            .update({
              remaining_credits: (userData?.remaining_credits || 0) + credits,
              total_purchased: (userData?.total_purchased || 0) + credits,
              updated_at: new Date().toISOString()
            })
            .eq("id", userId);

          if (updateError) {
            console.error("更新用户积分失败:", updateError);
            throw new Error("更新用户积分失败");
          }

          // 更新交易状态为已完成
          const { error: transactionError } = await supabaseService
            .from("transactions")
            .update({
              metadata: {
                ...existingTransaction.metadata,
                status: "completed",
                processed_at: new Date().toISOString(),
                credits_added: credits
              }
            })
            .eq("payment_id", sessionId);

          if (transactionError) {
            console.error("更新交易状态失败:", transactionError);
            throw new Error("更新交易状态失败");
          }

          // 记录积分获得日志
          const { error: usageError } = await supabaseService.from("credit_usage").insert({
            user_id: userId,
            credits_used: -credits, // 负数表示获得积分
            action_type: "purchase",
            metadata: {
              package_name: packageName,
              transaction_id: sessionId,
              stripe_session_id: session.id
            }
          });

          if (usageError) {
            console.error("记录积分使用日志失败:", usageError);
            // 这个错误不影响主流程，只记录日志
          }

          console.log(`成功为用户 ${userId} 添加 ${credits} 积分`);

        } catch (error) {
          console.error("处理支付验证时发生错误:", error);

          // 更新交易状态为失败
          await supabaseService
            .from("transactions")
            .update({
              metadata: {
                status: "failed",
                error_message: error.message,
                failed_at: new Date().toISOString()
              }
            })
            .eq("payment_id", sessionId);

          throw error;
        }
      }
    }

    return new Response(JSON.stringify({
      status: session.payment_status,
      credits: session.metadata?.credits
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
