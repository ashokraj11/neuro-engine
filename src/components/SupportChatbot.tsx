import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Loader2, Bot, User, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

const SYSTEM_INSTRUCTION = `You are "Neuro Engine Guide", an expert AI assistant for the Neuro Engine AI application. 
Your goal is to help users understand how to use the platform to its full potential.

Neuro Engine AI is an AI-powered marketing architect and asset generator using neuromarketing and SEO strategies.

Key Modules & Features:
1. Dashboard: Central hub to view saved assets and latest updates (Courses, Tools, Blogs).
2. Blog Generator: Creates SEO-optimized articles using neuromarketing triggers.
3. Reels Generator: Automates short-form video scripts with AI voiceover and scene descriptions.
4. Ads Generator: Creates high-converting Facebook/Instagram ad copies and image/video prompts.
5. Email Generator: Generates multi-day email sequences (Welcome, Launch, Re-engagement).
6. WhatsApp Generator: Creates WhatsApp marketing messages with visual asset suggestions.
7. Landing Page Generator: Builds high-converting landing page copy (Hero, Problem, Solution, Benefits, CTA).
8. Sales Funnel Generator: Designs strategic funnel flows (AIDA, PAS frameworks).
9. Niche Generator: Helps refine target niches and build detailed buyer personas.
10. Lead Magnet Generator: Creates structured ebooks, guides, or checklists.
11. Omnichannel Campaign: Generates a full campaign with consistent messaging across all platforms.
12. Bridge Page: Creates pre-sell pages specifically for affiliate marketing.
13. Offer Angle Intelligence: Reverse-engineers successful offers to find winning angles.
14. Ad Policy Checker: Scans copy for platform compliance issues.
15. Competitor Intelligence: Analyzes competitor hooks and generates counter-offers.
16. Brand Voice Manager: Allows users to define their unique tone and style for AI consistency.
17. Learning & Resources: Contains expert-led video courses, marketing tools, templates, and blogs.

Guidelines for your responses:
- Be helpful, professional, and encouraging.
- If a user asks "How do I [task]?", explain which module to use and the basic steps.
- Use neuromarketing terminology where appropriate (e.g., "dopamine loops", "loss aversion", "social proof").
- Keep responses concise but informative.
- If you don't know something specific about a user's account data, explain that you are a general guide for the application's features.
- Encourage users to explore the "Learning & Resources" section for deeper marketing strategy.

Always maintain the persona of a sophisticated marketing architect.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Neuro Engine Guide. How can I help you architect your marketing success today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a bit of trouble connecting to my neural network. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100",
          "bg-cyan-500 text-black"
        )}
      >
        <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
        <HelpCircle className="w-6 h-6 relative z-10" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Need Help?
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-zinc-900 neon-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-800/50 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Bot className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Neuro Engine Guide</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    msg.role === 'user' ? "bg-zinc-800" : "bg-cyan-500/10 border border-cyan-500/20"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-cyan-500 text-black font-medium rounded-tr-none" 
                      : "bg-zinc-800 text-zinc-100 rounded-tl-none border border-white/5"
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="bg-zinc-800 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-800/30 border-t border-white/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about Neuro Engine..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:hover:bg-cyan-500"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="mt-2 text-[10px] text-center text-zinc-500 font-medium uppercase tracking-widest">
                Powered by Neuro Engine AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
