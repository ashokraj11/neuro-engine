import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, LayoutTemplate, Link as LinkIcon, TypeIcon, Copy, Check, Eye, Download, X, Layout } from 'lucide-react';
import { BrandVoiceToggle } from './BrandVoiceToggle';
import { landingPageTemplates } from '../utils/htmlTemplates';

export function LandingPageGenerator() {
  const [formData, setFormData] = useState({
    url: '',
    productDetails: ''
      });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [framework, setFramework] = useState('AIDA (Attention-Interest-Desire-Action)');
  const [critique, setCritique] = useState<any>(null);
  const [critiquing, setCritiquing] = useState(false);
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

  const themes = [
    {
      name: 'Cyberpunk Neon',
      primary: '#ff00ff',
      secondary: '#00ffff',
      bg: '#050505',
      accent: '#6366f1',
      font: 'Plus Jakarta Sans'
    },
    {
      name: 'Emerald Aurora',
      primary: '#10b981',
      secondary: '#3b82f6',
      bg: '#020617',
      accent: '#06b6d4',
      font: 'Plus Jakarta Sans'
    },
    {
      name: 'Midnight Gold',
      primary: '#f59e0b',
      secondary: '#1e3a8a',
      bg: '#0f172a',
      accent: '#fbbf24',
      font: 'Plus Jakarta Sans'
    },
    {
      name: 'Solar Flare',
      primary: '#f43f5e',
      secondary: '#fb923c',
      bg: '#18181b',
      accent: '#ef4444',
      font: 'Plus Jakarta Sans'
    }
  ];

  const handleGenerate = async () => {
    trackGeneratorClick('landing-page-generator');
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

      const landingPage = await geminiService.generateLandingPage({
        ...formData,
        userApiKey,
        brandVoice: useBrandVoice ? brandVoice : null,
        framework
      });
      setResult(landingPage);
      setCritique(null);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("You have exceeded your Gemini API quota. Please check your plan or try again later.");
      } else {
        alert("Error generating landing page. Check console.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setThemeIndex((prev) => (prev + 1) % themes.length);
    handleGenerate();
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `
Pre-Headline: ${result.preHeadline}
Hero Headline: ${result.heroHeadline}
Hero Subheadline: ${result.heroSubheadline}
VSL Hook: ${result.vslHook}
Hero CTA: ${result.heroCTA}

Problem Agitation:
${result.problemAgitation}

Solution Presentation:
${result.solutionPresentation}

Key Benefits:
${result.keyBenefits.map((b: string) => `- ${b}`).join('\n')}

Testimonials:
${result.testimonials.map((t: any) => `"${t.quote}" - ${t.name}, ${t.role}`).join('\n\n')}

Scarcity: ${result.scarcityMessage}
Final CTA: ${result.finalCTA}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateHtml = () => {
    if (!result) return '';
    const theme = themes[themeIndex];
    return landingPageTemplates[layoutIndex](result, theme);
  };

  const downloadAsHtml = () => {
    const html = generateHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landing-page-layout-${layoutIndex + 1}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          <LayoutTemplate className="w-5 h-5 text-blue-500" />
          Landing Page Generator
          <span className="ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full border border-blue-500/20 animate-pulse">
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
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
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
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32 text-[var(--text-primary)]"
              placeholder="Describe the product, target audience, and main offer..."
            />
          </div>

          {brandVoice && (
            <BrandVoiceToggle
              enabled={useBrandVoice}
              onToggle={setUseBrandVoice}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Marketing Framework
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[var(--text-primary)]"
            >
              <option>AIDA (Attention-Interest-Desire-Action)</option>
              <option>PAS (Problem-Agitation-Solution)</option>
              <option>BAB (Before-After-Bridge)</option>
              <option>The "Cliffhanger" Story Framework</option>
              <option>Quest Framework (Targeted for High Ticket)</option>
            </select>
          </div>

          

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <LayoutTemplate className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
            >
              Next Design
              <span className="text-xs opacity-60">({themes[themeIndex].name})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Generated Copy</h2>
          {result && (
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleCritique}
                  disabled={critiquing}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold hover:from-amber-600 hover:to-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-200/20 disabled:opacity-50"
                >
                  {critiquing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  Get Legend's Feedback & Score
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-blue-500 border border-[var(--border-color)] rounded-lg transition-colors text-xs font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              <button
                onClick={downloadAsHtml}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-emerald-500 border border-[var(--border-color)] rounded-lg transition-colors text-xs font-medium"
              >
                <Download className="w-4 h-4" />
                Download HTML
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
              {['Modern', 'Editorial', 'VSL Focus', 'Grid', 'Minimal'].map((name, idx) => (
                <button
                  key={name}
                  onClick={() => setLayoutIndex(idx)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                    layoutIndex === idx
                      ? 'bg-indigo-600 text-white'
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
          {critique && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-amber-500/30 shadow-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-2xl font-black text-black border-4 border-amber-200">
                    {critique.persuasionScore}
                  </div>
                  <div>
                    <h3 className="text-amber-500 font-black text-lg uppercase tracking-tighter">Legend's Persuasion Score</h3>
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Digital Marketing Expert Analysis</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest">
                  High Performance Audit
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    The Assessment
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{critique.critique}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <h4 className="text-emerald-400 font-bold text-xs mb-2 uppercase tracking-widest">Actionable Tips</h4>
                    <ul className="space-y-2">
                      {critique.tips.map((tip: string, i: number) => (
                        <li key={i} className="text-gray-300 text-xs flex gap-2">
                          <span className="text-emerald-500 font-bold">→</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
                    <h4 className="text-rose-400 font-bold text-xs mb-2 uppercase tracking-widest">Compliance Warnings</h4>
                    <ul className="space-y-2">
                      {critique.complianceWarnings.map((warning: string, i: number) => (
                        <li key={i} className="text-gray-300 text-xs flex gap-2">
                          <span className="text-rose-500 font-bold">!</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  Pre-Headline
                </span>
                <p className="text-sm font-bold text-indigo-500 mb-2 uppercase tracking-widest">{result.preHeadline}</p>
                
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  Main Headline
                </span>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{result.heroHeadline}</h1>
                <p className="text-lg text-[var(--text-secondary)] mb-4">{result.heroSubheadline}</p>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                    VSL Hook
                  </span>
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-400 italic">"{result.vslHook}"</p>
                  </div>
                </div>

                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg">{result.heroCTA}</button>
              </div>

              {/* Problem Agitation */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  Problem Agitation
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{result.problemAgitation}</p>
              </div>

              {/* Solution Presentation */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  Solution Presentation
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">{result.solutionPresentation}</p>
              </div>

              {/* Key Benefits */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  Key Benefits
                </span>
                <ul className="list-disc pl-5 space-y-2 text-[var(--text-primary)]">
                  {result.keyBenefits.map((benefit: string, idx: number) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>

              {/* Testimonials */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  Social Proof
                </span>
                <div className="space-y-4">
                  {result.testimonials.map((testimonial: any, idx: number) => (
                    <div key={idx} className="bg-[var(--bg-secondary)] p-4 rounded-lg italic text-[var(--text-secondary)]">
                      "{testimonial.quote}"
                      <div className="mt-2 font-semibold text-[var(--text-primary)] not-italic">
                        - {testimonial.name}, <span className="font-normal">{testimonial.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final CTA */}
              <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] text-center">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                    Scarcity Message
                  </span>
                  <p className="text-red-500 font-bold">🚨 {result.scarcityMessage}</p>
                </div>
                
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  Final CTA
                </span>
                <div className="mt-2">
                  <button className="px-8 py-4 bg-black text-white font-bold rounded-xl text-lg w-full md:w-auto">
                    {result.finalCTA}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <LayoutTemplate className="w-12 h-12 opacity-20" />
              <p>Your generated landing page copy will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Landing Page Preview</h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded">Desktop View</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadAsHtml}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-bold shadow-lg shadow-indigo-200"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8">
              <div className="max-w-[1000px] mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
                <iframe
                  title="Preview"
                  srcDoc={generateHtml()}
                  className="w-full h-[2000px] border-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

