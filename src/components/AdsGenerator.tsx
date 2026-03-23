import React, { useState, useEffect } from 'react';
import { trackGeneratorClick } from '../utils/tracking';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, Megaphone, Globe, AlignLeft, Copy, Check, Sparkles, Image as ImageIcon, Video, ThumbsUp, MessageCircle, Share2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadImage } from '../lib/utils';
import { BrandVoiceToggle } from './BrandVoiceToggle';
import { AudienceSelector } from './AudienceSelector';
import { AudienceType } from '../services/geminiService';

interface AdSet {
  angle: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  imagePrompt: string;
  frameworkLogic: string;
  imageUrl?: string;
}

export function AdsGenerator({ isAdmin }: { isAdmin?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [details, setDetails] = useState('');
  const [psychTrigger, setPsychTrigger] = useState('none');
  const [audienceType, setAudienceType] = useState<AudienceType>('none');
  const [ads, setAds] = useState<AdSet[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [mode, setMode] = useState<'full' | 'summary'>('full');
  const [style, setStyle] = useState<'lifestyle' | 'ugc' | '3d-cartoon' | 'minimalist' | 'bold'>('lifestyle');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('1:1');
  const [currentStep, setCurrentStep] = useState<'idle' | 'copywriting' | 'generating_images' | 'ready'>('idle');
  const [brandVoice, setBrandVoice] = useState<any>(null);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
    
  useEffect(() => {
    const fetchBrandVoice = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBrandVoice(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching brand voice:", error);
      }
    };
    fetchBrandVoice();
  }, []);

  const handleGenerate = async () => {
    trackGeneratorClick('ads-generator');
    setLoading(true);
    setAds([]);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      setCurrentStep('copywriting');
      const result = await geminiService.generateAds({ 
        url, 
        productDetails: details, 
        userApiKey, 
        mode, 
        style, 
        aspectRatio,
        psychTrigger,
        audienceType,
        brandVoice: useBrandVoice ? brandVoice : null
      });
      setAds(result);

      setCurrentStep('generating_images');
      const adsWithImages: AdSet[] = [];
      for (const ad of result) {
        try {
          const imageUrl = await geminiService.generateImage(ad.imagePrompt, userApiKey, aspectRatio) || undefined;
          adsWithImages.push({ ...ad, imageUrl });
        } catch (imgError) {
          console.error("Image generation failed for an ad:", imgError);
          adsWithImages.push({ ...ad }); // Push without image if it fails
        }
        // Small delay to help with rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setAds(adsWithImages);
      setCurrentStep('ready');
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("You have exceeded your Gemini API quota. Please check your plan or try again later.");
      } else {
        alert("Error generating ads. Check console.");
      }
    } finally {
      setLoading(false);
      if (currentStep !== 'ready') setCurrentStep('idle');
    }
  };

  const copyToClipboard = (text: string, promptId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(promptId);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
            <Megaphone className="w-5 h-5 text-orange-400" />
            Ads Configuration
            <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-full border border-orange-500/20 animate-pulse">
              NEURODIGITAL ENGINE ACTIVE
            </span>
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Sales Page URL
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-orange-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://example.com/product"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" /> Psychological Trigger (Cognitive Bias)
            </label>
            <select
              value={psychTrigger}
              onChange={e => setPsychTrigger(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-orange-500 outline-none transition-all text-[var(--text-primary)]"
            >
              <option value="none">Standard Neuro-Digital Optimization</option>
              <option value="loss-aversion">Loss Aversion (Fear of Missing Out)</option>
              <option value="social-proof">Social Proof (Bandwagon Effect)</option>
              <option value="authority">Authority (Expert Influence)</option>
              <option value="dopamine">Dopamine Loop (Curiosity & Reward)</option>
              <option value="scarcity">Scarcity (Urgency & Exclusive Access)</option>
            </select>
          </div>

          <AudienceSelector
            value={audienceType}
            onChange={setAudienceType}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" /> Product Details
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-orange-500 outline-none transition-all h-48 text-[var(--text-primary)]"
              placeholder="Paste product features, benefits, and target audience details..."
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Mode</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm" value={mode} onChange={e => setMode(e.target.value as any)}>
                  <option value="full">Full Ad Suite</option>
                  <option value="summary">Product Summary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Aspect Ratio</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)}>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="9:16">9:16 (Story)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['lifestyle', 'ugc', '3d-cartoon', 'minimalist', 'bold'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium capitalize border ${style === s ? 'bg-orange-600 text-white border-orange-600' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {isAdmin && brandVoice && (
              <BrandVoiceToggle
                enabled={useBrandVoice}
                onToggle={setUseBrandVoice}
              />
            )}

            

            <button
              onClick={handleGenerate}
              disabled={loading || (!url && !details)}
              className="w-full py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 neon-glow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {currentStep === 'copywriting' && 'Brainstorming strategy...'}
                    {currentStep === 'generating_images' && 'Generating creatives...'}
                  </span>
                </>
              ) : 'Generate Ad Suite'}
            </button>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[800px] pr-2">
        <AnimatePresence mode="popLayout">
              {ads.length > 0 ? (
            ads.map((ad, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[var(--bg-secondary)] rounded-2xl neon-border overflow-hidden relative group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
                
                {/* Top Bar */}
                <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]">
                  <span className="px-3 py-1 bg-orange-950/50 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Angle: {ad.angle}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(`${ad.headline}\n\n${ad.primaryText}`, `ad-${idx}`)}
                    className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                  >
                    {copiedPrompt === `ad-${idx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                  </button>
                </div>

                {/* FB Ad Mockup */}
                <div className="p-6 bg-[var(--bg-primary)]">
                  <div className="max-w-md mx-auto border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm bg-[var(--bg-secondary)]">
                    {/* Header */}
                    <div className="p-3 flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-950/50 rounded-full flex items-center justify-center text-orange-400 font-bold">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight text-[var(--text-primary)]">Your Brand</p>
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">Sponsored • <Globe className="w-3 h-3" /></p>
                      </div>
                    </div>

                    {/* Primary Text */}
                    <div className="px-3 pb-3 text-sm whitespace-pre-wrap text-[var(--text-secondary)]">
                      {ad.primaryText}
                    </div>

                    {/* Image */}
                    <div className="w-full aspect-square bg-[var(--bg-primary)] relative border-y border-[var(--border-color)]">
                      {ad.imageUrl ? (
                        <>
                          <img src={ad.imageUrl || undefined} alt="Ad Creative" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => downloadImage(ad.imageUrl!, `ad-${idx}.png`)}
                            className="absolute bottom-2 right-2 p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-sm rounded-full hover:bg-[var(--bg-primary)] transition-colors"
                          >
                            <Download className="w-4 h-4 text-[var(--text-primary)]" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="text-xs font-medium">Generating Image...</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-[var(--bg-primary)] flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mb-0.5">WWW.YOURWEBSITE.COM</p>
                        <p className="font-bold text-sm leading-tight mb-1 text-[var(--text-primary)]">{ad.headline}</p>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{ad.description}</p>
                      </div>
                      <button className="px-4 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-bold rounded-lg transition-colors whitespace-nowrap">
                        {ad.cta}
                      </button>
                    </div>
                    
                    {/* Engagement Bar */}
                    <div className="px-4 py-2 border-t border-[var(--border-color)] flex items-center justify-between text-[var(--text-secondary)]">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
                          <ThumbsUp className="w-4 h-4" /> <span className="text-xs font-medium">Like</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
                          <MessageCircle className="w-4 h-4" /> <span className="text-xs font-medium">Comment</span>
                        </button>
                      </div>
                      <button className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
                        <Share2 className="w-4 h-4" /> <span className="text-xs font-medium">Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prompts Section */}
                <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex flex-col gap-4">
                  <div className="relative group/prompt">
                    <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Framework Logic</span>
                    </p>
                    <p className="text-[12px] text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--bg-secondary)] p-3 rounded-lg">{ad.frameworkLogic}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 relative group/prompt">
                      <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image Prompt</span>
                        <button 
                          onClick={() => copyToClipboard(ad.imagePrompt, `image-${idx}`)}
                          className="opacity-0 group-hover/prompt:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-secondary)] rounded"
                        >
                          {copiedPrompt === `image-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-[var(--text-secondary)]" />}
                        </button>
                      </p>
                      <p className="text-[12px] text-[var(--text-secondary)] font-medium leading-relaxed">{ad.imagePrompt}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-[var(--bg-secondary)] p-12 rounded-2xl neon-border flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <Megaphone className="w-16 h-16 opacity-20" />
              <p className="text-center max-w-[280px]">Enter product details to generate high-converting Facebook ad copies.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
