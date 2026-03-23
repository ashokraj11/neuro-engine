import React, { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Loader2, Wand2, Copy, Check, ShieldCheck, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandVoiceToggle } from '../BrandVoiceToggle';

export function AdPolicyChecker() {
  const [formData, setFormData] = useState({
    adCopy: '',
    landingPageUrl: ''
      });
  const [loading, setLoading] = useState(false);
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
        }
      } catch (error) {
        console.error("Error fetching brand voice:", error);
      }
    };
    fetchBrandVoice();
  }, []);

  const handleCheck = async () => {
    if (!formData.adCopy && !formData.landingPageUrl) {
      alert("Please provide either ad copy or a landing page URL.");
      return;
    }
    setLoading(true);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const data = await geminiService.checkAdPolicy({
        ...formData,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
        userApiKey
      });
      setResult(data);
    } catch (error: any) {
      console.error(error);
      alert("Error checking ad policy. Check console.");
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

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-[var(--text-primary)]';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          Ad Policy Compliance Checker
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Ad Copy (Optional)
            </label>
            <textarea
              value={formData.adCopy}
              onChange={(e) => setFormData({ ...formData, adCopy: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="Paste your ad copy here..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Landing Page URL (Optional)
            </label>
            <input
              type="url"
              value={formData.landingPageUrl}
              onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://example.com/landing-page"
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
            onClick={handleCheck}
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            Check Compliance
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Compliance Report</h2>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          {result ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <span className={`text-lg font-bold ${result.status === 'Compliant' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {result.status}
                </span>
                <span className={`text-sm font-medium ${getRiskColor(result.riskLevel)}`}>
                  Risk: {result.riskLevel}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-[var(--text-primary)]">Potential Issues</h3>
                <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-1">
                  {result.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-[var(--text-primary)]">Recommendations</h3>
                <ul className="list-decimal list-inside text-sm text-[var(--text-secondary)] space-y-1">
                  {result.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition-colors text-sm font-medium">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <FileText className="w-12 h-12 opacity-20" />
              <p>Your compliance report will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
