import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, FileText, Globe, Link as LinkIcon, Hash, Type as TypeIcon, AlignLeft, Download, Save, Image as ImageIcon } from 'lucide-react';
import { downloadImage } from '../lib/utils';
import { BrandVoiceToggle } from './BrandVoiceToggle';

export function BlogGenerator() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'idle' | 'writing' | 'visualizing' | 'ready'>('idle');
  const [formData, setFormData] = useState({
    url: '',
    productDetails: '',
    targetLink: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    blogType: 'Review',
    wordCount: 1000
      });
  const [brandVoice, setBrandVoice] = useState<{ tone: string, examples: string } | null>(null);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
    
  React.useEffect(() => {
    const fetchBrandVoice = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice'));
        const data = userDoc.data();
        if (data) {
          setBrandVoice(data as any);
          setUseBrandVoice(true);
        }
      } catch (error) {
        console.error("Error fetching brand voice:", error);
      }
    };
    fetchBrandVoice();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setImages([]);
    setCurrentStep('writing');
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const blogData = await geminiService.generateBlog({
        ...formData,
        secondaryKeywords: formData.secondaryKeywords.split(',').map(k => k.trim()),
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
        userApiKey
      });
      
      let markdownText = blogData.markdown || "Failed to generate blog content.";
      if (markdownText.startsWith("```markdown")) {
        markdownText = markdownText.replace(/^```markdown\n?/, "").replace(/\n?```$/, "");
      }
      setResult(markdownText);
      
      if (blogData.imagePrompts && blogData.imagePrompts.length > 0) {
        setCurrentStep('visualizing');
        const generatedImages: string[] = [];
        let updatedMarkdown = markdownText;
        for (let i = 0; i < blogData.imagePrompts.length; i++) {
          const prompt = blogData.imagePrompts[i];
          try {
            const imageUrl = await geminiService.generateImage(prompt, userApiKey, "16:9");
            if (imageUrl) {
              generatedImages.push(imageUrl);
              updatedMarkdown = updatedMarkdown.replace(`[IMAGE_${i + 1}]`, `\n\n![Generated Image ${i + 1}](${imageUrl})\n\n`);
            }
          } catch (imgError) {
            console.error("Image generation failed:", imgError);
          }
          // Small delay to help with rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setImages(generatedImages);
        setResult(updatedMarkdown);
      }
      
      setCurrentStep('ready');
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("You have exceeded your Gemini API quota. Please check your plan or try again later.");
      } else {
        alert("Error generating blog. Check console.");
      }
    } finally {
      setLoading(false);
      if (currentStep !== 'ready') setCurrentStep('idle');
    }
  };

  const saveToLibrary = async () => {
    if (!result || !auth.currentUser) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'assets'), {
        userId: auth.currentUser.uid,
        type: 'blog',
        title: formData.primaryKeyword || 'Untitled Blog',
        content: { markdown: result }, // Removed images to avoid Firestore size limits
        metadata: { ...formData, imageCount: images.length },
        createdAt: serverTimestamp()
      });
      alert("Saved to library (metadata only)!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assets');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <FileText className="w-5 h-5 text-emerald-400" />
          Blog Configuration
          <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 animate-pulse">
            NEURODIGITAL ENGINE ACTIVE
          </span>
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Sales Page URL
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="https://example.com/product"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" /> Product Details
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-32 text-[var(--text-primary)]"
              placeholder="Paste product features, benefits, and details here..."
              value={formData.productDetails}
              onChange={e => setFormData({ ...formData, productDetails: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Target Link
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="Your target link"
              value={formData.targetLink}
              onChange={e => setFormData({ ...formData, targetLink: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Primary Keyword
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[var(--text-primary)]"
                placeholder="e.g. Best AI Tool"
                value={formData.primaryKeyword}
                onChange={e => setFormData({ ...formData, primaryKeyword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <TypeIcon className="w-4 h-4" /> Blog Type
              </label>
              <select
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[var(--text-primary)]"
                value={formData.blogType}
                onChange={e => setFormData({ ...formData, blogType: e.target.value })}
              >
                <option>Review</option>
                <option>Comparison</option>
                <option>Listicle</option>
                <option>How-to</option>
                <option>Problem/Solution</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Secondary Keywords (comma separated)</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[var(--text-primary)]"
              placeholder="keyword1, keyword2, keyword3"
              value={formData.secondaryKeywords}
              onChange={e => setFormData({ ...formData, secondaryKeywords: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 text-center">Word Count: {formData.wordCount}</label>
            <input
              type="range"
              min="1000"
              max="4000"
              step="1000"
              className="w-full h-2 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-emerald-600"
              value={formData.wordCount}
              onChange={e => setFormData({ ...formData, wordCount: parseInt(e.target.value) })}
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
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 neon-glow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {currentStep === 'writing' && 'Writing Blog...'}
                  {currentStep === 'visualizing' && 'Generating Visuals...'}
                </span>
              </>
            ) : 'Generate Neuro-Optimized Blog'}
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm min-h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Generated Content</h2>
          <div className="flex items-center gap-2">
            {result && (
              <>
                <button 
                  onClick={saveToLibrary}
                  disabled={saving}
                  className="p-2 hover:bg-emerald-950/50 rounded-lg transition-colors flex items-center gap-2 text-emerald-400 font-medium text-sm"
                  title="Save to Library"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([result], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'blog-article.md';
                    a.click();
                  }}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto prose prose-emerald max-w-none text-[var(--text-primary)] prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-a:no-underline">
          {result ? (
            <div className="space-y-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{result}</ReactMarkdown>
              
              {images.length > 0 && (
                <div className="pt-8 border-t border-[var(--border-color)]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                    Generated Visuals for Blog Sections
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden neon-border">
                        <img src={img || undefined} alt={`Blog visual ${idx + 1}`} className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => downloadImage(img, `blog-visual-${idx + 1}.png`)}
                          className="absolute bottom-4 right-4 p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-5 h-5 text-[var(--text-primary)]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
              <FileText className="w-16 h-16 opacity-20" />
              <p>Your optimized blog article will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
