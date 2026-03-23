import React, { useState } from 'react';
import { trackGeneratorClick } from '../../utils/tracking';
import { geminiService } from '../../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Loader2, Wand2, Copy, Check, FileText, Download, Layout, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandVoiceToggle } from '../BrandVoiceToggle';
import { AudienceSelector } from '../AudienceSelector';
import { AudienceType } from '../../services/geminiService';
import { bridgePageTemplates } from '../../utils/htmlTemplates';

export function BridgePageGenerator() {
  const [formData, setFormData] = useState({
    offerUrl: '',
    productDetails: '',
    targetAudience: '',
    psychTrigger: 'none',
    audienceType: 'none' as AudienceType
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [brandVoice, setBrandVoice] = useState<{ tone: string, examples: string } | null>(null);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [framework, setFramework] = useState('PAS (Problem-Agitate-Solve)');
  const [critique, setCritique] = useState<any>(null);
  const [critiquing, setCritiquing] = useState(false);
    
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

  const handleGenerate = async () => {
    trackGeneratorClick('bridge-page-generator');
    if (!formData.offerUrl && !formData.productDetails) {
      alert("Please provide either an offer URL or product details.");
      return;
    }
    setLoading(true);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const data = await geminiService.generateBridgePage({
        ...formData,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
        framework,
        psychTrigger: formData.psychTrigger,
        audienceType: formData.audienceType,
        userApiKey
      });
      setResult(data);
      setCritique(null);
    } catch (error: any) {
      console.error(error);
      alert("Error generating bridge page. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToHtml = () => {
    if (!result) return;
    const htmlContent = bridgePageTemplates[layoutIndex](result);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bridge-page-${layoutIndex + 1}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCritique = async () => {
    if (!result) return;
    setCritiquing(true);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }
      const data = await geminiService.critiqueCopy({
        copyContent: JSON.stringify(result),
        targetAudience: formData.targetAudience,
        productDetails: formData.productDetails,
        userApiKey
      });
      setCritique(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCritiquing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <Wand2 className="w-5 h-5 text-pink-500" />
          Bridge Page Generator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              Offer URL (Optional)
            </label>
            <input
              type="url"
              value={formData.offerUrl}
              onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://example.com/affiliate-offer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              Product Details (Optional)
            </label>
            <textarea
              value={formData.productDetails}
              onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="Describe the product and its key benefits..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="e.g., Busy moms looking to save time"
            />
          </div>

          <AudienceSelector
            value={formData.audienceType}
            onChange={(val) => setFormData({ ...formData, audienceType: val })}
          />

          {auth.currentUser && (
            <BrandVoiceToggle
              enabled={useBrandVoice}
              onToggle={setUseBrandVoice}
              disabled={!brandVoice}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" /> Psychological Trigger (Cognitive Bias)
            </label>
            <select
              value={formData.psychTrigger}
              onChange={(e) => setFormData({ ...formData, psychTrigger: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-[var(--text-primary)]"
            >
              <option value="none">Standard Neuro-Digital Optimization</option>
              <option value="loss-aversion">Loss Aversion (Fear of Missing Out)</option>
              <option value="social-proof">Social Proof (Bandwagon Effect)</option>
              <option value="authority">Authority (Expert Influence)</option>
              <option value="dopamine">Dopamine Loop (Curiosity & Reward)</option>
              <option value="scarcity">Scarcity (Urgency & Exclusive Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              Marketing Framework
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-[var(--text-primary)]"
            >
              <option value="PAS (Problem-Agitate-Solve)">PAS (Problem-Agitate-Solve)</option>
              <option value="AIDA (Attention-Interest-Desire-Action)">AIDA (Attention-Interest-Desire-Action)</option>
              <option value="BAB (Before-After-Bridge)">BAB (Before-After-Bridge)</option>
              <option value="The 'Cliffhanger' Story">The 'Cliffhanger' Story</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            Generate Bridge Page
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Results Preview</h2>
          {result && (
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  onClick={exportToHtml}
                  className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-xs font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition-colors text-xs font-medium"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
              <div className="flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-color)]">
                {['Modern', 'Clean', 'Bold', 'Sketch', 'Tech'].map((name, idx) => (
                  <button
                    key={name}
                    onClick={() => setLayoutIndex(idx)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                      layoutIndex === idx
                        ? 'bg-pink-500 text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 pt-2 custom-scrollbar">
          {result ? (
            <div className="space-y-6">
              {critique && (
                <div className="p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/30 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Expert Critique
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-black text-indigo-400">{critique.score}</div>
                      <div className="text-[10px] text-indigo-400/60 font-medium uppercase tracking-wider">Score</div>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-200 italic mb-3">"{critique.critique}"</p>
                  <div className="space-y-1">
                    {critique.tips.map((tip: string, i: number) => (
                      <div key={i} className="text-[10px] text-indigo-300 flex items-start gap-1">
                        <span className="font-bold text-indigo-500">•</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                  {critique.complianceWarning !== 'None' && (
                    <div className="mt-3 p-2 bg-amber-900/20 rounded border border-amber-500/30 text-[10px] text-amber-400 font-medium">
                      ⚠️ Compliance: {critique.complianceWarning}
                    </div>
                  )}
                </div>
              )}

              {!critique && (
                <button
                  onClick={handleCritique}
                  disabled={critiquing}
                  className="w-full py-2 mb-6 bg-indigo-900/20 text-indigo-300 rounded-lg border border-indigo-500/30 text-xs font-bold hover:bg-indigo-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {critiquing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Get Legend's Feedback & Score
                </button>
              )}

              <div className="prose prose-invert max-w-none">
                <h3 className="text-pink-400">{result.headline}</h3>
                <p>{result.story}</p>
                <h4 className="text-pink-300">The Gap</h4>
                <p>{result.gap}</p>
                <h4 className="text-pink-300">The Bridge</h4>
                <p>{result.bridge}</p>
                <div className="mt-6 p-4 bg-pink-900/20 border border-pink-500/30 rounded-xl text-center">
                  <button className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all">
                    {result.cta}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <FileText className="w-12 h-12 opacity-20" />
              <p>Your bridge page will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
