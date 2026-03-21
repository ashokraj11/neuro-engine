import React, { useState, useEffect } from 'react';
import { trackGeneratorClick } from '../utils/tracking';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, MessageSquare, Link as LinkIcon, Type as TypeIcon, Copy, Check, ImageIcon } from 'lucide-react';
import { BrandVoiceToggle } from './BrandVoiceToggle';
import { motion } from 'motion/react';

export function WhatsappGenerator() {
  const [formData, setFormData] = useState({
    url: '',
    productDetails: ''
      });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
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
    trackGeneratorClick('whatsapp-generator');
    if (!formData.productDetails && !formData.url) {
      alert("Please provide either a URL or Product Details.");
      return;
    }
    setLoading(true);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const swipes = await geminiService.generateWhatsappSwipes({
        ...formData,
        userApiKey,
        brandVoice: useBrandVoice ? brandVoice : null
      });
      setResults(swipes);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("You have exceeded your Gemini API quota. Please check your plan or try again later.");
      } else {
        alert("Error generating WhatsApp swipes. Check console.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (idx: number, prompt: string) => {
    setGeneratingImages(prev => ({ ...prev, [idx]: true }));
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }
      const imageUrl = await geminiService.generateImage(prompt, userApiKey);
      if (imageUrl) {
        setResults(prev => {
          const newResults = [...prev];
          newResults[idx] = { ...newResults[idx], imageUrl };
          return newResults;
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image.");
    } finally {
      setGeneratingImages(prev => ({ ...prev, [idx]: false }));
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          WhatsApp Swipe Generator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Sales Page URL (Optional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <TypeIcon className="w-4 h-4" />
              Product Details & Offer
            </label>
            <textarea
              value={formData.productDetails}
              onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-32 text-[var(--text-primary)]"
              placeholder="Describe the product, target audience, and main offer..."
            />
          </div>

          {brandVoice && (
            <BrandVoiceToggle
              enabled={useBrandVoice}
              onToggle={setUseBrandVoice}
            />
          )}

          

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating 10 Swipes...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" />
                Generate 10 WhatsApp Swipes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[700px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Generated 10-Part Sequence</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {results.length > 0 ? (
            results.map((swipe, idx) => (
              <div key={idx} className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] relative group">
                <button
                  onClick={() => copyToClipboard(swipe.text, idx)}
                  className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  title="Copy Text"
                >
                  {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                </button>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
                    {swipe.type}
                  </span>
                </div>
                
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)] mb-4">
                  <p className="text-sm whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">{swipe.text}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Visual Asset</span>
                    {!swipe.imageUrl && (
                      <button
                        onClick={() => generateImage(idx, swipe.imagePrompt)}
                        disabled={generatingImages[idx]}
                        className="flex items-center gap-2 text-xs font-bold text-cyan-500 hover:text-cyan-600 transition-colors disabled:opacity-50"
                      >
                        {generatingImages[idx] ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                        Generate Image
                      </button>
                    )}
                  </div>
                  
                  {swipe.imageUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden border border-[var(--border-color)] relative group/img">
                      <img src={swipe.imageUrl} alt="Visual hook" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => generateImage(idx, swipe.imagePrompt)}
                          className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg hover:bg-cyan-500 hover:text-white transition-all"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--text-secondary)] p-4 text-center">
                      <p className="text-[10px] italic mb-2">"{swipe.imagePrompt}"</p>
                      <p className="text-[10px] opacity-50">Click generate to create this visual</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p>Your generated sequence will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
