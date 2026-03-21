import React, { useState } from 'react';
import { trackGeneratorClick } from '../utils/tracking';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Loader2, Share2, Type, Link as LinkIcon, Hash, Image as ImageIcon, Layout, Globe, Sparkles, Plus, Trash2, Download, Copy, Check, List, Target, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandVoiceToggle } from './BrandVoiceToggle';

type Post = {
  id?: string;
  topic: string;
  quote: string;
  caption: string;
  hashtags: string[];
  imageUrl: string;
  dimension: string;
  language: string;
};

export function SocialMediaPostGenerator() {
  const [mode, setMode] = useState<'bulk' | 'manual'>('bulk');
  const [formData, setFormData] = useState({
    sourceType: 'Topic',
    context: '',
    url: '',
    postAngle: 'Emotional Resonance',
    topicCount: 5,
    dimension: '4:5',
    language: 'English',
    manualTopic: '',
    manualScript: '',
    manualVisualHint: ''
  });

  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [brandVoice, setBrandVoice] = useState<{ tone: string, examples: string } | null>(null);
  const [useBrandVoice, setUseBrandVoice] = useState(false);

  const postAngles = [
    'Emotional Resonance (Mirror Neurons)',
    'Curiosity Gap (Information Gap)',
    'Social Proof (Bandwagon Effect)',
    'Authority & Expertise (Trust Signal)',
    'Scarcity & Urgency (FOMO)',
    'Loss Aversion (Pain Avoidance)',
    'Reciprocity (Value First)',
    'Paradox of Choice (Simplicity)',
    'Anchoring Effect (Comparison)',
    'Storytelling (Narrative Transport)'
  ];
  const dimensions = ['4:5', '9:16', '16:9'];
  const languages = ['English', 'Hindi'];

  React.useEffect(() => {
    const fetchBrandVoice = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'brandVoice'));
      const data = userDoc.data();
      if (data) {
        setBrandVoice(data as any);
      }
    };
    fetchBrandVoice();
  }, []);

  const handleFetchTopics = async () => {
    setLoadingTopics(true);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const topics = await geminiService.generateSocialMediaTopics({
        niche: 'Motivation',
        postAngle: formData.postAngle,
        context: formData.context || formData.url,
        count: formData.topicCount,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
        userApiKey
      });
      setSuggestedTopics(topics);
      setSelectedTopics(topics);
    } catch (error) {
      console.error(error);
      alert("Failed to generate topics.");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleGeneratePosts = async () => {
    trackGeneratorClick('social-media-post-generator');
    setLoadingPosts(true);
    setPosts([]);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      const topicsToProcess = mode === 'bulk' ? selectedTopics : [formData.manualTopic];
      const generatedPosts: Post[] = [];

      for (const topic of topicsToProcess) {
        const post = await geminiService.generateSocialMediaPost({
          topic,
          context: formData.context,
          manualScript: mode === 'manual' ? formData.manualScript : undefined,
          visualPromptHint: mode === 'manual' ? formData.manualVisualHint : undefined,
          dimension: formData.dimension,
          language: formData.language,
          postAngle: formData.postAngle,
          brandVoice: useBrandVoice ? brandVoice || undefined : undefined,
          userApiKey
        });
        generatedPosts.push(post);
      }
      setPosts(generatedPosts);
    } catch (error) {
      console.error(error);
      alert("Failed to generate posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const copyPost = (post: Post, index: number) => {
    const text = `Quote: ${post.quote}\n\nCaption: ${post.caption}\n\nHashtags: ${post.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Share2 className="w-5 h-5 text-cyan-500" />
              Social Media Post Generator
              <span className="ml-2 px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[10px] font-bold rounded-full border border-cyan-500/20 animate-pulse">
                NEURODIGITAL ENGINE ACTIVE
              </span>
            </h2>
            <div className="flex bg-[var(--bg-primary)] p-0.5 rounded-lg border border-[var(--border-color)]">
              <button
                onClick={() => setMode('bulk')}
                className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all ${mode === 'bulk' ? 'bg-cyan-500 text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Bulk
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all ${mode === 'manual' ? 'bg-cyan-500 text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Manual
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mode === 'bulk' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Post Angle
                    </label>
                    <select
                      value={formData.postAngle}
                      onChange={(e) => setFormData({ ...formData, postAngle: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[var(--text-primary)]"
                    >
                      {postAngles.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                      <List className="w-4 h-4" />
                      Topic Count
                    </label>
                    <select
                      value={formData.topicCount}
                      onChange={(e) => setFormData({ ...formData, topicCount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[var(--text-primary)]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} Topics</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Source URL or Context (Optional)
                  </label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none h-24 text-[var(--text-primary)]"
                    placeholder="Enter a URL or some context to guide topic generation..."
                  />
                </div>

                <button
                  onClick={handleFetchTopics}
                  disabled={loadingTopics}
                  className="w-full py-3 bg-[var(--bg-primary)] text-cyan-500 border border-cyan-500/30 rounded-xl font-bold hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingTopics ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Discover Topics
                </button>

                {suggestedTopics.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Select Topics for Generation:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {suggestedTopics.map((topic, idx) => (
                        <div 
                          key={idx}
                          onClick={() => toggleTopic(topic)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedTopics.includes(topic) ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                        >
                          <span className="text-sm">{topic}</span>
                          {selectedTopics.includes(topic) && <Check className="w-4 h-4" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={formData.manualTopic}
                    onChange={(e) => setFormData({ ...formData, manualTopic: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[var(--text-primary)]"
                    placeholder="e.g., The Power of Resilience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Script / Quote Base
                  </label>
                  <textarea
                    value={formData.manualScript}
                    onChange={(e) => setFormData({ ...formData, manualScript: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none h-24 text-[var(--text-primary)]"
                    placeholder="Enter your script or quote here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Visual Prompt Hint
                  </label>
                  <input
                    type="text"
                    value={formData.manualVisualHint}
                    onChange={(e) => setFormData({ ...formData, manualVisualHint: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[var(--text-primary)]"
                    placeholder="e.g., A peaceful mountain sunrise"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Dimensions
                </label>
                <select
                  value={formData.dimension}
                  onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[var(--text-primary)]"
                >
                  {dimensions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[var(--text-primary)]"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
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
              onClick={handleGeneratePosts}
              disabled={loadingPosts || (mode === 'bulk' && selectedTopics.length === 0) || (mode === 'manual' && !formData.manualTopic)}
              className="w-full py-4 bg-cyan-500 text-black rounded-xl font-bold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
            >
              {loadingPosts ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {mode === 'bulk' ? `Generate ${selectedTopics.length} Posts` : 'Generate Post'}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm flex flex-col min-h-[600px]">
          <h2 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">Generated Content</h2>
          
          <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            {loadingPosts ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
                <p className="animate-pulse font-medium">Creating your visual masterpieces...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Post #{idx + 1}</span>
                    <div className="flex gap-2">
                      <button onClick={() => copyPost(post, idx)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                        {copied === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-xl bg-black aspect-[4/5] max-w-[320px] mx-auto shadow-2xl">
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt="Generated Visual" 
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                      <p className="text-white font-serif italic text-xl leading-relaxed drop-shadow-lg">
                        "{post.quote}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Caption</p>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{post.caption}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Hashtags</p>
                      <p className="text-xs text-cyan-500 font-medium">{post.hashtags.join(' ')}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4 opacity-50">
                <ImageIcon className="w-16 h-16" />
                <p>No posts generated yet. Configure and click Generate.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
