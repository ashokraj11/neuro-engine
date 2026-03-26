import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { trackGeneratorClick } from '../utils/tracking';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Video, Play, Copy, Check, Download, Globe, AlignLeft, Sparkles, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandVoiceToggle } from './BrandVoiceToggle';
import { AudienceSelector } from './AudienceSelector';
import { AudienceType } from '../services/geminiService';

interface ReelScript {
  angle: string;
  hook: string;
  body: string;
  cta: string;
  visualInstructions: string;
}

export function ReelsGenerator() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [details, setDetails] = useState('');
  const [psychTrigger, setPsychTrigger] = useState('none');
  const [audienceType, setAudienceType] = useState<AudienceType>('none');
  const [scripts, setScripts] = useState<ReelScript[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [brandVoice, setBrandVoice] = useState<{ tone: string, examples: string } | null>(null);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
    
  React.useEffect(() => {
    const fetchBrandVoice = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice'));
      const data = userDoc.data();
      if (data) {
        setBrandVoice(data as any);
      }
    };
    fetchBrandVoice();
  }, []);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleGenerate = async () => {
    trackGeneratorClick('reels-generator');
    setLoading(true);
    setScripts([]);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const scriptData = await geminiService.generateReelScript({ 
        url, 
        productDetails: details, 
        userApiKey, 
        psychTrigger,
        audienceType,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined
      });
      setScripts(scriptData);
    } catch (error: any) {
      console.error(error);
      alert("Error generating reel scripts. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Video className="w-5 h-5 text-indigo-400" />
              Reels Script Factory
              <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold rounded-full border border-indigo-500/20 animate-pulse">
                10 ANGLES ACTIVE
              </span>
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Topic or URL
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[var(--text-primary)]"
                placeholder="e.g., 5 ways to improve focus"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Psychological Trigger
              </label>
              <select
                value={psychTrigger}
                onChange={e => setPsychTrigger(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[var(--text-primary)]"
              >
                <option value="none">Standard Optimization</option>
                <option value="loss-aversion">Loss Aversion</option>
                <option value="social-proof">Social Proof</option>
                <option value="authority">Authority</option>
                <option value="dopamine">Dopamine Loop</option>
                <option value="scarcity">Scarcity</option>
              </select>
            </div>

            <AudienceSelector
              value={audienceType}
              onChange={setAudienceType}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <AlignLeft className="w-4 h-4" /> Additional Context (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 text-[var(--text-primary)]"
                placeholder="Paste specific points or a manual script..."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>

            {auth.currentUser && (
              <BrandVoiceToggle
                enabled={useBrandVoice}
                onToggle={setUseBrandVoice}
                disabled={!brandVoice}
              />
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || (!url && !details)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 neon-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'Generating 10 Angles...' : 'Generate 10 Reel Scripts'}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm min-h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Generated Scripts</h2>
            {scripts.length > 0 && (
              <button 
                onClick={() => {
                  const fullText = scripts.map((s, i) => `ANGLE ${i+1}: ${s.angle}\nHOOK: ${s.hook}\nBODY: ${s.body}\nCTA: ${s.cta}\nVISUALS: ${s.visualInstructions}\n\n`).join('---\n\n');
                  navigator.clipboard.writeText(fullText);
                  alert("All scripts copied to clipboard!");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 neon-glow transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy All Scripts
              </button>
            )}
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[800px]">
            <AnimatePresence>
              {scripts.length > 0 ? (
                scripts.map((script, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-indigo-400 uppercase tracking-wider text-sm">
                          {script.angle}
                        </h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(`ANGLE: ${script.angle}\nHOOK: ${script.hook}\nBODY: ${script.body}\nCTA: ${script.cta}\nVISUALS: ${script.visualInstructions}`, idx)}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-indigo-400"
                      >
                        {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] block mb-1">The Hook (0-3s)</span>
                          <p className="text-[var(--text-primary)] font-medium italic border-l-2 border-indigo-600 pl-3">
                            "{script.hook}"
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] block mb-1">The Body (3-25s)</span>
                          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                            {script.body}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] block mb-1">The CTA (25-30s)</span>
                          <p className="text-indigo-400 font-bold">
                            {script.cta}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-indigo-500/10">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2">
                          <Target className="w-3 h-3" /> Visual Instructions
                        </span>
                        <p className="text-[var(--text-secondary)] text-xs leading-relaxed italic">
                          {script.visualInstructions}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4 py-20 opacity-30">
                  <Video className="w-24 h-24" />
                  <p className="font-medium">Your 10 viral reel scripts will appear here...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
