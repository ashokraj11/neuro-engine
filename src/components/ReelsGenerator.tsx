import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { trackGeneratorClick } from '../utils/tracking';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { compileVideo } from '../lib/videoCompiler';
import { Loader2, Video, Play, Music, Type, Image as ImageIcon, Download, Globe, AlignLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadImage } from '../lib/utils';
import { BrandVoiceToggle } from './BrandVoiceToggle';
import { AudienceSelector } from './AudienceSelector';
import { AudienceType } from '../services/geminiService';

interface Scene {
  scene: string;
  visualPrompt: string;
  voiceover: string;
  caption: string;
  imageUrl?: string;
  audioUrl?: string;
}

export function ReelsGenerator() {
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [url, setUrl] = useState('');
  const [details, setDetails] = useState('');
  const [psychTrigger, setPsychTrigger] = useState('none');
  const [audienceType, setAudienceType] = useState<AudienceType>('none');
  const [sceneCount, setSceneCount] = useState(5);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentStep, setCurrentStep] = useState<'idle' | 'scripting' | 'visualizing' | 'voicing' | 'ready'>('idle');
  const [progress, setProgress] = useState(0);
  const [brandVoice, setBrandVoice] = useState<{ tone: string, examples: string } | null>(null);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
    
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

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const videoBlob = await compileVideo(scenes);
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reel.mp4';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Compilation failed:", error);
      alert("Video compilation failed. Please try again.");
    } finally {
      setCompiling(false);
    }
  };

  const handleGenerate = async () => {
    trackGeneratorClick('reels-generator');
    // Check for API key selection if using paid models
    if (typeof window !== 'undefined' && window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // After opening, we assume they might have selected or we just let them try again
        // The platform handles the injection
      }
    }

    setLoading(true);
    setScenes([]);
    setProgress(0);
    try {
      let userApiKey: string | undefined;
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        userApiKey = userDoc.data()?.customApiKey;
      }

      // Step 1: Scripting
      setCurrentStep('scripting');
      setProgress(10);
      const sceneData = await geminiService.generateReelScript({ 
        url, 
        productDetails: details, 
        userApiKey, 
        sceneCount,
        psychTrigger,
        audienceType,
        brandVoice: useBrandVoice ? brandVoice || undefined : undefined
      });
      setScenes(sceneData);
      setProgress(30);

      // Step 2: AI Visualization
      setCurrentStep('visualizing');
      const visualizedScenes: Scene[] = [];
      for (let i = 0; i < sceneData.length; i++) {
        const s = sceneData[i];
        try {
          const imageUrl = await geminiService.generateImage(s.visualPrompt, userApiKey, "9:16") || undefined;
          visualizedScenes.push({ ...s, imageUrl });
        } catch (imgError: any) {
          console.error("Image generation failed:", imgError);
          // If it's a permission error specifically for the selected key
          if (imgError?.message?.includes('Requested entity was not found')) {
             if (window.aistudio) await window.aistudio.openSelectKey();
          }
          visualizedScenes.push({ ...s });
        }
        setProgress(30 + ((i + 1) / sceneData.length) * 40);
      }
      setScenes(visualizedScenes);

      // Step 3: Voicing
      setCurrentStep('voicing');
      const finalScenes: Scene[] = [];
      for (let i = 0; i < visualizedScenes.length; i++) {
        const s = visualizedScenes[i];
        try {
          const audioUrl = await geminiService.generateVoiceover(s.voiceover, userApiKey) || undefined;
          finalScenes.push({ ...s, audioUrl });
        } catch (audioError: any) {
          console.error("Audio generation failed:", audioError);
          if (audioError?.message?.includes('Requested entity was not found')) {
             if (window.aistudio) await window.aistudio.openSelectKey();
          }
          finalScenes.push({ ...s });
        }
        setProgress(70 + ((i + 1) / visualizedScenes.length) * 30);
      }
      setScenes(finalScenes);
      setCurrentStep('ready');
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('permission denied') || error?.message?.includes('Requested entity was not found')) {
        if (window.aistudio) await window.aistudio.openSelectKey();
        alert("Permission denied. Please ensure you have selected a valid API key from a paid Google Cloud project.");
      } else {
        alert("Error generating reel. Check console.");
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'scripting', label: 'Scripting', icon: AlignLeft },
    { id: 'visualizing', label: 'AI Visuals', icon: ImageIcon },
    { id: 'voicing', label: 'Voiceover', icon: Music },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Video className="w-5 h-5 text-indigo-400" />
              Video Pipeline
              <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold rounded-full border border-indigo-500/20 animate-pulse">
                NEURODIGITAL ENGINE ACTIVE
              </span>
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Topic or URL
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[var(--text-primary)]"
                placeholder="e.g., 5 ways to improve focus"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Psychological Trigger (Cognitive Bias)
              </label>
              <select
                value={psychTrigger}
                onChange={e => setPsychTrigger(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[var(--text-primary)]"
              >
                <option value="none">Standard Neuro-Digital Optimization</option>
                <option value="loss-aversion">Loss Aversion (Fear of Missing Out)</option>
                <option value="social-proof">Social Proof (Bandwagon Effect)</option>
                <option value="authority">Authority (Expert Influence)</option>
                <option value="dopamine">Dopamine Loop (Curiosity & Reward)</option>
                <option value="scarcity">Scarcity (Urgency & Exclusive Access)</option>
              </select>
            </div>

            <AudienceSelector
              value={audienceType}
              onChange={setAudienceType}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <AlignLeft className="w-4 h-4" /> Script Details (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 text-[var(--text-primary)]"
                placeholder="Paste specific points or a manual script..."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Scene Count: {sceneCount}
              </label>
              <input 
                type="range" 
                min="3" 
                max="10" 
                value={sceneCount} 
                onChange={e => setSceneCount(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
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
              onClick={handleGenerate}
              disabled={loading || (!url && !details)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 neon-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'Processing Pipeline...' : 'Start Automation'}
            </button>

            {loading && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <div className="w-full bg-[var(--bg-primary)] rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-indigo-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {steps.map(step => (
                    <div key={step.id} className="flex flex-col items-center gap-1">
                      <div className={`p-2 rounded-lg transition-colors ${currentStep === step.id ? 'bg-indigo-600 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)]'}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-[var(--text-secondary)]">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] p-6 rounded-2xl neon-border shadow-sm min-h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Timeline Editor</h2>
            {currentStep === 'ready' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    scenes.forEach((s, i) => {
                      if (s.imageUrl) downloadImage(s.imageUrl, `scene-${i + 1}-image.png`);
                      if (s.audioUrl) {
                        const a = document.createElement('a');
                        a.href = s.audioUrl;
                        a.download = `scene-${i + 1}-audio.mp3`;
                        a.click();
                      }
                    });
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 neon-glow transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Assets
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
            <AnimatePresence>
              {scenes.length > 0 ? (
                scenes.map((scene, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 w-[300px] aspect-[9/16] bg-[var(--bg-primary)] rounded-2xl relative overflow-hidden snap-center shadow-2xl border border-[var(--border-color)] group"
                  >
                    {scene.imageUrl ? (
                      <img 
                        src={scene.imageUrl} 
                        alt={scene.scene} 
                        className="w-full h-full object-cover opacity-80" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-xs font-medium uppercase tracking-widest">Generating...</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end gap-4">
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
                        <p className="text-white text-sm font-medium leading-relaxed italic">
                          "{scene.caption}"
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                            Scene {idx + 1}
                          </span>
                          <span className="text-[10px] text-white/60 truncate w-32">
                            {scene.scene}
                          </span>
                        </div>
                        {scene.audioUrl && (
                          <button 
                            onClick={() => playAudio(scene.audioUrl)}
                            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-lg hover:scale-110 active:scale-95"
                          >
                            <Play className="w-4 h-4 fill-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="w-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4 py-20 opacity-30">
                  <Video className="w-24 h-24" />
                  <p className="font-medium">Your automated reel will appear here...</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {currentStep === 'ready' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-indigo-950/30 rounded-2xl border border-indigo-500/20 flex items-center justify-between backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-100">Project Complete</p>
                  <p className="text-sm text-indigo-400">{scenes.length} Scenes • AI Voiceover • AI Visuals • 9:16 Format</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    scenes.forEach((s, i) => {
                      if (s.imageUrl) downloadImage(s.imageUrl, `scene-${i + 1}-image.png`);
                      if (s.audioUrl) {
                        const a = document.createElement('a');
                        a.href = s.audioUrl;
                        a.download = `scene-${i + 1}-audio.mp3`;
                        a.click();
                      }
                    });
                  }}
                  className="px-6 py-3 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl text-sm font-bold hover:bg-[var(--border-color)] transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Assets
                </button>
                <button 
                  onClick={handleCompile}
                  disabled={compiling}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 neon-glow transition-all flex items-center gap-2"
                >
                  {compiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  {compiling ? 'Compiling...' : 'Compile Video'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
