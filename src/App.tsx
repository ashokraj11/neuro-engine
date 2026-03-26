import React, { useState, useEffect } from 'react';
import { BlogGenerator } from './components/BlogGenerator';
import { SocialMediaPostGenerator } from './components/SocialMediaPostGenerator';
import { ReelsGenerator } from './components/ReelsGenerator';
import { AdsGenerator } from './components/AdsGenerator';
import { EmailGenerator } from './components/EmailGenerator';
import { WhatsappGenerator } from './components/WhatsappGenerator';
import { LandingPageGenerator } from './components/LandingPageGenerator';
import { SalesFunnelGenerator } from './components/SalesFunnelGenerator';
import { NicheGenerator } from './components/NicheGenerator';
import { LeadMagnetGenerator } from './components/LeadMagnetGenerator';
import { OmnichannelCampaignGenerator } from './components/OmnichannelCampaignGenerator';
import { BridgePageGenerator } from './components/AffiliateMarketer/BridgePageGenerator';
import { OfferAngleIntelligence } from './components/AffiliateMarketer/OfferAngleIntelligence';
import { AdPolicyChecker } from './components/AffiliateMarketer/AdPolicyChecker';
import { CompetitorIntelligence } from './components/AffiliateMarketer/CompetitorIntelligence';
import { BrandVoiceManager } from './components/BrandVoiceManager';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsAndConditions } from './components/TermsAndConditions';
import { ContactUs } from './components/ContactUs';
import { LearningModule } from './components/LearningModule';
import { AdminModule } from './components/AdminModule';
import { Dashboard } from './components/Dashboard';
import { MobileVerification } from './components/MobileVerification';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SettingsModal } from './components/SettingsModal';
import { SupportChatbot } from './components/SupportChatbot';
import { ApiKeyReminder } from './components/ApiKeyReminder';
import { AdSense } from './components/AdSense';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { auth, loginWithGoogle, logout, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { Brain, FileText, Video, Megaphone, Sparkles, LayoutDashboard, Settings, HelpCircle, LogIn, LogOut, Loader2, Menu, X, BookOpen, ShieldCheck, Mail, LayoutTemplate, ChevronDown, ChevronRight, Wand2, PanelLeftClose, PanelLeftOpen, MessageSquare, Share2, Funnel, Target, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MODULE_LIST } from './constants/modules';

interface ModuleVisibility {
  id: string;
  isVisibleForAll: boolean;
  visibleForUsers: string[];
}

interface AdConfig {
  placementId: string;
  isVisible: boolean;
  name: string;
  adCode?: string;
}

type Module = 'dashboard' | 'niche' | 'blog' | 'social-media' | 'reels' | 'ads' | 'email' | 'whatsapp' | 'landing' | 'sales-funnel' | 'lead-magnet' | 'learning' | 'admin' | 'bridge-page' | 'offer-angle' | 'ad-policy' | 'competitor-intelligence' | 'brand-voice' | 'omnichannel' | 'privacy-policy' | 'terms-conditions' | 'contact-us';

function LoginScreen({ onNavigate }: { onNavigate: (module: Module) => void }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error(error);
      alert("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-between p-4 relative">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)]">
            <Brain className="w-6 h-6 text-[var(--neon-cyan,white)]" />
          </div>
          <span className="font-bold text-xl neon-text-gradient hidden sm:block">Neuro Engine AI</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[var(--bg-secondary)] p-10 rounded-3xl shadow-2xl border border-[var(--border-color)] text-center neon-border z-10"
        >
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,243,255,0.4)]">
            <Brain className="w-10 h-10 text-[var(--neon-cyan,white)]" />
          </div>
          <h1 className="text-3xl font-bold mb-2 neon-text-gradient">Neuro Engine AI</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            {isSignUp 
              ? "Create your account to start generating high-converting assets." 
              : "The ultimate AI toolkit for high-converting marketing assets."}
          </p>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-[var(--neon-cyan)] text-black rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_15px_rgba(0,243,255,0.3)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {isSignUp ? "Create Account with Google" : "Sign in with Google"}
          </button>

          <div className="mt-6 flex flex-col gap-4">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[var(--neon-cyan)] hover:underline transition-all"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
            </button>
            
            <p className="text-xs text-[var(--text-secondary)]">
              By {isSignUp ? "creating an account" : "signing in"}, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>

        {/* Marketing Insight Section */}
        <section className="mt-16 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 z-10 px-4">
          <div className="bg-[var(--bg-secondary)] border-2 border-orange-500/80 rounded-2xl p-8 text-center shadow-lg hover:shadow-orange-500/10 transition-shadow">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4 tracking-wide uppercase leading-tight">
              What Most<br/>People Think
            </h2>
            <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-relaxed">
              The hardest part is finding the perfect offer, building a website, or spending money on paid ads
            </p>
          </div>
          <div className="bg-[var(--bg-secondary)] border-2 border-orange-500/80 rounded-2xl p-8 text-center shadow-lg hover:shadow-orange-500/10 transition-shadow">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4 tracking-wide uppercase leading-tight">
              The Real<br/>Problem
            </h2>
            <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-relaxed">
              The real struggle isn't finding offers or spending money — it's marketing the offer the right way.
            </p>
          </div>
        </section>

        {/* SEO Content Section (Visible to Crawlers) */}
        <section className="mt-16 max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left px-4">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Neuromarketing AI</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Leverage advanced psychological triggers to create content that resonates with the subconscious mind and drives action.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">SEO Optimized</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Generate high-ranking articles and ad copies designed to dominate search results and answer engine queries.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Affiliate Ready</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Specialized tools for bridge pages, offer angles, and competitor intelligence to scale your affiliate marketing business.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto mt-16 py-8 border-t border-[var(--border-color)] flex flex-col items-center gap-4 text-sm text-[var(--text-secondary)] z-20">
        <div className="flex gap-6">
          <button onClick={() => onNavigate('privacy-policy')} className="hover:text-[var(--neon-cyan)] transition-colors">Privacy Policy</button>
          <button onClick={() => onNavigate('terms-conditions')} className="hover:text-[var(--neon-cyan)] transition-colors">Terms & Conditions</button>
          <button onClick={() => onNavigate('contact-us')} className="hover:text-[var(--neon-cyan)] transition-colors">Contact Us</button>
        </div>
        <p>© 2026 Neuro Engine AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BackgroundAnimation />
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [dashboardNavState, setDashboardNavState] = useState<{ tab: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'master' | 'sub' | 'user'>('user');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGeneratorsOpen, setIsGeneratorsOpen] = useState(true);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(true);
  const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibility[]>([]);
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([]);

  const handleShareApp = async () => {
    const shareData = {
      title: 'Neuro Engine AI',
      text: 'Check out Neuro Engine AI - The ultimate marketing architect!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('App link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      setModuleVisibility([]);
      return;
    }

    const q = query(collection(db, 'module_visibility'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setModuleVisibility(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ModuleVisibility)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'module_visibility');
    });
    const qAdConfigs = query(collection(db, 'ad_config'));
    const unsubscribeAdConfigs = onSnapshot(qAdConfigs, (snapshot) => {
      setAdConfigs(snapshot.docs.map(doc => ({
        placementId: doc.id,
        ...doc.data()
      } as AdConfig)));
    }, (error) => {
      console.error("Error fetching ad configs:", error);
    });

    return () => {
      unsubscribe();
      unsubscribeAdConfigs();
    };
  }, [user]);

  // Global AdSense Script Injection
  useEffect(() => {
    const globalConfig = adConfigs.find(c => c.placementId === 'global_adsense_script');
    if (globalConfig?.isVisible && globalConfig.adCode) {
      // Remove existing global script if any to avoid duplicates
      const existingScript = document.getElementById('global-adsense-script');
      if (existingScript) existingScript.remove();

      // Create new script element
      const scriptContainer = document.createElement('div');
      scriptContainer.id = 'global-adsense-script';
      scriptContainer.style.display = 'none';
      
      // Use Range to parse HTML string into DOM nodes (handles <script> tags)
      const range = document.createRange();
      const fragment = range.createContextualFragment(globalConfig.adCode);
      scriptContainer.appendChild(fragment);
      
      document.head.appendChild(scriptContainer);
    } else {
      const existingScript = document.getElementById('global-adsense-script');
      if (existingScript) existingScript.remove();
    }
  }, [adConfigs]);

  // SEO & Verification
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'seo_config', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        
        // Google Search Console Verification
        if (data.googleVerification) {
          let meta = document.querySelector('meta[name="google-site-verification"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'google-site-verification');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', data.googleVerification);
        }

        // Google Analytics
        if (data.googleAnalyticsId) {
          const scriptId = 'google-analytics-script';
          if (!document.getElementById(scriptId)) {
            const script1 = document.createElement('script');
            script1.id = scriptId;
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${data.googleAnalyticsId}`;
            document.head.appendChild(script1);

            const script2 = document.createElement('script');
            script2.id = `${scriptId}-config`;
            script2.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${data.googleAnalyticsId}');
            `;
            document.head.appendChild(script2);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        let userData: any;
        if (!userSnap.exists()) {
          userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: user.email === 'mail2ashokrajj@gmail.com' ? 'master' : 'user',
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, userData);
          setUserRole(userData.role as 'master' | 'sub' | 'user');
        } else {
          userData = userSnap.data();
          if (user.email === 'mail2ashokrajj@gmail.com' && userData.role !== 'master') {
            await updateDoc(userRef, { role: 'master' });
            userData.role = 'master';
            setUserRole('master');
          } else {
            setUserRole(userData.role || 'user');
          }
        }
        setUser(user);
        setIsMobileVerified(!!userData.phoneNumber);
      } else {
        setUser(null);
        setUserRole('user');
        setIsMobileVerified(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--neon-cyan)]" />
          <div className="absolute inset-0 blur-xl bg-[var(--neon-cyan)]/20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (activeModule === 'privacy-policy') {
      return (
        <div className="min-h-screen bg-transparent flex flex-col p-6 text-[var(--text-primary)]">
          <button onClick={() => setActiveModule('dashboard')} className="mb-4 text-[var(--neon-cyan)] self-start hover:underline">← Back to Login</button>
          <PrivacyPolicy />
        </div>
      );
    }
    if (activeModule === 'terms-conditions') {
      return (
        <div className="min-h-screen bg-transparent flex flex-col p-6 text-[var(--text-primary)]">
          <button onClick={() => setActiveModule('dashboard')} className="mb-4 text-[var(--neon-cyan)] self-start hover:underline">← Back to Login</button>
          <TermsAndConditions />
        </div>
      );
    }
    if (activeModule === 'contact-us') {
      return (
        <div className="min-h-screen bg-transparent flex flex-col p-6 text-[var(--text-primary)]">
          <button onClick={() => setActiveModule('dashboard')} className="mb-4 text-[var(--neon-cyan)] self-start hover:underline">← Back to Login</button>
          <ContactUs />
        </div>
      );
    }
    return <LoginScreen onNavigate={setActiveModule} />;
  }

  if (!isMobileVerified) {
    return <MobileVerification userId={user.uid} onVerified={() => setIsMobileVerified(true)} />;
  }

  const isMaster = userRole === 'master';
  const isSub = userRole === 'sub';
  const isAdmin = isMaster || isSub;

  const isModuleVisible = (moduleId: string) => {
    // Admins always see the admin module
    if (moduleId === 'admin' && isAdmin) return true;
    
    const visibility = moduleVisibility.find(v => v.id === moduleId);
    if (!visibility) return true; // Default to visible if no setting found
    
    if (visibility.isVisibleForAll) return true;
    return visibility.visibleForUsers.includes(user.uid);
  };

  const mainModules = MODULE_LIST
    .filter(m => m.category === 'main' && isModuleVisible(m.id));

  const generatorModules = MODULE_LIST
    .filter(m => m.category === 'generator' && isModuleVisible(m.id));

  const affiliateModules = MODULE_LIST
    .filter(m => m.category === 'affiliate' && isModuleVisible(m.id));

  const otherModules = MODULE_LIST
    .filter(m => m.category === 'other' && isModuleVisible(m.id))
    .filter(m => !m.adminOnly || isAdmin);

  const allModules = [...mainModules, ...generatorModules, ...affiliateModules, ...otherModules];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-transparent flex flex-col lg:flex-row font-sans text-[var(--text-primary)] relative transition-colors duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[var(--bg-secondary)] border-b border-[var(--border-color)] p-4 flex items-center justify-between sticky top-0 z-40 neon-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.3)]">
              <Brain className="w-5 h-5 text-[var(--neon-cyan,white)]" />
            </div>
            <h1 className="font-bold text-sm neon-text-gradient">Neuro Engine</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[var(--bg-primary)] rounded-xl transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col z-50 transition-all duration-300 transform h-screen neon-border",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          !isSidebarCollapsed ? "lg:translate-x-0 lg:sticky lg:top-0" : "lg:-translate-x-full lg:fixed"
        )}>
          <div className="p-6 hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                <Brain className="w-5 h-5 text-[var(--neon-cyan,white)]" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight neon-text-gradient">Neuro Engine</h1>
                <p className="text-[9px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">AI Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 hover:bg-[var(--bg-primary)] rounded-lg text-[var(--text-secondary)] hover:text-cyan-500 transition-colors"
                title="Hide Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1.5 pt-6 lg:pt-0 overflow-y-auto custom-scrollbar">
            <div className="text-[9px] uppercase font-bold text-[var(--text-secondary)] px-3 mb-3 tracking-widest">Main Modules</div>
            
            {/* Main Modules */}
            {mainModules.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModule(m.id as Module);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group",
                  activeModule === m.id 
                    ? "bg-[var(--bg-primary)] shadow-[0_0_10px_rgba(0,243,255,0.1)] border border-[var(--neon-cyan)]/20" 
                    : "hover:bg-[var(--bg-primary)]"
                )}
              >
                <m.icon className={cn(
                  "w-4 h-4 transition-colors",
                  activeModule === m.id ? "text-[var(--neon-cyan)] drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                )} />
                <span className={cn(
                  "font-medium text-xs",
                  activeModule === m.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                )}>
                  {m.name}
                </span>
                {activeModule === m.id && (
                  <motion.div layoutId="active-indicator" className="ml-auto w-1 h-1 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                )}
              </button>
            ))}

            {/* Generators Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsGeneratorsOpen(!isGeneratorsOpen)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group hover:bg-[var(--bg-primary)]",
                  generatorModules.some(m => m.id === activeModule) && "text-[var(--text-primary)]"
                )}
              >
                <Wand2 className={cn(
                  "w-4 h-4 transition-colors",
                  generatorModules.some(m => m.id === activeModule) ? "text-[var(--neon-magenta)] drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                )} />
                <span className="font-medium text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  Generators
                </span>
                <div className="ml-auto">
                  {isGeneratorsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isGeneratorsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-3 space-y-1"
                  >
                    {generatorModules.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveModule(m.id as Module);
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group",
                          activeModule === m.id 
                            ? "bg-[var(--bg-primary)] shadow-[0_0_10px_rgba(255,0,255,0.1)] border border-[var(--neon-magenta)]/20" 
                            : "hover:bg-[var(--bg-primary)]"
                        )}
                      >
                        <m.icon className={cn(
                          "w-3.5 h-3.5 transition-colors",
                          activeModule === m.id ? "text-[var(--neon-magenta)] drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                        )} />
                        <span className={cn(
                          "font-medium text-[11px]",
                          activeModule === m.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                        )}>
                          {m.name}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Affiliate Marketer Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsAffiliateOpen(!isAffiliateOpen)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group hover:bg-[var(--bg-primary)]",
                  affiliateModules.some(m => m.id === activeModule) && "text-[var(--text-primary)]"
                )}
              >
                <Target className={cn(
                  "w-4 h-4 transition-colors",
                  affiliateModules.some(m => m.id === activeModule) ? "text-[var(--neon-cyan)] drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                )} />
                <span className="font-medium text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  Affiliate Marketer
                </span>
                <div className="ml-auto">
                  {isAffiliateOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isAffiliateOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-3 space-y-1"
                  >
                    {affiliateModules.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveModule(m.id as Module);
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group",
                          activeModule === m.id 
                            ? "bg-[var(--bg-primary)] shadow-[0_0_10px_rgba(0,243,255,0.1)] border border-[var(--neon-cyan)]/20" 
                            : "hover:bg-[var(--bg-primary)]"
                        )}
                      >
                        <m.icon className={cn(
                          "w-3.5 h-3.5 transition-colors",
                          activeModule === m.id ? "text-[var(--neon-cyan)] drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                        )} />
                        <span className={cn(
                          "font-medium text-[11px]",
                          activeModule === m.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                        )}>
                          {m.name}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {otherModules.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModule(m.id as Module);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group",
                  activeModule === m.id 
                    ? "bg-[var(--bg-primary)] shadow-[0_0_10px_rgba(57,255,20,0.1)] border border-[var(--neon-lime)]/20" 
                    : "hover:bg-[var(--bg-primary)]"
                )}
              >
                <m.icon className={cn(
                  "w-4 h-4 transition-colors",
                  activeModule === m.id ? "text-[var(--neon-lime)] drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                )} />
                <span className={cn(
                  "font-medium text-xs",
                  activeModule === m.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                )}>
                  {m.name}
                </span>
                {activeModule === m.id && (
                  <motion.div layoutId="active-indicator" className="ml-auto w-1 h-1 rounded-full bg-[var(--neon-lime)] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => logout()}
                className="p-2 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden">
                {user.photoURL && <img src={user.photoURL || undefined} alt="Avatar" className="w-full h-full object-cover" />}
              </div>
            </div>
            
            {/* Sidebar Ad Slot */}
            {activeModule !== 'admin' && (adConfigs.find(c => c.placementId === 'sidebar_bottom')?.isVisible !== false) && (
              <AdSense 
                adSlot="SIDEBAR_AD_SLOT" 
                adFormat="rectangle" 
                fullWidthResponsive={false}
                className="my-2 p-2 rounded-xl"
                adCode={adConfigs.find(c => c.placementId === 'sidebar_bottom')?.adCode}
              />
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto relative">
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 p-1.5 bg-[var(--bg-secondary)] border border-l-0 border-[var(--border-color)] rounded-r-lg shadow-md text-[var(--text-secondary)] hover:text-cyan-500 transition-all hover:pr-3 group"
              title="Show Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Show Sidebar
              </div>
            </button>
          )}
          <header className="mb-8 lg:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                {allModules.find(m => m.id === activeModule)?.name}
              </h2>
              <p className="text-sm lg:text-base text-[var(--text-secondary)]">
                {activeModule === 'dashboard' && 'View and manage all your saved marketing assets.'}
                {activeModule === 'blog' && 'Generate high-ranking SEO articles with neuromarketing triggers.'}
                {activeModule === 'reels' && 'Automate your short-form video content with AI voice and scenes.'}
                {activeModule === 'ads' && 'Create high-converting Facebook ad copies and creative prompts.'}
                {activeModule === 'email' && 'Generate high-converting email swipe sequences.'}
                {activeModule === 'whatsapp' && 'Generate high-converting WhatsApp swipe sequences with visual assets.'}
                {activeModule === 'landing' && 'Build high-converting landing page copy with neuromarketing triggers.'}
                {activeModule === 'sales-funnel' && 'Design strategic sales funnels for your products.'}
                {activeModule === 'niche' && 'Refine your niche and build detailed buyer personas.'}
                {activeModule === 'lead-magnet' && 'Create structured, high-value lead magnet ebooks or guides.'}
                {activeModule === 'omnichannel' && 'Generate a full campaign funnel with perfect message match consistency.'}
                {activeModule === 'bridge-page' && 'Generate high-converting pre-sell pages for your affiliate offers.'}
                {activeModule === 'offer-angle' && 'Reverse-engineer successful affiliate offers to find your winning angle.'}
                {activeModule === 'ad-policy' && 'Ensure your ads comply with platform policies.'}
                {activeModule === 'competitor-intelligence' && 'Analyze competitor hooks and generate superior counter-offers.'}
                {activeModule === 'brand-voice' && 'Define your brand voice and tone for consistent AI-generated content.'}
                {activeModule === 'learning' && 'Master neuromarketing and AI strategy with our expert-led courses.'}
                {activeModule === 'admin' && 'Manage application content and user access.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleShareApp}
                className="px-4 py-2 bg-[var(--neon-cyan)] text-black rounded-xl border border-[var(--neon-cyan)] flex items-center gap-2 shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:opacity-90 transition-all w-full md:w-auto justify-center font-semibold"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share App</span>
              </button>
              {activeModule !== 'dashboard' && (
                <button 
                  onClick={() => setActiveModule('dashboard')}
                  className="px-4 py-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex items-center gap-2 shadow-sm hover:bg-[var(--bg-primary)] transition-colors w-full md:w-auto justify-center"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>
              )}
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeModule === 'dashboard' && (
                <Dashboard 
                  adConfigs={adConfigs}
                  onNavigate={(module, state) => {
                    setActiveModule(module);
                    setDashboardNavState(state);
                  }} 
                />
              )}
              {activeModule === 'blog' && <BlogGenerator />}
              {activeModule === 'social-media' && <SocialMediaPostGenerator />}
              {activeModule === 'reels' && <ReelsGenerator />}
              {activeModule === 'ads' && <AdsGenerator />}
              {activeModule === 'email' && <EmailGenerator />}
              {activeModule === 'whatsapp' && <WhatsappGenerator />}
              {activeModule === 'landing' && <LandingPageGenerator />}
              {activeModule === 'sales-funnel' && <SalesFunnelGenerator />}
              {activeModule === 'niche' && <NicheGenerator />}
              {activeModule === 'lead-magnet' && <LeadMagnetGenerator />}
              {activeModule === 'omnichannel' && <OmnichannelCampaignGenerator />}
              {activeModule === 'bridge-page' && <BridgePageGenerator />}
              {activeModule === 'offer-angle' && <OfferAngleIntelligence />}
              {activeModule === 'ad-policy' && <AdPolicyChecker />}
              {activeModule === 'competitor-intelligence' && <CompetitorIntelligence />}
              {activeModule === 'brand-voice' && <BrandVoiceManager />}
              {activeModule === 'privacy-policy' && <PrivacyPolicy />}
              {activeModule === 'terms-conditions' && <TermsAndConditions />}
              {activeModule === 'contact-us' && <ContactUs />}
              {activeModule === 'learning' && (
                <LearningModule 
                  initialTab={dashboardNavState?.tab as any} 
                  adConfigs={adConfigs}
                />
              )}
              {activeModule === 'admin' && <AdminModule isMaster={isMaster} />}
            </motion.div>
          </AnimatePresence>

          {/* Generator Bottom Ad Slot */}
          {generatorModules.some(m => m.id === activeModule) && (adConfigs.find(c => c.placementId === 'generator_bottom')?.isVisible !== false) && (
            <AdSense 
              adSlot="GENERATOR_BOTTOM_AD" 
              className="mt-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl"
              adCode={adConfigs.find(c => c.placementId === 'generator_bottom')?.adCode}
            />
          )}

          {/* Footer Ad Slot */}
          {activeModule !== 'admin' && (adConfigs.find(c => c.placementId === 'footer_ad')?.isVisible !== false) && (
            <AdSense 
              adSlot="FOOTER_AD_SLOT" 
              className="mt-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl"
              adCode={adConfigs.find(c => c.placementId === 'footer_ad')?.adCode}
            />
          )}
          
          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-wrap gap-6 justify-center text-sm text-[var(--text-secondary)]">
            <button onClick={() => setActiveModule('privacy-policy')} className="hover:text-[var(--neon-cyan)] transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModule('terms-conditions')} className="hover:text-[var(--neon-cyan)] transition-colors">Terms & Conditions</button>
            <button onClick={() => setActiveModule('contact-us')} className="hover:text-[var(--neon-cyan)] transition-colors">Contact Us</button>
          </footer>
        </main>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <SupportChatbot />
        <ApiKeyReminder onOpenSettings={() => setIsSettingsOpen(true)} />
      </div>
    </ErrorBoundary>
  );
}
