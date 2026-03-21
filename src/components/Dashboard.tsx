import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Video, Megaphone, Calendar, Clock, ChevronRight, Search, Filter, Trash2, ExternalLink, Loader2, Copy, Check, Image as ImageIcon, Download, Mail, LayoutTemplate, MessageSquare, Target, Sparkles, Layers, BookOpen, Wrench, Newspaper } from 'lucide-react';
import { cn, downloadImage } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Asset {
  id: string;
  type: 'blog' | 'reel' | 'ads' | 'email' | 'whatsapp' | 'landing' | 'lead-magnet' | 'omnichannel' | 'competitor-intelligence';
  title: string;
  content: any;
  metadata: any;
  createdAt: Timestamp;
}

interface LatestUpdate {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  createdAt: Timestamp;
  type: 'course' | 'tool' | 'blog';
  link?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
}

export function Dashboard({ onNavigate }: { onNavigate: (module: any, state?: any) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [latestCourses, setLatestCourses] = useState<LatestUpdate[]>([]);
  const [latestTools, setLatestTools] = useState<LatestUpdate[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<LatestUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'blog' | 'reel' | 'ads' | 'email' | 'whatsapp' | 'landing' | 'lead-magnet' | 'omnichannel' | 'competitor-intelligence'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string, promptId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(promptId);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'assets'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
      setAssets(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const qCourses = query(collection(db, 'learning'), orderBy('createdAt', 'desc'), limit(5));
    const unsubCourses = onSnapshot(qCourses, (snap) => {
      setLatestCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'course' } as LatestUpdate)));
    });

    const qTools = query(collection(db, 'tools'), orderBy('createdAt', 'desc'), limit(5));
    const unsubTools = onSnapshot(qTools, (snap) => {
      setLatestTools(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'tool' } as LatestUpdate)));
    });

    const qBlogs = query(collection(db, 'blog'), orderBy('createdAt', 'desc'), limit(5));
    const unsubBlogs = onSnapshot(qBlogs, (snap) => {
      setLatestBlogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'blog' } as LatestUpdate)));
    });

    return () => {
      unsubCourses();
      unsubTools();
      unsubBlogs();
    };
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      setShowDeleteConfirm(false);
    }
  }, [selectedAsset]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const downloadAsHtml = (asset: any) => {
    const result = asset.content;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${result.heroHeadline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); }
    </style>
</head>
<body class="bg-white text-gray-900">
    <!-- Hero Section -->
    <header class="gradient-bg text-white py-20 px-6">
        <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">${result.heroHeadline}</h1>
            <p class="text-xl md:text-2xl mb-10 opacity-90">${result.heroSubheadline}</p>
            <a href="#" class="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform">${result.heroCTA}</a>
        </div>
    </header>

    <!-- Problem Section -->
    <section class="py-20 px-6 bg-gray-50">
        <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-8 text-red-600">The Problem</h2>
            <p class="text-lg text-gray-700 leading-relaxed italic">"${result.problemAgitation}"</p>
        </div>
    </section>

    <!-- Solution Section -->
    <section class="py-20 px-6">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold mb-6">The Solution</h2>
                <p class="text-xl text-gray-600">${result.solutionPresentation}</p>
            </div>
            
            <div class="grid md:grid-cols-1 gap-6">
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="text-2xl font-bold mb-6 text-indigo-600">Why Choose Us?</h3>
                    <ul class="space-y-4">
                        ${result.keyBenefits?.map((benefit: string) => `
                            <li class="flex items-start gap-3">
                                <svg class="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                <span class="text-lg text-gray-700">${benefit}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 px-6 bg-indigo-50">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-3xl font-bold text-center mb-16">What People Are Saying</h2>
            <div class="grid md:grid-cols-2 gap-8">
                ${result.testimonials?.map((t: any) => `
                    <div class="bg-white p-8 rounded-2xl shadow-sm">
                        <p class="text-gray-600 italic mb-6">"${t.quote}"</p>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 text-xl">
                                ${t.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="font-bold">${t.name}</h4>
                                <p class="text-sm text-gray-500">${t.role}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 px-6 text-center">
        <div class="max-w-3xl mx-auto">
            <h2 class="text-4xl font-bold mb-8">Ready to transform your results?</h2>
            <a href="#" class="inline-block bg-indigo-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:bg-indigo-700 transition-colors">${result.finalCTA}</a>
            <p class="mt-6 text-gray-500">Join thousands of successful users today.</p>
        </div>
    </section>

    <footer class="py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        &copy; ${new Date().getFullYear()} Your Brand. All rights reserved.
    </footer>
</body>
</html>
    `.trim();

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title.replace(/\s+/g, '-').toLowerCase()}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (assetId: string) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'assets', assetId));
      setSelectedAsset(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assets/${assetId}`);
    } finally {
      setDeleting(false);
    }
  };

  const groupedAssets = filteredAssets.reduce((groups: { [key: string]: Asset[] }, asset) => {
    const date = asset.createdAt?.toDate().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || 'Unknown Date';
    if (!groups[date]) groups[date] = [];
    groups[date].push(asset);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Latest Updates Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Courses */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl neon-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Latest Courses
            </h3>
            <span className="text-[10px] font-bold text-cyan-500/50">NEW</span>
          </div>
          <div className="space-y-3">
            {latestCourses.length > 0 ? latestCourses.map(course => (
              <div 
                key={course.id} 
                onClick={() => onNavigate('learning', { tab: 'video' })}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-all cursor-pointer border border-transparent hover:border-cyan-500/20"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-950/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-cyan-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-cyan-400 transition-colors">{course.title}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">{course.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-cyan-400" />
              </div>
            )) : (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">No courses available yet.</p>
            )}
          </div>
        </div>

        {/* Latest Tools */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl neon-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Latest Tools
            </h3>
            <span className="text-[10px] font-bold text-emerald-500/50">NEW</span>
          </div>
          <div className="space-y-3">
            {latestTools.length > 0 ? latestTools.map(tool => (
              <div 
                key={tool.id} 
                onClick={() => onNavigate('learning', { tab: 'tools' })}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-all cursor-pointer border border-transparent hover:border-emerald-500/20"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-950/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {tool.imageUrl ? (
                    <img src={tool.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Wrench className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-emerald-400 transition-colors">{tool.name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">{tool.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-emerald-400" />
              </div>
            )) : (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">No tools available yet.</p>
            )}
          </div>
        </div>

        {/* Latest Blogs */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl neon-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-purple-400" />
              Latest Blogs
            </h3>
            <span className="text-[10px] font-bold text-purple-500/50">NEW</span>
          </div>
          <div className="space-y-3">
            {latestBlogs.length > 0 ? latestBlogs.map(blog => (
              <div 
                key={blog.id} 
                onClick={() => onNavigate('learning', { tab: 'blog' })}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-all cursor-pointer border border-transparent hover:border-purple-500/20"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-950/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {blog.imageUrl ? (
                    <img src={blog.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Newspaper className="w-5 h-5 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-purple-400 transition-colors">{blog.title}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">{blog.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-purple-400" />
              </div>
            )) : (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">No blogs available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--bg-secondary)] p-4 rounded-2xl neon-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:bg-[var(--bg-secondary)] focus:border-cyan-500/50 outline-none transition-all text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {(['all', 'blog', 'reel', 'ads', 'email', 'whatsapp', 'landing', 'lead-magnet', 'omnichannel', 'competitor-intelligence'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap neon-glow",
                filterType === type 
                  ? "bg-cyan-500 text-[var(--bg-primary)] shadow-lg shadow-cyan-500/20" 
                  : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-12">
        {Object.entries(groupedAssets).length > 0 ? (
          Object.entries(groupedAssets).map(([date, dateAssets]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">{date}</h3>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {dateAssets.map((asset) => (
                  <motion.div
                    layoutId={asset.id}
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={cn(
                      "group bg-[var(--bg-secondary)] p-6 rounded-3xl neon-border shadow-sm transition-all cursor-pointer relative overflow-hidden",
                      asset.type === 'blog' && "neon-glow-lime",
                      asset.type === 'reel' && "neon-glow-cyan",
                      asset.type === 'ads' && "neon-glow-magenta",
                      asset.type === 'email' && "neon-glow-magenta",
                      asset.type === 'whatsapp' && "neon-glow-cyan",
                      asset.type === 'landing' && "neon-glow-cyan",
                      asset.type === 'lead-magnet' && "neon-glow-lime",
                      asset.type === 'omnichannel' && "neon-glow-indigo",
                      asset.type === 'competitor-intelligence' && "neon-glow-rose"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12",
                      asset.type === 'blog' && "text-emerald-400",
                      asset.type === 'reel' && "text-indigo-400",
                      asset.type === 'ads' && "text-orange-400",
                      asset.type === 'email' && "text-purple-400",
                      asset.type === 'whatsapp' && "text-emerald-400",
                      asset.type === 'landing' && "text-blue-400",
                      asset.type === 'lead-magnet' && "text-emerald-400",
                      asset.type === 'omnichannel' && "text-indigo-400",
                      asset.type === 'competitor-intelligence' && "text-rose-400"
                    )}>
                      {asset.type === 'blog' && <FileText className="w-full h-full" />}
                      {asset.type === 'reel' && <Video className="w-full h-full" />}
                      {asset.type === 'ads' && <Megaphone className="w-full h-full" />}
                      {asset.type === 'email' && <Mail className="w-full h-full" />}
                      {asset.type === 'whatsapp' && <MessageSquare className="w-full h-full" />}
                      {asset.type === 'landing' && <LayoutTemplate className="w-full h-full" />}
                      {asset.type === 'lead-magnet' && <FileText className="w-full h-full" />}
                      {asset.type === 'omnichannel' && <Layers className="w-full h-full" />}
                      {asset.type === 'competitor-intelligence' && <Target className="w-full h-full" />}
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        asset.type === 'blog' && "bg-emerald-950/50 text-emerald-400",
                        asset.type === 'reel' && "bg-indigo-950/50 text-indigo-400",
                        asset.type === 'ads' && "bg-orange-950/50 text-orange-400",
                        asset.type === 'email' && "bg-purple-950/50 text-purple-400",
                        asset.type === 'whatsapp' && "bg-emerald-950/50 text-emerald-400",
                        asset.type === 'landing' && "bg-blue-950/50 text-blue-400",
                        asset.type === 'lead-magnet' && "bg-emerald-950/50 text-emerald-400",
                        asset.type === 'omnichannel' && "bg-indigo-950/50 text-indigo-400",
                        asset.type === 'competitor-intelligence' && "bg-rose-950/50 text-rose-400"
                      )}>
                        {asset.type === 'blog' && <FileText className="w-5 h-5" />}
                        {asset.type === 'reel' && <Video className="w-5 h-5" />}
                        {asset.type === 'ads' && <Megaphone className="w-5 h-5" />}
                        {asset.type === 'email' && <Mail className="w-5 h-5" />}
                        {asset.type === 'whatsapp' && <MessageSquare className="w-5 h-5" />}
                        {asset.type === 'landing' && <LayoutTemplate className="w-5 h-5" />}
                        {asset.type === 'lead-magnet' && <FileText className="w-5 h-5" />}
                        {asset.type === 'omnichannel' && <Layers className="w-5 h-5" />}
                        {asset.type === 'competitor-intelligence' && <Target className="w-5 h-5" />}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        {asset.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <h4 className="font-bold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {asset.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-6">
                      {asset.type === 'blog' && asset.metadata.productDetails}
                      {asset.type === 'reel' && asset.metadata.script}
                      {asset.type === 'ads' && asset.metadata.details}
                      {asset.type === 'email' && asset.metadata.productDetails}
                      {asset.type === 'whatsapp' && asset.metadata.productDetails}
                      {asset.type === 'landing' && asset.metadata.productDetails}
                      {asset.type === 'lead-magnet' && asset.metadata.productDetails}
                      {asset.type === 'omnichannel' && "Campaign"}
                      {asset.type === 'competitor-intelligence' && asset.metadata.competitorUrl}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        {asset.type}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-[var(--bg-primary)] transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
              <Search className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-medium">No assets found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              layoutId={selectedAsset.id}
              className="relative w-full max-w-4xl bg-zinc-900 neon-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)] sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    selectedAsset.type === 'blog' && "bg-emerald-950/50 text-emerald-400",
                    selectedAsset.type === 'reel' && "bg-indigo-950/50 text-indigo-400",
                    selectedAsset.type === 'ads' && "bg-orange-950/50 text-orange-400",
                    selectedAsset.type === 'email' && "bg-purple-950/50 text-purple-400",
                    selectedAsset.type === 'whatsapp' && "bg-emerald-950/50 text-emerald-400",
                    selectedAsset.type === 'landing' && "bg-blue-950/50 text-blue-400",
                    selectedAsset.type === 'lead-magnet' && "bg-emerald-950/50 text-emerald-400",
                    selectedAsset.type === 'omnichannel' && "bg-indigo-950/50 text-indigo-400",
                    selectedAsset.type === 'competitor-intelligence' && "bg-rose-950/50 text-rose-400"
                  )}>
                    {selectedAsset.type === 'blog' && <FileText className="w-6 h-6" />}
                    {selectedAsset.type === 'reel' && <Video className="w-6 h-6" />}
                    {selectedAsset.type === 'ads' && <Megaphone className="w-6 h-6" />}
                    {selectedAsset.type === 'email' && <Mail className="w-6 h-6" />}
                    {selectedAsset.type === 'whatsapp' && <MessageSquare className="w-6 h-6" />}
                    {selectedAsset.type === 'landing' && <LayoutTemplate className="w-6 h-6" />}
                    {selectedAsset.type === 'lead-magnet' && <FileText className="w-6 h-6" />}
                    {selectedAsset.type === 'omnichannel' && <Layers className="w-6 h-6" />}
                    {selectedAsset.type === 'competitor-intelligence' && <Target className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedAsset.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-widest">
                      {selectedAsset.type} • {selectedAsset.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {selectedAsset.type === 'landing' && (
                    <button
                      onClick={() => downloadAsHtml(selectedAsset)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-950/50 text-emerald-400 rounded-xl border border-emerald-900/50 hover:bg-emerald-900/50 transition-colors text-[10px] font-bold uppercase tracking-wider"
                    >
                      <Download className="w-3 h-3" />
                      Download HTML
                    </button>
                  )}
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 bg-red-950/50 p-1 rounded-xl border border-red-900 animate-in fade-in slide-in-from-right-2">
                      <span className="text-[10px] font-bold text-red-400 px-2 uppercase tracking-wider">Confirm Delete?</span>
                      <button 
                        onClick={() => handleDelete(selectedAsset.id)}
                        disabled={deleting}
                        className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'YES'}
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleting}
                        className="px-3 py-1.5 bg-[var(--bg-primary)] text-[var(--text-secondary)] text-[10px] font-bold rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        NO
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 hover:bg-red-950/50 rounded-full transition-colors group/delete"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-5 h-5 text-[var(--text-secondary)] group-hover/delete:text-red-500" />
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedAsset(null)}
                    className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-[var(--text-secondary)] rotate-90" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {selectedAsset.type === 'blog' && (
                  <div className="space-y-8">
                    <div className="prose prose-emerald max-w-none text-[var(--text-primary)] prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-a:no-underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {selectedAsset.content.markdown?.replace(/^```markdown\n?/, "").replace(/\n?```$/, "")}
                      </ReactMarkdown>
                    </div>
                    
                    {selectedAsset.content.images && selectedAsset.content.images.length > 0 && (
                      <div className="pt-8 border-t border-[var(--border-color)]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                          <ImageIcon className="w-5 h-5 text-emerald-400" />
                          Generated Visuals
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                          {selectedAsset.content.images.map((img: string, idx: number) => (
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
                )}

                {selectedAsset.type === 'lead-magnet' && (
                  <div className="space-y-8">
                    <div className="prose prose-emerald max-w-none text-[var(--text-primary)] prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-a:no-underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {selectedAsset.content.markdown?.replace(/^```markdown\n?/, "").replace(/\n?```$/, "")}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {selectedAsset.type === 'reel' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedAsset.content.scenes.map((scene: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950 p-4 rounded-2xl neon-border space-y-4">
                        <div className="aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden relative">
                          {scene.imageUrl && <img src={scene.imageUrl || undefined} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />}
                          <div className="absolute inset-0 p-4 flex flex-col justify-end">
                            <p className="text-zinc-100 text-xs font-medium bg-zinc-900/60 backdrop-blur-sm p-2 rounded-lg">
                              {scene.caption}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-cyan-500 uppercase mb-1">Scene {idx + 1}</p>
                          <p className="text-sm font-medium text-zinc-100">{scene.scene}</p>
                          <p className="text-xs text-zinc-400 mt-2 italic">"{scene.voiceover}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAsset.type === 'ads' && (
                  <div className="space-y-6">
                    {selectedAsset.content.ads.map((ad: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-black/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Angle: {ad.angle}
                          </span>
                          <button 
                            onClick={() => copyToClipboard(`${ad.headline}\n\n${ad.primaryText}`, `ad-${idx}`)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {copiedPrompt === `ad-${idx}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-gray-900">{ad.headline}</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{ad.primaryText}</p>
                        </div>
                        
                        {ad.imageUrl && (
                          <div className="w-full aspect-square rounded-xl overflow-hidden border border-black/5 relative group/image">
                            <img src={ad.imageUrl || undefined} alt="Ad Creative" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              onClick={() => downloadImage(ad.imageUrl!, `ad-${idx}.png`)}
                              className="absolute bottom-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors opacity-0 group-hover/image:opacity-100"
                            >
                              <Download className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-200 flex gap-4">
                          <div className="flex-1 relative">
                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image Prompt</span>
                              <button 
                                onClick={() => copyToClipboard(ad.imagePrompt, `image-${idx}`)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {copiedPrompt === `image-${idx}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                              </button>
                            </p>
                            <p className="text-[12px] text-gray-800 font-medium leading-relaxed">{ad.imagePrompt}</p>
                          </div>
                          <div className="flex-1 relative">
                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video Prompt</span>
                              <button 
                                onClick={() => copyToClipboard(ad.videoPrompt, `video-${idx}`)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {copiedPrompt === `video-${idx}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                              </button>
                            </p>
                            <p className="text-[12px] text-gray-800 font-medium leading-relaxed">{ad.videoPrompt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedAsset.type === 'email' && (
                  <div className="space-y-6">
                    {selectedAsset.content.map((email: any, idx: number) => (
                      <div key={idx} className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] relative group">
                        <button
                          onClick={() => copyToClipboard(`Subject: ${email.subject}\nPreview: ${email.previewText}\n\n${email.body}\n\nCTA: ${email.cta}`, `email-${idx}`)}
                          className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                          title="Copy Email"
                        >
                          {copiedPrompt === `email-${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                        </button>
                        
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
                            {email.type}
                          </span>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-bold text-[var(--text-secondary)]">Subject: </span>
                              <span className="font-medium text-[var(--text-primary)]">{email.subject}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-bold text-[var(--text-secondary)]">Preview: </span>
                              <span className="text-[var(--text-secondary)]">{email.previewText}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)]">
                          <p className="text-sm whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">{email.body}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                          <p className="text-sm">
                            <span className="font-bold text-[var(--text-secondary)]">CTA: </span>
                            <span className="font-medium text-purple-600">{email.cta}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAsset.type === 'whatsapp' && (
                  <div className="space-y-6">
                    {selectedAsset.content.map((msg: any, idx: number) => (
                      <div key={idx} className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] relative group">
                        <button
                          onClick={() => copyToClipboard(msg.text, `whatsapp-${idx}`)}
                          className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                          title="Copy Message"
                        >
                          {copiedPrompt === `whatsapp-${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                        </button>
                        
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
                            {msg.angle}
                          </span>
                        </div>
                        
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)] mb-4">
                          <p className="text-sm whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">{msg.text}</p>
                        </div>

                        {msg.imageUrl && (
                          <div className="relative group/image rounded-xl overflow-hidden neon-border">
                            <img src={msg.imageUrl} alt={`WhatsApp visual ${idx + 1}`} className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
                            <button 
                              onClick={() => downloadImage(msg.imageUrl, `whatsapp-visual-${idx + 1}.png`)}
                              className="absolute bottom-4 right-4 p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-sm rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity"
                            >
                              <Download className="w-5 h-5 text-[var(--text-primary)]" />
                            </button>
                          </div>
                        )}
                        
                        {!msg.imageUrl && msg.imagePrompt && (
                          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image Prompt</span>
                              <button 
                                onClick={() => copyToClipboard(msg.imagePrompt, `whatsapp-prompt-${idx}`)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {copiedPrompt === `whatsapp-prompt-${idx}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                              </button>
                            </p>
                            <p className="text-[12px] text-[var(--text-primary)] font-medium leading-relaxed italic">{msg.imagePrompt}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedAsset.type === 'landing' && (
                  <div className="space-y-6">
                    {/* Hero Section */}
                    <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
                        Hero Section
                      </span>
                      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{selectedAsset.content.heroHeadline}</h1>
                      <p className="text-lg text-[var(--text-secondary)] mb-4">{selectedAsset.content.heroSubheadline}</p>
                      <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg">{selectedAsset.content.heroCTA}</button>
                    </div>

                    {/* Problem Agitation */}
                    <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-3">
                        Problem Agitation
                      </span>
                      <p className="text-[var(--text-primary)] leading-relaxed">{selectedAsset.content.problemAgitation}</p>
                    </div>

                    {/* Solution Presentation */}
                    <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
                        Solution Presentation
                      </span>
                      <p className="text-[var(--text-primary)] leading-relaxed">{selectedAsset.content.solutionPresentation}</p>
                    </div>

                    {/* Key Benefits */}
                    <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
                        Key Benefits
                      </span>
                      <ul className="list-disc pl-5 space-y-2 text-[var(--text-primary)]">
                        {selectedAsset.content.keyBenefits?.map((benefit: string, idx: number) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Testimonials */}
                    <div className="p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-3">
                        Social Proof
                      </span>
                      <div className="space-y-4">
                        {selectedAsset.content.testimonials?.map((testimonial: any, idx: number) => (
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
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
                        Final CTA
                      </span>
                      <div className="mt-2">
                        <button className="px-8 py-4 bg-black text-white font-bold rounded-xl text-lg w-full md:w-auto">
                          {selectedAsset.content.finalCTA}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedAsset.type === 'omnichannel' && (
                  <div className="space-y-8">
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        Core Campaign Foundation
                      </h3>
                      <div className="space-y-4">
                        <div><span className="font-bold text-[var(--text-secondary)]">Big Idea:</span> <span className="text-[var(--text-primary)]">{selectedAsset.content.coreCampaignFoundation?.bigIdea}</span></div>
                        <div><span className="font-bold text-[var(--text-secondary)]">Core Hook:</span> <span className="text-[var(--text-primary)]">{selectedAsset.content.coreCampaignFoundation?.coreHook}</span></div>
                        <div><span className="font-bold text-[var(--text-secondary)]">Unique Mechanism:</span> <span className="text-[var(--text-primary)]">{selectedAsset.content.coreCampaignFoundation?.uniqueMechanism}</span></div>
                        <div><span className="font-bold text-[var(--text-secondary)]">One-Line Promise:</span> <span className="text-[var(--text-primary)]">{selectedAsset.content.coreCampaignFoundation?.oneLinePromise}</span></div>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Top-of-Funnel Ads</h3>
                      <div className="space-y-4">
                        {selectedAsset.content.topOfFunnelAds?.map((ad: any, idx: number) => (
                          <div key={idx} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                            <div className="font-bold text-indigo-400 mb-2">{ad.hookType} Hook</div>
                            <div className="font-bold text-[var(--text-primary)] mb-1">{ad.headline}</div>
                            <div className="text-[var(--text-secondary)] whitespace-pre-wrap">{ad.primaryText}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Landing Page</h3>
                      <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] space-y-4">
                        <div className="text-center">
                          <div className="font-bold text-2xl text-[var(--text-primary)]">{selectedAsset.content.landingPage?.headline}</div>
                          <div className="text-lg text-[var(--text-secondary)]">{selectedAsset.content.landingPage?.subheadline}</div>
                        </div>
                        <div><span className="font-bold text-[var(--text-secondary)]">Problem:</span> <span className="text-[var(--text-primary)]">{selectedAsset.content.landingPage?.problemAmplification}</span></div>
                        <div><span className="font-bold text-[var(--text-secondary)]">Solution:</span> <span className="text-[var(--text-primary)]">{selectedAsset.content.landingPage?.solution}</span></div>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Email Drip</h3>
                      <div className="space-y-4">
                        {selectedAsset.content.emailDrip?.map((email: any, idx: number) => (
                          <div key={idx} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                            <div className="font-bold text-indigo-400 mb-2">Day {email.day}: {email.theme}</div>
                            <div className="font-bold text-[var(--text-primary)] mb-1">{email.subject}</div>
                            <div className="text-[var(--text-secondary)] whitespace-pre-wrap">{email.body}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedAsset.type === 'competitor-intelligence' && (
                  <div className="space-y-8">
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-rose-500" />
                        Competitor Analysis
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Main Hook & Promise</h4>
                          <p className="text-[var(--text-primary)] leading-relaxed">{selectedAsset.content.analysis.mainHook}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Weaknesses & Gaps</h4>
                          <ul className="list-disc pl-5 space-y-1 text-[var(--text-primary)]">
                            {selectedAsset.content.analysis.weaknesses.map((weakness: string, idx: number) => (
                              <li key={idx}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Missed Opportunities</h4>
                          <ul className="list-disc pl-5 space-y-1 text-[var(--text-primary)]">
                            {selectedAsset.content.analysis.missedOpportunities.map((opportunity: string, idx: number) => (
                              <li key={idx}>{opportunity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-violet-500" />
                        Superior Counter-Offers
                      </h3>
                      <div className="space-y-6">
                        {selectedAsset.content.counterOffers.map((offer: any, idx: number) => (
                          <div key={idx} className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                            <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">{offer.headline}</h4>
                            <p className="text-sm text-[var(--text-secondary)] mb-2"><span className="font-bold">Angle:</span> {offer.angle}</p>
                            <p className="text-sm text-[var(--text-primary)]"><span className="font-bold text-emerald-500">Why it wins:</span> {offer.whyItWins}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative group">
                      <button
                        onClick={() => copyToClipboard(selectedAsset.content.counterAdCopy, 'counter-ad-copy')}
                        className="absolute top-4 right-4 p-2 bg-[var(--bg-secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                        title="Copy Ad Copy"
                      >
                        {copiedPrompt === 'counter-ad-copy' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                      </button>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-orange-500" />
                        Counter-Ad Copy
                      </h3>
                      <div className="prose prose-emerald max-w-none text-[var(--text-primary)]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {selectedAsset.content.counterAdCopy}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
