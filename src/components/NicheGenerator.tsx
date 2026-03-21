import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Loader2, Target, Users, Save, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { BrandVoiceToggle } from './BrandVoiceToggle';

export function NicheGenerator() {
  const [formData, setFormData] = useState({
    url: '',
    productDetails: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
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
    if (!formData.url && !formData.productDetails) {
      alert("Please provide either a URL or product details.");
      return;
    }
    setLoading(true);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const data = await geminiService.generateNicheAndPersona({
        ...formData,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
        userApiKey,
      });
      setResult(data);
    } catch (error: any) {
      console.error(error);
      alert("Error generating niche and persona. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!result || !auth.currentUser) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'assets'), {
        userId: auth.currentUser.uid,
        type: 'niche-persona',
        title: formData.url.substring(0, 30) || 'Niche & Persona',
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

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <Target className="w-5 h-5 text-cyan-500" />
          Niche & Persona Generator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              Sales Page URL (Optional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://example.com/product"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              Product Details (Optional)
            </label>
            <textarea
              value={formData.productDetails}
              onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="Describe your product, target audience, and unique selling points..."
              rows={4}
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
            className="w-full py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
            Generate Niche & Persona
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Results Preview</h2>
          {result && (
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition-colors text-xs font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
              <button
                onClick={saveToLibrary}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 pt-2 custom-scrollbar">
          {result ? (
            <div className="prose prose-invert max-w-none">
              <h3 className="text-cyan-400">Niche: {result.niche}</h3>
              <h4 className="text-cyan-300">Sub-niche: {result.subNiche}</h4>
              <h3 className="text-cyan-400 mt-4">Buyer Persona</h3>
              <p><strong>Demographics:</strong> {result.buyerPersona.demographics}</p>
              <p><strong>Psychographics:</strong> {result.buyerPersona.psychographics}</p>
              <h4 className="text-cyan-300">Pain Points</h4>
              <ul>{result.buyerPersona.painPoints.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
              <h4 className="text-cyan-300">Goals</h4>
              <ul>{result.buyerPersona.goals.map((g: string, i: number) => <li key={i}>{g}</li>)}</ul>
              <h4 className="text-cyan-300">Buying Triggers</h4>
              <ul>{result.buyerPersona.buyingTriggers.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <Users className="w-12 h-12 opacity-20" />
              <p>Your niche and persona will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
