import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { trackGeneratorClick } from '../utils/tracking';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, Mail, Link as LinkIcon, Type as TypeIcon, Copy, Check, Sparkles } from 'lucide-react';
import { BrandVoiceToggle } from './BrandVoiceToggle';
import { AudienceSelector } from './AudienceSelector';
import { AudienceType } from '../services/geminiService';

export function EmailGenerator({ isAdmin }: { isAdmin?: boolean }) {
  const [formData, setFormData] = useState({
    url: '',
    productDetails: '',
    psychTrigger: 'none',
    audienceType: 'none' as AudienceType
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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
    trackGeneratorClick('email-generator');
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

      const emails = await geminiService.generateEmailSwipes({
        ...formData,
        userApiKey,
        brandVoice: useBrandVoice ? brandVoice : null,
        psychTrigger: formData.psychTrigger,
        audienceType: formData.audienceType
      });
      setResults(emails);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("You have exceeded your Gemini API quota. Please check your plan or try again later.");
      } else {
        alert("Error generating emails. Check console.");
      }
    } finally {
      setLoading(false);
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
          <Mail className="w-5 h-5 text-purple-500" />
          Email Swipe Generator
          <span className="ml-2 px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-bold rounded-full border border-purple-500/20 animate-pulse">
            NEURODIGITAL ENGINE ACTIVE
          </span>
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
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
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
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all h-32 text-[var(--text-primary)]"
              placeholder="Describe the product, target audience, and main offer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Psychological Trigger (Cognitive Bias)
            </label>
            <select
              value={formData.psychTrigger}
              onChange={(e) => setFormData({ ...formData, psychTrigger: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
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
            value={formData.audienceType}
            onChange={(val) => setFormData({ ...formData, audienceType: val })}
          />

          {isAdmin && brandVoice && (
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
                Generating Sequence...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Generate 10 Email Swipes
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
            results.map((email, idx) => (
              <div key={idx} className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] relative group">
                <button
                  onClick={() => copyToClipboard(`Subject: ${email.subject}\nPreview: ${email.previewText}\n\n${email.body}\n\nCTA: ${email.cta}`, idx)}
                  className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  title="Copy Email"
                >
                  {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                </button>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
                    {email.type}
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-bold text-[var(--text-secondary)]">Subject: </span>
                      <span className="font-medium text-[var(--text-primary)]">{email.subject}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-bold text-[var(--text-secondary)]">Preview: </span>
                      <span className="text-[var(--text-secondary)]">{email.previewText}</span>
                    </p>
                  </div>
                </div>
                
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)]">
                  <p className="text-sm whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">{email.body}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                  <p className="text-sm">
                    <span className="font-bold text-[var(--text-secondary)]">CTA: </span>
                    <span className="font-medium text-purple-600">{email.cta}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <Mail className="w-12 h-12 opacity-20" />
              <p>Your generated sequence will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
