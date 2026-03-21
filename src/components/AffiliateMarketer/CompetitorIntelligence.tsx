import React, { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Loader2, Wand2, Save, Copy, Check, Crosshair, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandVoiceToggle } from '../BrandVoiceToggle';

export function CompetitorIntelligence() {
  const [formData, setFormData] = useState({
    competitorUrl: '',
    competitorCopy: ''
      });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [brandVoice, setBrandVoice] = useState<{ tone: string, examples: string } | null>(null);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
    
  React.useEffect(() => {
    const fetchBrandVoice = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBrandVoice(docSnap.data() as any);
          setUseBrandVoice(true);
        }
      } catch (error) {
        console.error("Error fetching brand voice:", error);
      }
    };
    fetchBrandVoice();
  }, []);

  const handleGenerate = async () => {
    if (!formData.competitorUrl && !formData.competitorCopy) {
      alert("Please provide either a competitor URL or ad copy.");
      return;
    }
    setLoading(true);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const data = await geminiService.generateCompetitorCounterStrategy({
        ...formData,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
        userApiKey
      });
      setResult(data);
    } catch (error: any) {
      console.error(error);
      alert("Error generating counter-strategy. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!auth.currentUser || !result) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'assets'), {
        userId: auth.currentUser.uid,
        type: 'competitor-strategy',
        title: `Counter-Strategy: ${formData.competitorUrl || 'Custom Copy'}`,
        content: result,
        metadata: formData,
        createdAt: serverTimestamp()
      });
      alert("Saved to library!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assets');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <Crosshair className="w-5 h-5 text-rose-500" />
          Competitor "Counter-Strategy" Intelligence
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Competitor URL (Optional)
            </label>
            <input
              type="url"
              value={formData.competitorUrl}
              onChange={(e) => setFormData({ ...formData, competitorUrl: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://competitor.com/landing-page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Competitor Ad Copy / Text (Optional)
            </label>
            <textarea
              value={formData.competitorCopy}
              onChange={(e) => setFormData({ ...formData, competitorCopy: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="Paste their ad copy, email, or sales page text here..."
              rows={6}
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
            className="w-full py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            Analyze & Generate Counter-Offer
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Counter-Strategy</h2>
          {result && (
            <button onClick={saveToLibrary} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm font-bold">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Strategy'}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Competitor Analysis */}
              <div className="p-5 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-4">
                <h3 className="font-bold text-rose-400 flex items-center gap-2">
                  <Crosshair className="w-4 h-4" /> Competitor Analysis
                </h3>
                
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Their Main Hook</h4>
                  <p className="text-sm text-[var(--text-secondary)] italic">"{result.analysis.mainHook}"</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Weaknesses / Gaps</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {result.analysis.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)]">{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">What They Missed</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {result.analysis.missedOpportunities.map((m: string, i: number) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)]">{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Counter-Offers */}
              <div className="space-y-4">
                <h3 className="font-bold text-[var(--text-primary)]">Superior Counter-Offers</h3>
                {result.counterOffers.map((offer: any, index: number) => (
                  <div key={index} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl relative group">
                    <button
                      onClick={() => copyToClipboard(`Headline: ${offer.headline}\nAngle: ${offer.angle}\nWhy it wins: ${offer.whyItWins}`, `offer-${index}`)}
                      className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                    >
                      {copied === `offer-${index}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                    </button>
                    
                    <h4 className="font-bold text-rose-500 mb-2 pr-10">{offer.headline}</h4>
                    <p className="text-sm text-[var(--text-primary)] mb-3"><span className="font-semibold text-[var(--text-secondary)]">Angle:</span> {offer.angle}</p>
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
                      <p className="text-sm text-emerald-400"><span className="font-semibold">Why it wins:</span> {offer.whyItWins}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Counter-Ad Copy */}
              <div className="space-y-4">
                <h3 className="font-bold text-[var(--text-primary)]">Counter-Ad Copy</h3>
                <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl relative group">
                  <button
                    onClick={() => copyToClipboard(result.counterAdCopy, 'ad-copy')}
                    className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  >
                    {copied === 'ad-copy' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                  </button>
                  <p className="text-sm whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed pr-10">{result.counterAdCopy}</p>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <FileText className="w-12 h-12 opacity-20" />
              <p className="text-center max-w-xs">Paste competitor details to generate a superior counter-strategy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
