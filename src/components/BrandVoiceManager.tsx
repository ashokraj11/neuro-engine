import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Save, Mic, Brain, UserCircle, Upload, Link as LinkIcon, Palette, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

export function BrandVoiceManager() {
  const [voiceData, setVoiceData] = useState({
    examples: '',
    tone: '',
    productDetails: '',
    logoUrl: '',
    colors: ['', '', ''],
    name: '',
    description: '',
    fears: '',
    desires: '',
    jobsToBeDone: '',
    vocabulary: '',
    psychologicalTriggers: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoice = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVoiceData(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching brand voice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVoice();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice'), {
        ...voiceData,
        updatedAt: serverTimestamp()
      });
      alert("Brand Voice saved successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/settings/brandVoice');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoiceData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...voiceData.colors];
    newColors[index] = value;
    setVoiceData(prev => ({ ...prev, colors: newColors }));
  };

  const handleGenerate = async () => {
    if (!voiceData.description) {
      setError("Please provide a brief description of your target audience first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a 50+ years Expert in Digital Marketing and Psychology. 
        Based on this target audience description: "${voiceData.description}", 
        generate a comprehensive 360-degree Customer Avatar persona.
        
        Include:
        1. A catchy Persona Name.
        2. Deep-seated Fears (What keeps them up at night?).
        3. Secret Desires (What do they truly want but rarely admit?).
        4. "Jobs to be Done" (What specific outcomes are they trying to achieve?).
        5. Specific Vocabulary (What words, slang, or industry jargon do they use?).
        6. Psychological Triggers (What emotional hooks work best on them?).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              fears: { type: Type.STRING },
              desires: { type: Type.STRING },
              jobsToBeDone: { type: Type.STRING },
              vocabulary: { type: Type.STRING },
              psychologicalTriggers: { type: Type.STRING },
            },
            required: ["name", "fears", "desires", "jobsToBeDone", "vocabulary", "psychologicalTriggers"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setVoiceData(prev => ({
        ...prev,
        ...result
      }));
    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to generate avatar. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-secondary)] p-8 rounded-2xl neon-border shadow-sm space-y-6"
      >
        <h2 className="text-2xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
          <Brain className="w-7 h-7 text-cyan-500" />
          Brand Voice DNA
        </h2>
        <p className="text-[var(--text-secondary)]">
          Upload your best-performing content and define your tone. Our AI will analyze this to ensure all future generations sound exactly like your brand.
        </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Product Details or URL
                </label>
                <textarea
                  value={voiceData.productDetails || ''}
                  onChange={(e) => setVoiceData({ ...voiceData, productDetails: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-[var(--text-primary)]"
                  placeholder="Describe your product or paste your website URL..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Brand Logo
                </label>
                <div className="flex items-center gap-4">
                  {voiceData.logoUrl && (
                    <div className="w-16 h-16 rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-primary)] flex-shrink-0">
                      <img src={voiceData.logoUrl} alt="Brand Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] border-dashed rounded-xl hover:border-cyan-500 transition-all flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-cyan-500">
                      <Upload className="w-5 h-5" />
                      <span>{voiceData.logoUrl ? 'Change Logo' : 'Upload Logo (PNG, JPG)'}</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Brand Colors (Hex Codes)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={voiceData.colors?.[index] || '#000000'}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={voiceData.colors?.[index] || ''}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          placeholder="#000000"
                          className="w-full px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-[var(--text-primary)] text-sm uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Tone Description (e.g., Professional, Witty, Authoritative)
                </label>
                <input
                  type="text"
                  value={voiceData.tone}
                  onChange={(e) => setVoiceData({ ...voiceData, tone: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-[var(--text-primary)]"
                  placeholder="e.g., Professional, Witty, Authoritative"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Best-Performing Content Examples (Paste your best emails, ads, or landing pages)
                </label>
                <textarea
                  value={voiceData.examples}
                  onChange={(e) => setVoiceData({ ...voiceData, examples: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-[var(--text-primary)]"
                  placeholder="Paste your best content here..."
                  rows={10}
                />
              </div>

          <div className="pt-8 border-t border-[var(--border-color)]">
            <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--text-primary)] mb-6">
              <UserCircle className="w-6 h-6 text-purple-500" />
              Customer Avatar DNA
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Target Audience Description (Who are you trying to reach?)
                  </label>
                  <textarea
                    value={voiceData.description || ''}
                    onChange={(e) => setVoiceData({ ...voiceData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[var(--text-primary)]"
                    placeholder="e.g., Small business owners struggling with social media management..."
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {generating ? 'Generating Persona...' : 'Generate 360° Persona'}
                </button>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Persona Name
                  </label>
                  <input
                    type="text"
                    value={voiceData.name || ''}
                    onChange={(e) => setVoiceData({ ...voiceData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[var(--text-primary)] font-bold"
                    placeholder="e.g., Struggling Solopreneur Sam"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Deep-Seated Fears
                    </label>
                    <textarea
                      value={voiceData.fears || ''}
                      onChange={(e) => setVoiceData({ ...voiceData, fears: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[var(--text-primary)] text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Secret Desires
                    </label>
                    <textarea
                      value={voiceData.desires || ''}
                      onChange={(e) => setVoiceData({ ...voiceData, desires: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[var(--text-primary)] text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Jobs to be Done
                </label>
                <textarea
                  value={voiceData.jobsToBeDone || ''}
                  onChange={(e) => setVoiceData({ ...voiceData, jobsToBeDone: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[var(--text-primary)] text-sm"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Specific Vocabulary
                </label>
                <textarea
                  value={voiceData.vocabulary || ''}
                  onChange={(e) => setVoiceData({ ...voiceData, vocabulary: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[var(--text-primary)] text-sm"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Psychological Triggers
                </label>
                <textarea
                  value={voiceData.psychologicalTriggers || ''}
                  onChange={(e) => setVoiceData({ ...voiceData, psychologicalTriggers: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-[var(--text-primary)] text-sm"
                  rows={5}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Brand Voice & Avatar DNA
          </button>
        </div>
      </motion.div>
    </div>
  );
}
