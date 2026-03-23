import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Shield, Info, Loader2, CheckCircle2, ExternalLink, Brain } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BrandVoiceToggle } from './BrandVoiceToggle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasPlatformKey, setHasPlatformKey] = useState(false);
  const [useBrandVoice, setUseBrandVoice] = useState(false);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      fetchSettings();
      checkPlatformKey();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setApiKey(userDoc.data().customApiKey || '');
        setUseBrandVoice(userDoc.data().useBrandVoice || false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkPlatformKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasPlatformKey(hasKey);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        customApiKey: apiKey,
        useBrandVoice: useBrandVoice
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPlatformKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      checkPlatformKey();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden neon-border max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--bg-primary)] rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Application Settings</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Manage your API keys and preferences</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors text-[var(--text-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              {/* Platform Key Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Platform API Key</h3>
                  {hasPlatformKey && (
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </div>
                  )}
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-3">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                      Use the official AI Studio key selector for high-performance models like <strong>Gemini 3.1 Pro</strong> and <strong>Veo</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenPlatformKey}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {hasPlatformKey ? 'Change Platform Key' : 'Select Platform Key'}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center text-[10px] text-indigo-400 hover:underline"
                  >
                    Learn about Gemini API Billing
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[var(--border-color)]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--bg-secondary)] px-2 text-[var(--text-secondary)] font-bold tracking-widest">OR</span>
                </div>
              </div>

              {/* Custom Key Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Custom Gemini API Key</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] ml-1">API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API Key..."
                      className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm font-mono text-[var(--text-primary)]"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[10px] text-[var(--text-secondary)] leading-tight">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  <p>This key will be stored securely in your private profile and used for all AI generations if provided.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[var(--border-color)]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--bg-secondary)] px-2 text-[var(--text-secondary)] font-bold tracking-widest">Preferences</span>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Global Preferences</h3>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">Default Brand Voice</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">Enable Brand Voice by default in all generators</p>
                    </div>
                  </div>
                  <BrandVoiceToggle 
                    enabled={useBrandVoice} 
                    onToggle={setUseBrandVoice} 
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-semibold hover:bg-[var(--bg-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
