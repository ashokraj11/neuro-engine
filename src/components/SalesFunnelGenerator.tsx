import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, Funnel, Link as LinkIcon, TypeIcon, Save, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { BrandVoiceToggle } from './BrandVoiceToggle';

export function SalesFunnelGenerator() {
  const [formData, setFormData] = useState({
    url: '',
    productDetails: '',
    funnelType: 'Lead Generation'
      });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
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
          setUseBrandVoice(true);
        }
      } catch (error) {
        console.error("Error fetching brand voice:", error);
      }
    };
    fetchBrandVoice();
  }, []);

  const funnelTypes = [
    'Lead Generation', 
    'Webinar', 
    'Product Launch', 
    'High-Ticket Application', 
    'E-commerce',
    'Self-Liquidating Offer (SLO)',
    'Challenge Funnel',
    'Membership/Subscription',
    'Tripwire Funnel'
  ];

  const handleGenerate = async () => {
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

      const funnel = await geminiService.generateSalesFunnel({
        ...formData,
        userApiKey,
        brandVoice: useBrandVoice ? brandVoice : null
      });
      setResult(funnel);
    } catch (error: any) {
      console.error(error);
      alert("Error generating sales funnel. Check console.");
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
        type: 'sales-funnel',
        title: formData.productDetails.substring(0, 30) || 'Sales Funnel',
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
          <Funnel className="w-5 h-5 text-amber-500" />
          Sales Funnel Generator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Source URL (Optional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <TypeIcon className="w-4 h-4" />
              Product Details
            </label>
            <textarea
              value={formData.productDetails}
              onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all h-32 text-[var(--text-primary)]"
              placeholder="Describe your product and offer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Funnel Type</label>
            <select
              value={formData.funnelType}
              onChange={(e) => setFormData({ ...formData, funnelType: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-[var(--text-primary)]"
            >
              {funnelTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
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
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Funnel className="w-5 h-5" />}
            Generate Funnel
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Funnel Preview</h2>
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
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Funnel Stages</h3>
                <div className="space-y-4">
                  {result.funnelStages?.map((stage: any, index: number) => (
                    <div key={index} className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)]">
                      <h4 className="font-semibold text-amber-500">{stage.stage}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{stage.description}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-2 italic">Trigger: {stage.neuromarketingTrigger}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Copy Hooks</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-[var(--text-secondary)]">
                  {result.copyHooks?.map((hook: string, index: number) => (
                    <li key={index}>{hook}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Offer Strategy</h3>
                <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)]">
                  {result.offerStrategy}
                </p>
              </section>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <Funnel className="w-12 h-12 opacity-20" />
              <p>Your sales funnel will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
