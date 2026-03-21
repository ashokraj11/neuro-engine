import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, ExternalLink, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface ApiKeyReminderProps {
  onOpenSettings: () => void;
}

export function ApiKeyReminder({ onOpenSettings }: ApiKeyReminderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!auth.currentUser) return;

      // Check localStorage first
      const hidden = localStorage.getItem(`hide_api_reminder_${auth.currentUser.uid}`);
      if (hidden === 'true') return;

      try {
        // Check Firestore for custom key
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const customKey = userDoc.data()?.customApiKey;

        // Check platform key
        let platformKey = false;
        if (window.aistudio?.hasSelectedApiKey) {
          platformKey = await window.aistudio.hasSelectedApiKey();
        }

        if (!customKey && !platformKey) {
          // Show reminder after a short delay
          setTimeout(() => setIsVisible(true), 2000);
        }
      } catch (error) {
        console.error('Error checking API key status:', error);
      }
    };

    checkStatus();
  }, []);

  const handleClose = () => {
    if (dontShowAgain && auth.currentUser) {
      localStorage.setItem(`hide_api_reminder_${auth.currentUser.uid}`, 'true');
    }
    setIsVisible(false);
  };

  const handleGoToSettings = () => {
    onOpenSettings();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 neon-border rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Header with Glow */}
            <div className="relative p-8 text-center space-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full" />
              
              <div className="relative inline-flex p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-2">
                <Key className="w-8 h-8 text-cyan-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Unlock Full AI Power
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                To generate high-quality marketing assets, you need to connect your <strong>Google Gemini API Key</strong>.
              </p>
            </div>

            {/* Guide Section */}
            <div className="px-8 pb-8 space-y-6">
              <div className="bg-zinc-800/50 rounded-2xl p-5 border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  How to get your key:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Go to Google AI Studio (aistudio.google.com)",
                    "Click 'Get API key' in the sidebar",
                    "Create a new key or copy an existing one",
                    "Paste it in our App Settings"
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-zinc-300">
                      <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">
                        {i + 1}
                      </div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoToSettings}
                  className="w-full py-4 bg-cyan-500 text-black rounded-2xl font-bold text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-cyan-500/20"
                >
                  Go to Settings
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center justify-between px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                      />
                      <div className={cn(
                        "w-4 h-4 rounded border transition-all flex items-center justify-center",
                        dontShowAgain ? "bg-cyan-500 border-cyan-500" : "bg-transparent border-zinc-600 group-hover:border-zinc-400"
                      )}>
                        {dontShowAgain && <CheckCircle2 className="w-3 h-3 text-black" />}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Don't ask again</span>
                  </label>
                  
                  <button
                    onClick={handleClose}
                    className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hover:text-white transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
