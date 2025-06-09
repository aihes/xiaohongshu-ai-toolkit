
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // 获取用户信息
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("用户未认证或邮箱不可用");
    }

    const { packageId } = await req.json();

    // 获取积分包信息
    const { data: creditPackage, error: packageError } = await supabaseClient
      .from("credit_packages")
      .select("*")
      .eq("id", packageId)
      .eq("is_active", true)
      .single();

    if (packageError || !creditPackage) {
      throw new Error("积分包不存在或已下架");
    }

    // 初始化 Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // 检查是否已有 Stripe 客户
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // 创建支付会话
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: creditPackage.currency || "cny",
            product_data: {
              name: creditPackage.name,
              description: creditPackage.description || undefined
            },
            unit_amount: creditPackage.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        user_id: user.id,
        package_id: packageId,
        package_name: creditPackage.name,
        credits: creditPackage.credits.toString(),
      },
    });

    // 记录交易（pending 状态）
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("transactions").insert({
      user_id: user.id,
      credits: creditPackage.credits,
      payment_id: session.id,
      payment_method: "stripe",
      metadata: {
        package_name: creditPackage.name,
        status: "pending"
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
