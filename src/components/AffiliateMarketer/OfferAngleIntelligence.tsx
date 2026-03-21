import React, { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Loader2, Wand2, Save, Copy, Check, Lightbulb, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandVoiceToggle } from '../BrandVoiceToggle';

export function OfferAngleIntelligence() {
  const [formData, setFormData] = useState({
    offerUrl: '',
    productDetails: ''
      });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<number | null>(null);
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

      const data = await geminiService.generateOfferAngles({
        ...formData,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
        userApiKey
      });
      setResult(data);
    } catch (error: any) {
      console.error(error);
      alert("Error generating offer angles. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const saveToLibrary = async (angle: any) => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'assets'), {
        userId: auth.currentUser.uid,
        type: 'offer-angle',
        title: angle.title,
        content: angle,
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Offer Angle Intelligence
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Offer URL (Optional)
            </label>
            <input
              type="url"
              value={formData.offerUrl}
              onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://example.com/affiliate-offer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Product Details (Optional)
            </label>
            <textarea
              value={formData.productDetails}
              onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="Describe the product and its key benefits..."
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
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            Generate Angles
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Generated Angles</h2>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
          {result ? (
            result.angles.map((angle: any, index: number) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-amber-400">{angle.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(angle.hook, index)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      {copied === index ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => saveToLibrary(angle)} disabled={saving} className="text-[var(--text-secondary)] hover:text-emerald-500">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{angle.description}</p>
                <div className="p-3 bg-amber-900/10 rounded-lg border border-amber-500/20">
                  <p className="text-sm font-medium text-[var(--text-primary)] italic">"{angle.hook}"</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Target: {angle.targetAudience}</p>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <FileText className="w-12 h-12 opacity-20" />
              <p>Your offer angles will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
