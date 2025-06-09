import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaperAnalysisRequest {
  paperUrl: string;
  analysisType: 'summary' | 'images' | 'full';
  userId: string;
}

interface AnalysisResult {
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  keywords: string[];
  figures: {
    url: string;
    caption: string;
    type: string;
  }[];
  downloadUrl?: string;
  textContent?: string;
  pageCount?: number;
}

interface ArxivParseResponse {
  success: boolean;
  arxiv_metadata?: {
    arxiv_id: string;
    title: string;
    authors: string[];
    summary: string;
    published: string;
    updated: string;
    pdf_url: string;
  };
  extraction_result?: {
    text_content: string;
    text_file: string;
    images: {
      filename: string;
      format: string;
      height: number;
      width: number;
      index: number;
      method: string;
      mode: string;
      page: number;
      size: number;
    }[];
    page_count: number;
    file_size: number;
    success: boolean;
    message: string;
  };
  error?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paperUrl, analysisType, userId }: PaperAnalysisRequest = await req.json();

    if (!paperUrl || !analysisType || !userId) {
      throw new Error("缺少必要参数");
    }

    // 初始化 Supabase 客户端
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 验证用户积分
    const requiredCredits = getRequiredCredits(analysisType);
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('remaining_credits, total_usage')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error("获取用户信息失败");
    }

    if (userData.remaining_credits < requiredCredits) {
      throw new Error("积分不足");
    }

    // 解析论文URL并获取完整内容
    const paperData = await parseArxivPaper(paperUrl);
    if (!paperData.success) {
      throw new Error(paperData.error || "无法解析论文信息");
    }

    // 根据分析类型进行处理
    let result: AnalysisResult;

    switch (analysisType) {
      case 'summary':
        result = await analyzePaperSummary(paperData);
        break;
      case 'images':
        throw new Error("图片提取功能正在开发中，敬请期待！我们正在优化PDF图片识别算法，很快就会上线。");
      case 'full':
        throw new Error("完整分析功能正在开发中，敬请期待！目前请先使用论文总结功能。");
      default:
        throw new Error("不支持的分析类型");
    }

    // 扣减积分
    const { error: creditError } = await supabaseService
      .from('users')
      .update({
        remaining_credits: userData.remaining_credits - requiredCredits,
        total_usage: (userData.total_usage || 0) + 1
      })
      .eq('id', userId);

    if (creditError) {
      console.error('扣减积分失败:', creditError);
    }

    // 记录使用日志
    await supabaseService.from('credit_usage').insert({
      user_id: userId,
      action_type: 'analyze_paper',
      credits_used: requiredCredits,
      metadata: {
        paper_url: paperUrl,
        analysis_type: analysisType,
        paper_title: result.title
      }
    });

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("论文分析错误:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "论文分析失败，请重试"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function getRequiredCredits(analysisType: string): number {
  switch (analysisType) {
    case 'summary': return 5;
    case 'images': return 3;
    case 'full': return 8;
    default: return 5;
  }
}

// 使用新的arXiv解析API获取完整论文内容
async function parseArxivPaper(paperUrl: string): Promise<ArxivParseResponse> {
  try {
    // 从URL中提取arXiv ID
    let arxivId: string;

    // 支持多种格式
    const absMatch = paperUrl.match(/arxiv\.org\/abs\/([\d.]+v?\d*)/);
    const pdfMatch = paperUrl.match(/arxiv\.org\/pdf\/([\d.]+v?\d*)/);

    if (absMatch) {
      arxivId = absMatch[1];
    } else if (pdfMatch) {
      arxivId = pdfMatch[1];
    } else {
      throw new Error("无效的 arXiv URL 格式");
    }

    console.log(`正在解析arXiv论文: ${arxivId}`);

    // 调用arXiv解析API
    const ARXIV_API_URL = Deno.env.get("ARXIV_API_URL") || "https://your-arxiv-api-endpoint.com/api/arxiv/parse";
    const response = await fetch(ARXIV_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        arxiv_id: arxivId
      })
    });

    if (!response.ok) {
      throw new Error(`arXiv解析API请求失败: ${response.status}`);
    }

    const data: ArxivParseResponse = await response.json();
    console.log(data);

    if (!data.success) {
      throw new Error(data.error || "论文解析失败");
    }

    console.log(`论文解析成功: ${data.arxiv_metadata?.title}`);
    console.log(`文本长度: ${data.extraction_result?.text_content?.length || 0} 字符`);
    console.log(`图片数量: ${data.extraction_result?.images?.length || 0} 张`);
    console.log(`页面数量: ${data.extraction_result?.page_count || 0} 页`);

    return data;

  } catch (error) {
    console.error('arXiv 解析错误:', error);
    return {
      success: false,
      error: error.message || "论文解析失败"
    };
  }
}

async function analyzePaperSummary(paperData: ArxivParseResponse): Promise<AnalysisResult> {
  try {
    if (!paperData.arxiv_metadata) {
      throw new Error("论文元数据缺失");
    }

    // 使用 OpenRouter Claude 生成小红书风格的论文总结
    const summary = await generateSummaryWithAI(paperData);
    const keywords = extractSimpleKeywords(paperData.arxiv_metadata.summary || '');

    return {
      title: paperData.arxiv_metadata.title,
      authors: paperData.arxiv_metadata.authors,
      abstract: paperData.arxiv_metadata.summary,
      summary: summary,
      keywords: keywords,
      figures: [],
      textContent: paperData.extraction_result?.text_content ? paperData.extraction_result.text_content.slice(0, 1000) : undefined,
      pageCount: paperData.extraction_result?.page_count
    };
  } catch (error) {
    console.error('论文分析失败:', error);

    // 如果AI分析失败，使用基于摘要的分析
    const fallbackSummary = generateXiaohongshuStyleSummary(paperData);

    return {
      title: paperData.arxiv_metadata?.title || "未知标题",
      authors: paperData.arxiv_metadata?.authors || [],
      abstract: paperData.arxiv_metadata?.summary || "无摘要",
      summary: fallbackSummary,
      keywords: extractSimpleKeywords(paperData.arxiv_metadata?.summary || ''),
      figures: [],
      textContent: paperData.extraction_result?.text_content ? paperData.extraction_result.text_content.slice(0, 1000) : undefined,
      pageCount: paperData.extraction_result?.page_count
    };
  }
}

// 使用OpenRouter Claude生成小红书风格的论文总结
async function generateSummaryWithAI(paperData: ArxivParseResponse): Promise<string> {
  try {
    // 使用OpenRouter API密钥
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

    if (!paperData.arxiv_metadata) {
      throw new Error("论文元数据缺失");
    }

    if (openrouterKey && paperData.arxiv_metadata.summary && paperData.arxiv_metadata.summary.length > 50) {
      // 准备论文内容，优先使用完整文本，但要控制长度
      let paperContent = paperData.arxiv_metadata.summary;

      if (paperData.extraction_result?.text_content && paperData.extraction_result.text_content.length > 500) {
        // 如果有完整文本，取前5000字符作为补充
        const textSample = paperData.extraction_result.text_content.slice(0, 5000);
        paperContent += `\n\n论文内容片段：\n${textSample}`;
      }

      console.log(`准备发送给AI的内容长度: ${paperContent.length} 字符`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "HTTP-Referer": "https://xhs-cover.vercel.app",
          "X-Title": "小红书AI论文分析器",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: `你是一个专业的学术论文分析师，擅长将复杂的学术内容转化为小红书风格的易懂内容。

请按照以下要求分析论文：
1. 生成一个吸引人的小红书标题（15-25字，包含emoji）
2. 用小红书的语言风格总结论文核心内容
3. 突出研究方法和关键发现
4. 内容要通俗易懂，适合大众阅读
5. 总字数控制在300-500字
6. 使用适当的emoji和分段

输出格式：
🔥 标题：[吸引人的标题]

📚 论文速览：
[简单介绍这篇论文是做什么的]

🔬 核心方法：
[用通俗语言解释研究方法]

💡 重要发现：
[列出2-3个关键发现]

🎯 实际意义：
[这个研究对我们有什么用]

#学术研究 #科技前沿 #论文解读`
            },
            {
              role: "user",
              content: `请分析这篇论文：

标题：${paperData.arxiv_metadata.title}

作者：${paperData.arxiv_metadata.authors?.join(', ') || '未知作者'}

发表时间：${paperData.arxiv_metadata.published}

${paperContent}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiSummary = data.choices[0]?.message?.content;

        if (aiSummary && aiSummary.length > 100) {
          console.log('OpenRouter Claude分析成功，生成内容长度:', aiSummary.length);
          return aiSummary;
        }
      } else {
        const errorText = await response.text();
        console.error('OpenRouter API调用失败:', response.status, errorText);
      }
    }

    // 如果AI分析失败，使用基于摘要的分析
    return generateXiaohongshuStyleSummary(paperData);
  } catch (error) {
    console.error('AI摘要生成失败:', error);
    return generateXiaohongshuStyleSummary(paperData);
  }
}

// 生成小红书风格的论文总结（备用方案）
function generateXiaohongshuStyleSummary(paperData: ArxivParseResponse | any): string {
  // 兼容新旧数据结构
  const title = paperData.arxiv_metadata?.title || paperData.title || "未知标题";
  const abstract = paperData.arxiv_metadata?.summary || paperData.abstract || "无摘要";
  const authors = paperData.arxiv_metadata?.authors || paperData.authors || [];

  // 简单的关键词提取
  const keywords = extractSimpleKeywords(abstract);
  const emoji = getRandomEmoji();

  return `
🔥 标题：${emoji} 最新学术研究解读！这篇论文太有意思了

📚 论文速览：
这篇研究探讨了${title.slice(0, 50)}相关的重要问题。研究团队通过创新的方法，为我们带来了新的见解和发现。

👥 研究团队：
${authors.slice(0, 3).join(', ')}${authors.length > 3 ? ' 等' : ''}

🔬 核心方法：
研究者采用了先进的研究方法，通过系统性的分析和实验，深入探索了相关领域的核心问题。

💡 重要发现：
• 提出了新的理论框架和解决方案
• 验证了研究假设的有效性
• 为相关领域提供了重要的参考价值

🎯 实际意义：
这项研究不仅在学术上具有重要价值，还可能对实际应用产生积极影响，为相关行业的发展提供新的思路和方向。

📖 论文摘要：
${abstract.slice(0, 200)}${abstract.length > 200 ? '...' : ''}

#学术研究 #科技前沿 #论文解读 ${keywords.map(k => `#${k}`).join(' ')}
  `.trim();
}

// 简单的关键词提取
function extractSimpleKeywords(text: string): string[] {
  const commonKeywords = [
    '人工智能', 'AI', '机器学习', '深度学习', '神经网络', '算法',
    '数据分析', '计算机视觉', '自然语言处理', '大数据', '云计算',
    '区块链', '物联网', '5G', '量子计算', '生物技术', '医学',
    '材料科学', '环境科学', '能源', '可持续发展'
  ];

  const foundKeywords = commonKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  return foundKeywords.slice(0, 3);
}

// 获取随机emoji
function getRandomEmoji(): string {
  const emojis = ['🚀', '💡', '🔬', '📊', '🎯', '⚡', '🌟', '🔥', '💎', '🎨'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}
