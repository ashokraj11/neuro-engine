import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = (userApiKey?: string) => {
  const apiKey = userApiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No API key provided. Please set one in Settings.");
  return new GoogleGenAI({ apiKey });
};

const TEXT_MODELS = ["gemini-3.1-pro-preview", "gemini-3-flash-preview", "gemini-3.1-flash-lite-preview"];
const IMAGE_MODELS = ["gemini-3.1-flash-image-preview", "gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
const AUDIO_MODELS = ["gemini-2.5-flash-preview-tts"];

export const NEURODIGITAL_MARKETING_PRINCIPLES = `
  Neurodigital Marketing Principles:
  - Pattern Interrupt: Use visual/textual hooks that stop the scroll instantly.
  - Limbic System Activation: Target deep-seated emotions (fear of missing out, desire for status, relief from pain).
  - Cognitive Ease: Clear, punchy copy that is easy to process but hard to ignore.
  - Micro-Commitments: CTAs that feel low-risk but high-reward.
  - Social Proof: Leverage the Bandwagon Effect and expert consensus.
  - Scarcity & Urgency: Create genuine, time-sensitive pressure.
  - Storytelling: Use Narrative Transport to bypass critical filters.
`;

export type BrandVoice = { 
  tone: string, 
  examples: string,
  productDetails?: string,
  logoUrl?: string,
  colors?: string[],
  name?: string;
  description?: string;
  fears?: string;
  desires?: string;
  jobsToBeDone?: string;
  vocabulary?: string;
  psychologicalTriggers?: string;
};

const getAvatarPrompt = (brandVoice?: BrandVoice) => {
  if (!brandVoice || !brandVoice.name) return '';
  return `
    CUSTOMER AVATAR DNA (THE TARGET):
    - Name: ${brandVoice.name}
    - Description: ${brandVoice.description}
    - Deep-Seated Fears: ${brandVoice.fears}
    - Secret Desires: ${brandVoice.desires}
    - Jobs to be Done: ${brandVoice.jobsToBeDone}
    - Specific Vocabulary: ${brandVoice.vocabulary}
    - Psychological Triggers: ${brandVoice.psychologicalTriggers}
    - INSTRUCTION: Tailor ALL content to resonate deeply with this specific persona. Use their vocabulary and hit their specific psychological triggers.
  `;
};

async function generateWithFallback(ai: any, params: any, models: string[], retries = 3, delay = 2000) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const model of models) {
      try {
        console.log(`Attempting generation with model: ${model} (Attempt ${attempt + 1})`);
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (error: any) {
        console.warn(`Model ${model} failed:`, error.message || error);
        lastError = error;
      }
    }
    
    if (attempt < retries) {
      console.warn(`All models failed, retrying in ${delay}ms... (${retries - attempt} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw lastError;
}

export const geminiService = {
  async generateBlog(params: {
    url: string;
    productDetails: string;
    targetLink: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    blogType: string;
    wordCount: number;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are a human-style blog writer, an elite SEO expert, and a neuromarketing strategist. Your goal is to produce blog articles that feel natural, conversational, and engaging for human readers while remaining clear, truthful, and useful.
      
      Task: Generate a high-converting marketing blog article.
      
      ${NEURODIGITAL_MARKETING_PRINCIPLES}

      ${getAvatarPrompt(params.brandVoice)}

      Inputs:
      - Sales Page URL: ${params.url}
      - Product Details: ${params.productDetails}
      - Target Link: ${params.targetLink}
      - Primary Keyword: ${params.primaryKeyword}
      - Secondary Keywords: ${params.secondaryKeywords.join(", ")}
      - Blog Type: ${params.blogType}
      - Target Word Count: ${params.wordCount}
      
      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      WRITING STYLE RULES (CRITICAL FOR BYPASSING AI DETECTION)
      1. Write in a conversational human tone. Use natural language as if explaining something to a curious reader.
      2. Vary sentence length drastically (high burstiness). Mix very short, punchy sentences (even fragments) with longer, complex descriptive ones.
      3. Avoid robotic structure. Do not use repetitive patterns like: "Firstly… Secondly… Thirdly…" or "In conclusion".
      4. Use storytelling when possible. Include relatable examples, scenarios, or analogies. Use first-person ("I", "we") and second-person ("you") perspectives.
      5. Write with emotional intelligence. Acknowledge reader curiosity, confusion, or interest. Example: "At first this might seem confusing. But once you see how it works, it becomes surprisingly simple."
      6. Avoid generic filler phrases such as: "In today's world", "As we all know", "It is important to note that", "Delve into", "A testament to", "Crucial", "Tapestry", "Landscape", "Realm", "Moreover", "Furthermore", "Ultimately", "Foster", "Navigate", "Beacon", "Seamless", "Robust", "Transformative", "Elevate", "Unlock".
      7. Use natural transitions such as: "But here's the interesting part...", "Now this is where things get fascinating.", "So what does this actually mean?", "Look,".
      8. Maintain high readability. Target: Grade level: 6–9. Short paragraphs (1–3 sentences).
      9. Use rhythm variation. Alternate between: explanation, example, insight, takeaway.
      10. Add human-style curiosity hooks. Examples: "You might be wondering why this matters.", "Here's where things get interesting."
      11. Avoid overly perfect grammar patterns. Occasional conversational phrasing, starting sentences with conjunctions ("And", "But", "Because"), and colloquialisms are highly encouraged.
      12. Reduce repetition. Do not repeat the same key phrase more than necessary. Use synonyms and varied phrasing.
      13. Add clarity through examples. Whenever explaining a concept, include at least one practical example.
      14. Use natural emphasis. Use italics or short emphasis phrases like: "Here's the key idea."
      15. High Perplexity: Use unexpected word choices and avoid highly predictable next-word sequences. Write like a human expert who is passionate and slightly opinionated.

      STRUCTURE FOR BLOG POSTS
      1. Hook introduction (create curiosity)
      2. Problem or question readers care about
      3. Clear explanation
      4. Real-world example
      5. Insight or deeper perspective
      6. Practical takeaway

      PARAGRAPH RULES
      • 2–4 sentences per paragraph
      • Avoid large text blocks
      • Use natural flow between ideas

      ENGAGEMENT TECHNIQUES
      • Ask occasional rhetorical questions
      • Use relatable comparisons
      • Write as if speaking directly to the reader

      FINAL QUALITY CHECK
      Before finalizing the article, verify:
      ✓ Tone feels conversational
      ✓ Sentence lengths vary naturally
      ✓ Content flows logically
      ✓ No robotic repetition
      ✓ Writing feels like a knowledgeable human explaining the topic

      Process:
      1. Analyze the provided Sales Page URL (if any) and Product Details.
      2. Analyze search intent for "${params.primaryKeyword}".
      3. Apply neuromarketing triggers (Loss Aversion, Curiosity Gap, Authority).
      4. Structure using STRICT Markdown headings (# for H1, ## for H2, ### for H3). DO NOT use raw HTML tags.
      5. Include Meta Title, Meta Description, and Table of Contents. For FAQ Schema, provide it as a formatted Markdown code block (\`\`\`json), NOT as a raw <script> tag.
      6. Identify 3 to 5 key sections or headings that would benefit from a visual aid (image). Based on the article length, generate 3 to 5 "Ultra realistic and eye-stopping" AI image generation prompts for required headings and paragraphs. These images should make the concepts easy to understand and engage users.
      7. IMPORTANT: In the 'markdown' output, you MUST insert placeholders like [IMAGE_1], [IMAGE_2], etc., exactly where these images should be placed (e.g., right below a relevant heading or paragraph). The number of placeholders must match the number of image prompts you provide.
      
      CRITICAL: The 'markdown' field MUST contain ONLY valid Markdown (with the [IMAGE_X] placeholders). Do NOT include any raw HTML tags, <script> tags, or XML.
      
      Return the result as a structured JSON object with:
      - markdown: The full blog article in Markdown format, containing [IMAGE_X] placeholders.
      - imagePrompts: An array of 3 to 5 descriptive image prompts (specifying "ultra realistic, eye-stopping, high quality") corresponding to the [IMAGE_X] placeholders.
    `;

    const tools: any[] = [{ googleSearch: {} }];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            markdown: { type: Type.STRING },
            imagePrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 descriptive image prompts for the blog sections."
            }
          },
          required: ["markdown", "imagePrompts"]
        }
      },
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },

  async generateSalesFunnel(params: {
    url: string;
    productDetails: string;
    funnelType: string;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are a world-class Sales Funnel Architect and Neuromarketing Strategist.
      Analyze the product: ${params.productDetails} and the provided Sales Page URL: ${params.url}
      
      TASK
      Design a high-converting ${params.funnelType} sales funnel.
      
      ${NEURODIGITAL_MARKETING_PRINCIPLES}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      STRUCTURE
      - Funnel Stages: Map out the journey (e.g., Opt-in -> Thank You -> Nurture -> Offer).
      - Neuromarketing Triggers: Identify which triggers to use at each stage.
      - Copy Hooks: Suggest 3 high-converting hooks for the opt-in page.
      - Offer Strategy: How to position the offer for maximum conversion.
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            funnelStages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING },
                  description: { type: Type.STRING },
                  neuromarketingTrigger: { type: Type.STRING }
                },
                required: ["stage", "description", "neuromarketingTrigger"]
              }
            },
            copyHooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            offerStrategy: { type: Type.STRING }
          },
          required: ["funnelStages", "copyHooks", "offerStrategy"]
        }
      }
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },

  async generateBridgePage(params: {
    offerUrl?: string;
    productDetails?: string;
    targetAudience?: string;
    brandVoice?: BrandVoice;
    framework?: string;
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are an expert Affiliate Copywriter and Conversion Specialist with 50+ years of experience.
      
      TASK
      Generate a high-converting "Bridge Page" (pre-sell page) for an affiliate offer using the ${params.framework || 'PAS (Problem-Agitate-Solve)'} framework.
      
      ${getAvatarPrompt(params.brandVoice)}

      Inputs:
      - Offer URL: ${params.offerUrl || 'Not provided'}
      - Product Details: ${params.productDetails || 'Not provided'}
      - Target Audience: ${params.targetAudience || 'Not provided'}
      - Framework: ${params.framework || 'PAS'}
      
      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      STRUCTURE
      - Headline: A scroll-stopping hook that creates curiosity.
      - Story: A relatable narrative that builds empathy and trust.
      - The Gap: Clearly define the problem/pain point the reader is experiencing (Agitate if PAS).
      - The Bridge: Introduce the offer as the natural solution to bridge the gap.
      - Soft CTA: A low-friction call-to-action button text (e.g., "See how it works").
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.offerUrl) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            story: { type: Type.STRING },
            gap: { type: Type.STRING },
            bridge: { type: Type.STRING },
            cta: { type: Type.STRING }
          },
          required: ["headline", "story", "gap", "bridge", "cta"]
        }
      }
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },

  async generateOfferAngles(params: {
    offerUrl?: string;
    productDetails?: string;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are an expert Affiliate Strategist and Conversion Copywriter.
      
      TASK
      Analyze the provided affiliate offer and generate 10 distinct, high-converting "Angles" to promote it.
      
      ${getAvatarPrompt(params.brandVoice)}

      Inputs:
      - Offer URL: ${params.offerUrl || 'Not provided'}
      - Product Details: ${params.productDetails || 'Not provided'}
      
      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      STRUCTURE
      Generate 10 angles, each with:
      - Title: A catchy name for the angle (e.g., "The Scientific Angle").
      - Description: A brief explanation of the psychological hook used.
      - Hook: A powerful, scroll-stopping headline for an ad or bridge page.
      - Target Audience: Who this specific angle appeals to most.
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.offerUrl) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            angles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  hook: { type: Type.STRING },
                  targetAudience: { type: Type.STRING }
                },
                required: ["title", "description", "hook", "targetAudience"]
              }
            }
          },
          required: ["angles"]
        }
      }
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },

  async checkAdPolicy(params: {
    adCopy?: string;
    landingPageUrl?: string;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are an expert Ad Policy Compliance Specialist for major advertising platforms (Facebook, Google, TikTok).
      
      TASK
      Analyze the provided ad copy and/or landing page URL for potential policy violations.
      
      ${getAvatarPrompt(params.brandVoice)}

      Inputs:
      - Ad Copy: ${params.adCopy || 'Not provided'}
      - Landing Page URL: ${params.landingPageUrl || 'Not provided'}
      
      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      STRUCTURE
      - Status: "Compliant", "Warning", or "Violation".
      - Issues: List of potential policy violations found.
      - Recommendations: Actionable steps to fix the issues.
      - Risk Level: "Low", "Medium", or "High".
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.landingPageUrl) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskLevel: { type: Type.STRING }
          },
          required: ["status", "issues", "recommendations", "riskLevel"]
        }
      }
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },

  async generateNicheAndPersona(params: {
    url?: string;
    productDetails?: string;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are a world-class Niche Strategist and Buyer Persona Architect.
      
      TASK
      Analyze the provided product details: "${params.productDetails || 'Not provided'}" and the sales page URL: "${params.url || 'Not provided'}".
      
      Suggest a Niche, a Sub-niche, and generate a Full Detailed Buyer Persona.

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      STRUCTURE
      - Niche: The broad market category.
      - Sub-niche: A specific, profitable segment within the niche.
      - Buyer Persona:
        - Demographics
        - Psychographics
        - Pain Points
        - Goals/Desires
        - Buying Triggers
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            niche: { type: Type.STRING },
            subNiche: { type: Type.STRING },
            buyerPersona: {
              type: Type.OBJECT,
              properties: {
                demographics: { type: Type.STRING },
                psychographics: { type: Type.STRING },
                painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                buyingTriggers: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["demographics", "psychographics", "painPoints", "goals", "buyingTriggers"]
            }
          },
          required: ["niche", "subNiche", "buyerPersona"]
        }
      }
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },

  async generateAds(params: { 
    url: string; 
    productDetails: string; 
    userApiKey?: string;
    mode: 'full' | 'summary';
    style: 'lifestyle' | 'ugc' | '3d-cartoon' | 'minimalist' | 'bold';
    aspectRatio: '1:1' | '9:16' | '16:9';
    brandVoice?: BrandVoice;
    
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      You are a world-class Senior Media Buyer and Neuromarketer.
      Analyze the product: ${params.productDetails} and the provided Sales Page URL: ${params.url}
      
      Task: Generate ${params.mode === 'full' ? '5' : '2'} high-converting Meta Ad creatives using the "Meta Andromeda" strategy.
      
      ${getAvatarPrompt(params.brandVoice)}

      Meta Andromeda Strategy:
      - Creative-Led Targeting: Visuals and hooks are designed to be so specific that the algorithm naturally finds the right audience based on who interacts with the ad.
      - Frameworks: Use PAS (Problem-Agitate-Solution) or AIDA (Attention-Interest-Desire-Action) for copy.
      - Style: ${params.style}
      - Aspect Ratio: ${params.aspectRatio}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      For each creative, provide:
      - Angle: The psychological angle (e.g., "PAS - Pain Point", "AIDA - Curiosity").
      - Primary Text: High-converting copy using the chosen framework.
      - Headline: Short, punchy, and curiosity-driven.
      - Description: Supporting text.
      - CTA: Action-oriented button text.
      - Image Creative Prompt: A detailed prompt for Gemini 2.5 Flash Image to generate a high-quality visual in the ${params.style} style.
      - Framework Logic: A brief explanation of why this copy works based on neuromarketing principles.
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              angle: { type: Type.STRING },
              primaryText: { type: Type.STRING },
              headline: { type: Type.STRING },
              description: { type: Type.STRING },
              cta: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
              frameworkLogic: { type: Type.STRING },
            },
            required: ["angle", "primaryText", "headline", "description", "cta", "imagePrompt", "frameworkLogic"],
          },
        },
      },
    }, TEXT_MODELS);

    return JSON.parse(response.text || "[]");
  },

  async generateLandingPage(params: { url: string; productDetails: string; userApiKey?: string; brandVoice?: BrandVoice; framework?: string; }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are an elite conversion-focused landing page architect and neuro-copywriter with 50+ years of experience.
      
      TASK
      Create a high-converting landing page structure using the ${params.framework || 'AIDA (Attention-Interest-Desire-Action)'} framework.

      Context:
      - Sales Page URL: ${params.url}
      - Product Details: ${params.productDetails}
      - Framework: ${params.framework || 'AIDA'}
      
      ${NEURODIGITAL_MARKETING_PRINCIPLES}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      The landing page should follow this high-converting VSL structure:
      1. Pre-Headline: A curiosity-driven or warning-style line to stop the scroll.
      2. Main Hero Headline: A bold, benefit-driven headline that makes a "Big Promise".
      3. Hero Subheadline: A supporting claim that handles the primary objection.
      4. VSL Script Hook: A short, punchy hook for the video (1-2 sentences).
      5. Problem Agitation: Deeply agitate the pain points using emotional triggers.
      6. Solution Presentation: Introduce the product as the "Unique Mechanism" that solves the problem.
      7. Key Benefits: 3-5 bullet points focusing on outcomes, not just features.
      8. Social Proof / Testimonials: Create 2 realistic, high-impact testimonials.
      9. Scarcity/Urgency Message: A reason why they must act NOW.
      10. Final CTA: A strong, command-style call to action.
      
      Return as structured JSON with the following keys:
      - preHeadline
      - heroHeadline
      - heroSubheadline
      - vslHook
      - heroCTA
      - problemAgitation
      - solutionPresentation
      - keyBenefits (array of strings)
      - testimonials (array of objects with 'name', 'role', 'quote')
      - scarcityMessage
      - finalCTA
    `;

    const tools: any[] = [];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            preHeadline: { type: Type.STRING },
            heroHeadline: { type: Type.STRING },
            heroSubheadline: { type: Type.STRING },
            vslHook: { type: Type.STRING },
            heroCTA: { type: Type.STRING },
            problemAgitation: { type: Type.STRING },
            solutionPresentation: { type: Type.STRING },
            keyBenefits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            testimonials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  quote: { type: Type.STRING }
                },
                required: ["name", "role", "quote"]
              }
            },
            scarcityMessage: { type: Type.STRING },
            finalCTA: { type: Type.STRING }
          },
          required: [
            "preHeadline", "heroHeadline", "heroSubheadline", "vslHook",
            "heroCTA", "problemAgitation", "solutionPresentation", 
            "keyBenefits", "testimonials", "scarcityMessage", "finalCTA"
          ]
        },
      },
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },
  async generateEmailSwipes(params: { url: string; productDetails: string; userApiKey?: string; brandVoice?: BrandVoice;  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      You are an elite neuro-copywriter specializing in high-converting email sequences.
      Create a 10-part email swipe sequence based on the following:
      - Sales Page URL: ${params.url}
      - Product Details: ${params.productDetails}
      
      ${NEURODIGITAL_MARKETING_PRINCIPLES}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      The sequence MUST include 10 distinct emails, each leveraging a specific neuromarketing angle:
      1. Pattern Interrupt (Curiosity & Surprise)
      2. Logic & Proof (Data-driven & Rational)
      3. Urgency & Action (Time-sensitive & Direct)
      4. Social Proof (Bandwagon Effect & Testimonials)
      5. Authority (Expert Consensus & Credibility)
      6. Scarcity (Limited Availability & Exclusivity)
      7. Reciprocity (Value First & Giving)
      8. Liking (Relatability & Shared Values)
      9. Commitment & Consistency (Small Yes to Big Yes)
      10. Fear of Missing Out (FOMO & Loss Aversion)
      
      For each email, provide:
      - Subject Line: High open-rate, curiosity-driven.
      - Preview Text: Compelling hook.
      - Body: The main email content using the specific neuro-marketing principle assigned to that email.
      - CTA: Clear, action-oriented call to action.
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "The neuromarketing angle used, e.g., Email 1: Pattern Interrupt" },
              subject: { type: Type.STRING },
              previewText: { type: Type.STRING },
              body: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
            required: ["type", "subject", "previewText", "body", "cta"],
          },
        },
      },
    }, TEXT_MODELS);

    return JSON.parse(response.text || "{}");
  },

  async generateReelScript(params: { url: string; productDetails: string; userApiKey?: string; sceneCount?: number; brandVoice?: BrandVoice;  }) {
    const ai = getAI(params.userApiKey);
    const count = params.sceneCount || 5;
    const prompt = `
      ROLE
      You are a short-form video viral strategist and master of faceless video content.
      Analyze the product: ${params.productDetails} and the provided Sales Page URL: ${params.url}
      
      ${NEURODIGITAL_MARKETING_PRINCIPLES}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      TASK
      Create a high-converting faceless reel script broken down into ${count} scenes for a 9:16 vertical video.
      Structure:
      - Scene 1: Hook (Stop the scroll)
      - Scenes 2-${count - 1}: Problem, Agitation, Solution (Build desire)
      - Scene ${count}: CTA (Drive action)
      
      For each scene, provide:
      - Visual Description: Detailed description for an AI image generator.
      - Voiceover Text: Engaging, human-like narration.
      - On-screen Caption: Short, punchy text overlay.
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scene: { type: Type.STRING },
              visualPrompt: { type: Type.STRING },
              voiceover: { type: Type.STRING },
              caption: { type: Type.STRING },
            },
            required: ["scene", "visualPrompt", "voiceover", "caption"],
          },
        },
      },
    }, TEXT_MODELS);

    return JSON.parse(response.text || "[]");
  },

  async generateImage(prompt: string, userApiKey?: string, aspectRatio: string = "1:1", retries = 3, delay = 2000): Promise<string | null> {
    const ai = getAI(userApiKey);
    const response = await generateWithFallback(ai, {
      contents: { parts: [{ text: `Neurodigital Style Ad Creative: ${prompt}. Professional commercial photography, cinematic lighting, highly detailed, psychological pattern interrupt.` }] },
      config: {
        imageConfig: { 
          aspectRatio
        }
      }
    }, IMAGE_MODELS, retries, delay);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async generateWhatsappSwipes(params: { url: string; productDetails: string; userApiKey?: string; brandVoice?: BrandVoice;  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      You are an elite neuro-copywriter specializing in high-converting WhatsApp marketing.
      Create a 10-part WhatsApp swipe sequence based on the following:
      - Sales Page URL: ${params.url}
      - Product Details: ${params.productDetails}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      The sequence MUST include 10 distinct WhatsApp messages, each leveraging a specific neuromarketing angle:
      1. Pattern Interrupt (Curiosity & Surprise)
      2. Logic & Proof (Data-driven & Rational)
      3. Urgency & Action (Time-sensitive & Direct)
      4. Social Proof (Bandwagon Effect & Testimonials)
      5. Authority (Expert Consensus & Credibility)
      6. Scarcity (Limited Availability & Exclusivity)
      7. Reciprocity (Value First & Giving)
      8. Liking (Relatability & Shared Values)
      9. Commitment & Consistency (Small Yes to Big Yes)
      10. Fear of Missing Out (FOMO & Loss Aversion)
      
      For each message, provide:
      - Message Text: Short, punchy, and emoji-rich (WhatsApp style).
      - Image Prompt: A descriptive prompt for an AI image generator that visually represents the message's core hook (Ultra realistic, eye-stopping).
      
      Return as structured JSON.
    `;

    const tools: any[] = [];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "The neuromarketing angle used" },
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
            },
            required: ["type", "text", "imagePrompt"],
          },
        },
      },
    }, TEXT_MODELS);

    return JSON.parse(response.text || "[]");
  },

  async generateVoiceover(text: string, userApiKey?: string) {
    const ai = getAI(userApiKey);
    const response = await generateWithFallback(ai, {
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    }, AUDIO_MODELS);

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/mpeg;base64,${base64Audio}` : null;
  },

  async generateLeadMagnet(params: {
    url: string;
    productDetails: string;
    guideType: string;
    length: string;
    monetizationGoal: string;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are an elite content strategist, high-ticket coach, and master of lead magnet conversion. Your goal is to create a structured, high-value lead magnet (ebook or guide) that establishes immediate authority and converts cold traffic into warm leads.

      TASK
      Generate a complete Lead Magnet Package based on the following inputs:
      - Sales Page URL: ${params.url}
      - Product Details: ${params.productDetails}
      - Guide Type: ${params.guideType}
      - Length Target: ${params.length} (Short: ~3k words, Medium: ~7k words, Long: ~15k words)
      - Monetization Goal: ${params.monetizationGoal}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA
      Tone: ${params.brandVoice.tone}
      Examples: ${params.brandVoice.examples}
      ` : ''}

      STRUCTURE & CONTENT REQUIREMENTS
      1. Title Engineering: Suggest 5 "Magnetic" titles designed for high click-through rates.
      2. Strategic Outline: A logical, high-retention chapter structure (min 5 chapters).
      3. Deep Content Generation: For each chapter, write comprehensive content in Markdown including:
         - The Why: Why this matters to the reader.
         - The How: Actionable steps, frameworks, or strategies.
         - The Result: What they will achieve by implementing this.
      4. Framework Integration: Inject actionable frameworks (e.g., Step-by-Step, 3-Pillar, or 5-Day Challenges).
      5. Conversion Optimization: Craft specific "Lead Capture Positioning" and CTAs throughout the text that align with the ${params.monetizationGoal}.
      6. Tone: Helpful, Educational, Actionable, and Authoritative (Mentor-like).

      VISUAL STYLE (FOR MARKDOWN RENDERING)
      - Use clear typography and distinct section headers (# for Title, ## for Chapters, ### for Sub-sections).
      - Use "Bento Box" style callouts (Markdown blockquotes or code blocks) for frameworks.
      - Use bold text for emphasis.
      - Every chapter MUST end with a "Next Step" actionable block.

      GROUNDING
      Use Google Search to include current statistics, real-world examples, and up-to-date case studies to make the content authoritative.

      Return the result as a structured JSON object.
    `;

    const tools: any[] = [{ googleSearch: {} }];
    if (params.url) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "5 Magnetic Title Ideas"
            },
            outline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapter: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["chapter", "description"]
              },
              description: "Strategic Outline of the guide"
            },
            content: {
              type: Type.STRING,
              description: "Full Chapter Content in Markdown format"
            },
            frameworks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key Frameworks & Actionable Steps included"
            },
            ctaStrategy: {
              type: Type.STRING,
              description: "Lead Positioning & Custom CTA strategy used"
            }
          },
          required: ["titles", "outline", "content", "frameworks", "ctaStrategy"]
        }
      },
    }, ["gemini-3.1-pro-preview", "gemini-3-flash-preview"]);

    return JSON.parse(response.text || "{}");
  },

  async generateCompetitorCounterStrategy(params: {
    competitorUrl: string;
    competitorCopy: string;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are an elite competitive intelligence analyst and direct-response copywriter. Your goal is to reverse-engineer a competitor's marketing strategy and generate a superior "Counter-Offer" that positions the user's brand as the obvious choice.

      TASK
      Analyze the following competitor information:
      - Competitor URL: ${params.competitorUrl || "Not provided"}
      - Competitor Copy/Text: ${params.competitorCopy || "Not provided"}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the counter-offer copy.
      ` : ''}

      ANALYSIS & GENERATION REQUIREMENTS
      1. Identify their main hook and core promise.
      2. Identify their weaknesses, gaps, or what they are failing to address.
      3. Identify missed opportunities (what they aren't saying that the target audience cares about).
      4. Generate 3 "Superior Counter-Offers" that exploit these weaknesses. Each should have a headline, an angle, and a reason "Why it wins".
      5. Write a piece of "Counter-Ad Copy" (for Facebook/Instagram) that directly challenges their premise and positions the user's brand as the superior alternative, using the Brand Voice (if provided).

      Return the result as a structured JSON object.
    `;

    const tools: any[] = [{ googleSearch: {} }];
    if (params.competitorUrl) {
      tools.push({ urlContext: {} });
    }

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                mainHook: { type: Type.STRING },
                weaknesses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                missedOpportunities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["mainHook", "weaknesses", "missedOpportunities"]
            },
            counterOffers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  angle: { type: Type.STRING },
                  whyItWins: { type: Type.STRING }
                },
                required: ["headline", "angle", "whyItWins"]
              }
            },
            counterAdCopy: { type: Type.STRING }
          },
          required: ["analysis", "counterOffers", "counterAdCopy"]
        }
      },
    }, ["gemini-3.1-pro-preview", "gemini-3-flash-preview"]);

    return JSON.parse(response.text || "{}");
  },

  async generateSocialMediaTopics(params: {
    niche: string;
    postAngle: string;
    context?: string;
    count: number;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are a viral social media strategist and neuromarketing expert. Your goal is to suggest unique, high-engagement topics for social media posts.

      TASK
      Suggest ${params.count} unique topics for social media posts based on:
      - Niche: ${params.niche}
      - Post Angle (Neuromarketing): ${params.postAngle}
      - Context: ${params.context || "None provided"}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      ${NEURODIGITAL_MARKETING_PRINCIPLES}

      REQUIREMENTS
      - Topics should be emotionally resonant and psychologically uplifting.
      - Leverage the specific neuromarketing Post Angle provided to create a deep psychological connection.
      - Each topic should be a short, punchy phrase.

      Return the result as a JSON array of strings.
    `;

    const response = await generateWithFallback(ai, {
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    }, TEXT_MODELS);

    return JSON.parse(response.text || "[]");
  },

  async generateSocialMediaPost(params: {
    topic: string;
    context?: string;
    manualScript?: string;
    visualPromptHint?: string;
    dimension: string;
    language: string;
    postAngle: string;
    brandVoice?: BrandVoice;
    
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    
    // 1. Generate Text Content
    const textPrompt = `
      ROLE
      You are an emotionally intelligent social media creator and neuromarketing specialist. You speak like a kind mentor or friend.

      TASK
      Generate ready-to-post Instagram content for the topic: "${params.topic}".
      ${params.manualScript ? `Base the content on this script: "${params.manualScript}"` : ""}
      ${params.context ? `Additional context: "${params.context}"` : ""}

      ${getAvatarPrompt(params.brandVoice)}

      ${params.brandVoice ? `
      BRAND VOICE DNA:
      - Tone: ${params.brandVoice.tone}
      - Examples: ${params.brandVoice.examples}
      ${params.brandVoice.productDetails ? `- Product Details: ${params.brandVoice.productDetails}` : ''}
      ${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? `- Brand Colors: ${params.brandVoice.colors.join(', ')}` : ''}
      - INSTRUCTION: Adopt this tone and style for the entire output.
      ` : ''}
      
      NEUROMARKETING STRATEGY
      - Primary Angle: ${params.postAngle}
      - Goal: Trigger a specific psychological response based on the angle (e.g., trust, curiosity, empathy).
      
      ${NEURODIGITAL_MARKETING_PRINCIPLES}

      TONE GUIDELINES
      - Simple: Use words a 10-year-old understands.
      - Friendly & Supportive: Speak like a kind mentor or friend.
      - Emotionally Warm: Focus on heart-to-heart connection.
      - Psychologically Uplifting: Focus on resilience and inner peace.
      - Language: ${params.language}

      OUTPUT REQUIREMENTS
      - Quote: Short, impactful, and warm (max 12 words).
      - Caption: Friendly, supportive, and engaging (max 60 words).
      - Hashtags: 10–15 relevant tags.
      - Visual Prompt: A detailed description for an AI image generator to create a background for this quote. 
        Style: Aesthetic & Minimalist, clean, high-end look, soft lighting, natural shadows. 
        Include subtle details like tiny hand-drawn symbols (leaf, sun, etc.) relevant to the quote.
        ${params.visualPromptHint ? `Incorporate this hint: "${params.visualPromptHint}"` : ""}

      Return the result as a structured JSON object.
    `;

    const textResponse = await generateWithFallback(ai, {
      contents: [{ parts: [{ text: textPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualPrompt: { type: Type.STRING }
          },
          required: ["quote", "caption", "hashtags", "visualPrompt"]
        }
      }
    }, TEXT_MODELS);

    const postData = JSON.parse(textResponse.text || "{}");

    // 2. Generate Image
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: postData.visualPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: params.dimension === '4:5' ? '4:5' : params.dimension === '9:16' ? '9:16' : '16:9',
        },
      },
    });

    let imageUrl = "";
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    return {
      ...postData,
      imageUrl,
      dimension: params.dimension,
      language: params.language,
      topic: params.topic
    };
  },

  async generateOmnichannelCampaign(params: {
    brandVoice: BrandVoice;
    productDetails?: string;
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      Act as an 50+ years experienced elite Neuromarketer and Direct Response Marketer, Funnel Architect, and Conversion Copywriter.
      You are part of a larger system. You MUST use the pre-existing Brand Voice DNA as the single source of truth.

      🧬 DATA SOURCE (CRITICAL)
      Extract all required data from Brand Voice DNA Module and Customer Avatar, including:
      - Core Offer / Product Details: ${params.productDetails || params.brandVoice.productDetails || 'Not provided'}
      - Target Audience: ${params.brandVoice.name} - ${params.brandVoice.description}
      - Pain Points / Fears: ${params.brandVoice.fears}
      - Desires / Dream Outcome: ${params.brandVoice.desires}
      - Jobs To Be Done: ${params.brandVoice.jobsToBeDone}
      - Brand Tone & Voice Style: ${params.brandVoice.tone}
      - Brand Examples: ${params.brandVoice.examples}
      - Vocabulary: ${params.brandVoice.vocabulary}
      - Psychological Triggers: ${params.brandVoice.psychologicalTriggers}

      🧠 CORE OBJECTIVE
      Generate a FULL CAMPAIGN FUNNEL with perfect Message Match Consistency.
      All assets must:
      - Follow ONE unified Big Idea
      - Use identical emotional triggers across all touchpoints
      - Maintain consistent tone, vocabulary, and positioning
      - Feel like one continuous conversation (not separate pieces)

      ⚙️ OUTPUT STRUCTURE
      1. 🔥 CORE CAMPAIGN FOUNDATION
      - Big Idea (derived from DNA)
      - Core Hook (emotion-driven)
      - Unique Mechanism (from DNA)
      - One-Line Promise
      - Messaging Pillars (3–5 consistent themes used everywhere)

      2. 📢 TOP-OF-FUNNEL ADS (3 Variations)
      For each ad:
      - Primary Text
      - Headline
      - Hook Type (pain / curiosity / benefit / urgency)
      - CTA
      ⚠️ All 3 ads must feel like variations of the SAME idea — not different angles.

      3. 🌐 LANDING PAGE (MESSAGE MATCH CRITICAL)
      - Headline (must directly match ad hook language)
      - Subheadline
      - Problem Amplification
      - Solution (aligned with DNA mechanism)
      - Benefits (aligned with messaging pillars)
      - Social Proof (contextual to audience)
      - Offer Breakdown
      - Objection Handling Section
      - Guarantee
      - CTA (repeated strategically)

      4. 📩 5-DAY EMAIL DRIP (NARRATIVE FLOW)
      - Day 1: Hook + Pain Awareness
      - Day 2: Story (aligned with audience identity)
      - Day 3: Value + Mechanism Explanation
      - Day 4: Objection Crushing
      - Day 5: Urgency + Conversion Push
      Each email must:
      - Continue same conversation from landing page
      - Reinforce same Big Idea
      - Use same tone and vocabulary from DNA

      5. 🔁 RETARGETING ADS (2 Variations)
      - Address specific objections from DNA
      - Reinforce missed value
      - Add urgency/scarcity
      - Maintain same hook language

      🔒 SYSTEM RULES (VERY IMPORTANT)
      - NEVER introduce new angles outside Brand Voice DNA
      - NEVER change tone between assets
      - NEVER break message continuity
      - Every line must feel like it's written by the same brand brain
      - Ensure smooth psychological journey: Ad → Landing → Email → Retargeting

      ⚡ OUTPUT STYLE
      - Clean, structured, ready-to-use campaign assets
      - No explanations
      - No repetition of instructions
      - High-conversion, emotionally engaging copy
      - Feels like a premium done-for-you funnel

      🧠 INTELLIGENCE LAYER (SECRET SAUCE)
      Before generating, internally:
      - Identify the strongest emotional driver from DNA
      - Select ONE dominant campaign angle
      - Build everything around that single idea

      Return the result as a structured JSON object.
    `;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreCampaignFoundation: {
              type: Type.OBJECT,
              properties: {
                bigIdea: { type: Type.STRING },
                coreHook: { type: Type.STRING },
                uniqueMechanism: { type: Type.STRING },
                oneLinePromise: { type: Type.STRING },
                messagingPillars: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["bigIdea", "coreHook", "uniqueMechanism", "oneLinePromise", "messagingPillars"]
            },
            topOfFunnelAds: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  primaryText: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  hookType: { type: Type.STRING },
                  cta: { type: Type.STRING }
                },
                required: ["primaryText", "headline", "hookType", "cta"]
              }
            },
            landingPage: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
                problemAmplification: { type: Type.STRING },
                solution: { type: Type.STRING },
                benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                socialProof: { type: Type.STRING },
                offerBreakdown: { type: Type.STRING },
                objectionHandling: { type: Type.STRING },
                guarantee: { type: Type.STRING },
                cta: { type: Type.STRING }
              },
              required: ["headline", "subheadline", "problemAmplification", "solution", "benefits", "socialProof", "offerBreakdown", "objectionHandling", "guarantee", "cta"]
            },
            emailDrip: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  theme: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  body: { type: Type.STRING }
                },
                required: ["day", "theme", "subject", "body"]
              }
            },
            retargetingAds: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  angle: { type: Type.STRING },
                  primaryText: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  cta: { type: Type.STRING }
                },
                required: ["angle", "primaryText", "headline", "cta"]
              }
            }
          },
          required: ["coreCampaignFoundation", "topOfFunnelAds", "landingPage", "emailDrip", "retargetingAds"]
        }
      }
    }, ["gemini-3.1-pro-preview", "gemini-3-flash-preview"]);

    return JSON.parse(response.text || "{}");
  },

  async critiqueCopy(params: {
    copyContent: string;
    targetAudience?: string;
    productDetails?: string;
    userApiKey?: string;
  }) {
    const ai = getAI(params.userApiKey);
    const prompt = `
      ROLE
      You are a 50+ year expert Digital Marketing Legend and Conversion Optimizer.
      
      TASK
      Critique the following marketing copy and provide a "Persuasion Score" (0-100) and 3 actionable improvement tips.
      
      COPY TO CRITIQUE:
      ${params.copyContent}
      
      CONTEXT:
      - Target Audience: ${params.targetAudience || 'General'}
      - Product: ${params.productDetails || 'Not specified'}
      
      Return as structured JSON.
      {
        "score": number,
        "critique": "Overall legend's assessment",
        "tips": ["Tip 1", "Tip 2", "Tip 3"],
        "complianceWarning": "Any potential ad platform compliance issues or 'None'"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            critique: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            complianceWarning: { type: Type.STRING }
          },
          required: ["score", "critique", "tips", "complianceWarning"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }
};
