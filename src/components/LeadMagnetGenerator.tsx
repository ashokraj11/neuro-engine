import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, BookOpen, Link as LinkIcon, TypeIcon, Save, Copy, Check, Eye, Download, X, List, Target, Ruler } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { BrandVoiceToggle } from './BrandVoiceToggle';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function LeadMagnetGenerator() {
  const [formData, setFormData] = useState({
    url: '',
    productDetails: '',
    guideType: 'Ultimate Guide',
    length: 'Medium',
    monetizationGoal: 'Email Capture'
      });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showReader, setShowReader] = useState(false);
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

  const ebookRef = useRef<HTMLDivElement>(null);

  const guideTypes = ['Beginner Guide', 'Playbook', 'Checklist', 'Framework', 'Ultimate Guide'];
  const lengths = ['Short', 'Medium', 'Long'];
  const goals = [
    'Email Capture', 
    'Authority Building', 
    'Product Funnel', 
    'Course Pre-sell',
    'Webinar Registration',
    'Consultation Booking',
    'Free Trial Signup',
    'Community Join',
    'Affiliate Sale',
    'Brand Awareness',
    'Customer Retention',
    'Upsell/Cross-sell',
    'High-Ticket Application',
    'Newsletter Subscription',
    'Event Attendance',
    'Feedback/Survey Completion'
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

      const leadMagnet = await geminiService.generateLeadMagnet({
        ...formData,
        userApiKey,
        brandVoice: useBrandVoice ? brandVoice : null
      });
      setResult(leadMagnet);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("You have exceeded your Gemini API quota. Please check your plan or try again later.");
      } else {
        alert("Error generating lead magnet. Check console.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!result || !auth.currentUser) return;
    setSaving(true);
    try {
      // Truncate content to avoid Firestore size limits
      const truncatedContent = {
        ...result,
        content: result.content.substring(0, 500000) + (result.content.length > 500000 ? '... [Truncated]' : '')
      };

      await addDoc(collection(db, 'assets'), {
        userId: auth.currentUser.uid,
        type: 'lead-magnet',
        title: result.titles[0] || 'Lead Magnet Guide',
        content: truncatedContent,
        metadata: formData,
        createdAt: serverTimestamp()
      });
      alert("Saved to library (content may be truncated if too large)!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assets');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = () => {
    if (!result || !ebookRef.current) return;
    
    const element = ebookRef.current;
    const opt = {
      margin: 15,
      filename: `${result.titles[0].replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Lead Magnet Generator
          <span className="ml-2 px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-bold rounded-full border border-purple-500/20 animate-pulse">
            NEURODIGITAL ENGINE ACTIVE
          </span>
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
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <TypeIcon className="w-4 h-4" />
              Topic & Audience Details
            </label>
            <textarea
              value={formData.productDetails}
              onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all h-32 text-[var(--text-primary)]"
              placeholder="Describe the topic, target audience, and their main pain points..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <List className="w-4 h-4" />
                Guide Type
              </label>
              <select
                value={formData.guideType}
                onChange={(e) => setFormData({ ...formData, guideType: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
              >
                {guideTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Length
              </label>
              <select
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
              >
                {lengths.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goal
              </label>
              <select
                value={formData.monetizationGoal}
                onChange={(e) => setFormData({ ...formData, monetizationGoal: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
              >
                {goals.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
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
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating High-Value Guide...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Generate Lead Magnet
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Guide Preview</h2>
          {result && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowReader(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-purple-500 border border-[var(--border-color)] rounded-lg transition-colors text-xs font-medium"
              >
                <Eye className="w-4 h-4" />
                Reader View
              </button>
              <button
                onClick={downloadAsPDF}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-emerald-500 border border-[var(--border-color)] rounded-lg transition-colors text-xs font-medium"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
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
              {/* Titles Section */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-purple-500 mb-4 uppercase tracking-widest">Magnetic Titles</h3>
                <div className="space-y-2">
                  {result.titles.map((title: string, idx: number) => (
                    <div key={idx} className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] font-medium">
                      {title}
                    </div>
                  ))}
                </div>
              </div>

              {/* Outline Section */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-widest">Strategic Outline</h3>
                <div className="space-y-4">
                  {result.outline.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)]">{item.chapter}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-emerald-500 mb-4 uppercase tracking-widest">Content Preview</h3>
                <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.content.substring(0, 1000) + '...'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p>Your high-value lead magnet will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {showReader && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col relative shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{result.titles[0]}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{formData.guideType} • {formData.length} Length</p>
                  </div>
                </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadAsPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-bold shadow-lg shadow-purple-200"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowReader(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50 p-8 md:p-12">
              <div ref={ebookRef} className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-12 border border-gray-100">
                <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-600 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded">
                  <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">{result.titles[0]}</h1>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.content}
                  </ReactMarkdown>
                </div>
                
                <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">End of Guide • {result.ctaStrategy}</p>
                </div>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
