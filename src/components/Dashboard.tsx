import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { AdSense } from './AdSense';
import { collection, query, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ChevronRight, BookOpen, Wrench, Newspaper, Loader2 } from 'lucide-react';

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

interface AdConfig {
  placementId: string;
  isVisible: boolean;
  name: string;
  adCode?: string;
}

export function Dashboard({ onNavigate, adConfigs }: { 
  onNavigate: (module: any, state?: any) => void;
  adConfigs: AdConfig[];
}) {
  const [latestCourses, setLatestCourses] = useState<LatestUpdate[]>([]);
  const [latestTools, setLatestTools] = useState<LatestUpdate[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<LatestUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qCourses = query(collection(db, 'learning'), orderBy('createdAt', 'desc'), limit(5));
    const unsubCourses = onSnapshot(qCourses, (snap) => {
      setLatestCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'course' } as LatestUpdate)));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    const qTools = query(collection(db, 'tools'), orderBy('createdAt', 'desc'), limit(5));
    const unsubTools = onSnapshot(qTools, (snap) => {
      setLatestTools(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'tool' } as LatestUpdate)));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    const qBlogs = query(collection(db, 'blog'), orderBy('createdAt', 'desc'), limit(5));
    const unsubBlogs = onSnapshot(qBlogs, (snap) => {
      setLatestBlogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'blog' } as LatestUpdate)));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => {
      unsubCourses();
      unsubTools();
      unsubBlogs();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Ad Slot */}
      {(adConfigs.find(c => c.placementId === 'dashboard_top')?.isVisible !== false) && (
        <AdSense 
          adSlot="DASHBOARD_TOP_AD" 
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl my-2"
          adCode={adConfigs.find(c => c.placementId === 'dashboard_top')?.adCode}
        />
      )}

      {/* Latest Updates Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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

    </div>
  );
}
