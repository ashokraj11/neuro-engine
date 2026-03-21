import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Loader2, Wand2, Save, Copy, Check, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function OmnichannelCampaignGenerator() {
  const [formData, setFormData] = useState({
    productDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        alert("You must be logged in.");
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userApiKey = userDoc.data()?.customApiKey;

      const brandVoiceDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice'));
      const brandVoice = brandVoiceDoc.exists() ? brandVoiceDoc.data() : null;

      if (!brandVoice || !brandVoice.name || !brandVoice.tone) {
        alert("Please complete your Brand Voice DNA (including Customer Avatar) first.");
        setLoading(false);
        return;
      }

      const data = await geminiService.generateOmnichannelCampaign({
        brandVoice: brandVoice as any,
        productDetails: formData.productDetails,
        userApiKey,
      });
      setResult(data);
    } catch (error: any) {
      console.error(error);
      alert("Error generating campaign. Check console.");
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
        type: 'omnichannel',
        title: `Campaign: ${result.coreCampaignFoundation?.bigIdea?.substring(0, 30)}...`,
        content: result,
        metadata: { generatedAt: new Date().toISOString() },
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl neon-border shadow-sm text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Layers className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Campaign Generator</h2>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-8">
          Generate a full campaign funnel with perfect message match consistency. 
          This tool uses your existing Brand Voice DNA and Customer Avatar to build 
          a cohesive campaign across ads, landing pages, and emails.
        </p>

        <div className="max-w-xl mx-auto mb-8">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 text-left">
            Product Details & Offer
          </label>
          <textarea
            value={formData.productDetails}
            onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32 text-[var(--text-primary)] text-sm"
            placeholder="Describe the product, main offer, and any specific angles you want to emphasize..."
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mx-auto text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Orchestrating Campaign...
            </>
          ) : (
            <>
              <Wand2 className="w-6 h-6" />
              Generate Full Funnel
            </>
          )}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] p-8 rounded-2xl neon-border shadow-sm space-y-8"
        >
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-6">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Layers className="w-6 h-6 text-indigo-500" />
              Your Campaign
            </h3>
            <button
              onClick={saveToLibrary}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600/20 text-cyan-500 hover:bg-cyan-600/30 rounded-xl transition-colors font-medium border border-cyan-500/30"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Campaign
            </button>
          </div>

          <div className="space-y-12">
            {/* Core Campaign Foundation */}
            <section>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">1</span>
                Core Campaign Foundation
              </h4>
              <div className="grid gap-4 bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)]">
                <div><span className="font-bold text-[var(--text-secondary)]">Big Idea:</span> <span className="text-[var(--text-primary)]">{result.coreCampaignFoundation?.bigIdea}</span></div>
                <div><span className="font-bold text-[var(--text-secondary)]">Core Hook:</span> <span className="text-[var(--text-primary)]">{result.coreCampaignFoundation?.coreHook}</span></div>
                <div><span className="font-bold text-[var(--text-secondary)]">Unique Mechanism:</span> <span className="text-[var(--text-primary)]">{result.coreCampaignFoundation?.uniqueMechanism}</span></div>
                <div><span className="font-bold text-[var(--text-secondary)]">One-Line Promise:</span> <span className="text-[var(--text-primary)]">{result.coreCampaignFoundation?.oneLinePromise}</span></div>
                <div>
                  <span className="font-bold text-[var(--text-secondary)]">Messaging Pillars:</span>
                  <ul className="list-disc pl-5 mt-2 text-[var(--text-primary)]">
                    {result.coreCampaignFoundation?.messagingPillars?.map((pillar: string, i: number) => <li key={i}>{pillar}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            {/* Top-of-Funnel Ads */}
            <section>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">2</span>
                Top-of-Funnel Ads
              </h4>
              <div className="grid gap-6">
                {result.topOfFunnelAds?.map((ad: any, i: number) => (
                  <div key={i} className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] relative group">
                    <button
                      onClick={() => copyToClipboard(ad.primaryText, `ad-${i}`)}
                      className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-colors border border-[var(--border-color)]"
                      title="Copy Ad Copy"
                    >
                      {copied === `ad-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <div className="mb-4"><span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{ad.hookType} Hook</span></div>
                    <div className="space-y-4">
                      <div><span className="font-bold text-[var(--text-secondary)] text-sm">Headline:</span> <p className="text-lg font-bold text-[var(--text-primary)]">{ad.headline}</p></div>
                      <div><span className="font-bold text-[var(--text-secondary)] text-sm">Primary Text:</span> <p className="text-[var(--text-primary)] whitespace-pre-wrap mt-1">{ad.primaryText}</p></div>
                      <div><span className="font-bold text-[var(--text-secondary)] text-sm">CTA:</span> <p className="text-[var(--text-primary)] font-medium">{ad.cta}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Landing Page */}
            <section>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">3</span>
                Landing Page Copy
              </h4>
              <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] relative">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result.landingPage, null, 2), 'landing')}
                  className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-colors border border-[var(--border-color)]"
                >
                  {copied === 'landing' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="space-y-6">
                  <div className="text-center pb-6 border-b border-[var(--border-color)]">
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4">{result.landingPage?.headline}</h1>
                    <h2 className="text-xl text-[var(--text-secondary)]">{result.landingPage?.subheadline}</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-rose-500 mb-2 uppercase tracking-wider text-sm">The Problem</h3>
                      <p className="text-[var(--text-primary)] whitespace-pre-wrap">{result.landingPage?.problemAmplification}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-500 mb-2 uppercase tracking-wider text-sm">The Solution</h3>
                      <p className="text-[var(--text-primary)] whitespace-pre-wrap">{result.landingPage?.solution}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[var(--text-secondary)] mb-3">Key Benefits:</h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {result.landingPage?.benefits?.map((benefit: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-[var(--text-primary)]">
                          <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[var(--bg-secondary)] p-6 rounded-xl">
                    <h3 className="font-bold text-[var(--text-secondary)] mb-2">The Offer:</h3>
                    <p className="text-[var(--text-primary)]">{result.landingPage?.offerBreakdown}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/20">
                      <h3 className="font-bold text-rose-500 mb-2">Objection Handling:</h3>
                      <p className="text-[var(--text-primary)] text-sm">{result.landingPage?.objectionHandling}</p>
                    </div>
                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                      <h3 className="font-bold text-emerald-500 mb-2">Guarantee:</h3>
                      <p className="text-[var(--text-primary)] text-sm">{result.landingPage?.guarantee}</p>
                    </div>
                  </div>

                  <div className="text-center pt-6 border-t border-[var(--border-color)]">
                    <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-lg shadow-lg">
                      {result.landingPage?.cta}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Email Drip */}
            <section>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">4</span>
                5-Day Email Drip
              </h4>
              <div className="space-y-6">
                {result.emailDrip?.map((email: any, i: number) => (
                  <div key={i} className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] relative group">
                    <button
                      onClick={() => copyToClipboard(email.body, `email-${i}`)}
                      className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-colors border border-[var(--border-color)]"
                    >
                      {copied === `email-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="bg-indigo-500/20 text-indigo-400 font-bold px-3 py-1 rounded-lg text-sm">Day {email.day}</span>
                      <span className="text-[var(--text-secondary)] text-sm uppercase tracking-wider">{email.theme}</span>
                    </div>
                    <div className="space-y-4">
                      <div><span className="font-bold text-[var(--text-secondary)] text-sm">Subject:</span> <p className="text-lg font-bold text-[var(--text-primary)]">{email.subject}</p></div>
                      <div>
                        <span className="font-bold text-[var(--text-secondary)] text-sm">Body:</span> 
                        <div className="text-[var(--text-primary)] mt-2 prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{email.body}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Retargeting Ads */}
            <section>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">5</span>
                Retargeting Ads
              </h4>
              <div className="grid gap-6">
                {result.retargetingAds?.map((ad: any, i: number) => (
                  <div key={i} className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-color)] relative group">
                    <button
                      onClick={() => copyToClipboard(ad.primaryText, `retarget-${i}`)}
                      className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-cyan-500/20 hover:text-cyan-500 transition-colors border border-[var(--border-color)]"
                    >
                      {copied === `retarget-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <div className="mb-4"><span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">{ad.angle}</span></div>
                    <div className="space-y-4">
                      <div><span className="font-bold text-[var(--text-secondary)] text-sm">Headline:</span> <p className="text-lg font-bold text-[var(--text-primary)]">{ad.headline}</p></div>
                      <div><span className="font-bold text-[var(--text-secondary)] text-sm">Primary Text:</span> <p className="text-[var(--text-primary)] whitespace-pre-wrap mt-1">{ad.primaryText}</p></div>
                      <div><span className="font-bold text-[var(--text-secondary)] text-sm">CTA:</span> <p className="text-[var(--text-primary)] font-medium">{ad.cta}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      )}
    </div>
  );
}
