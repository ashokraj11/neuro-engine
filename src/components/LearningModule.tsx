import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Play, BookOpen, Clock, Download, Users, Star, ArrowRight, Loader2, FileText, Award, Zap, Wrench, Newspaper, FileDown, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  youtubeUrl?: string;
  targetLink?: string;
  category: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  link: string;
  imageUrl?: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  size: string;
  downloadUrl: string;
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  content: string;
}

type TabType = 'video' | 'tools' | 'templates' | 'blog';

export function LearningModule() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<TabType>('video');

  useEffect(() => {
    const q = query(collection(db, 'learning'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(docs);
    }, (error) => {
      console.error(error);
    });

    const qTools = query(collection(db, 'tools'), orderBy('createdAt', 'desc'));
    const unsubscribeTools = onSnapshot(qTools, (snapshot) => {
      setTools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool)));
    }, (error) => console.error(error));

    const qTemplates = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
    const unsubscribeTemplates = onSnapshot(qTemplates, (snapshot) => {
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template)));
    }, (error) => console.error(error));

    const qBlog = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsubscribeBlog = onSnapshot(qBlog, (snapshot) => {
      setBlogPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeTools();
      unsubscribeTemplates();
      unsubscribeBlog();
    };
  }, []);

  const handleCourseClick = async (courseId: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'course_clicks'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        courseId: courseId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category))).filter(Boolean)];

  const tabs = [
    { id: 'video', name: 'Video Training', icon: Play },
    { id: 'tools', name: 'Tools', icon: Wrench },
    { id: 'templates', name: 'Templates & PDF', icon: FileDown },
    { id: 'blog', name: 'Blog', icon: Newspaper },
  ];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'video' && (
            <div className="space-y-12">
              {/* Featured Course */}
              {courses.length > 0 && (
                <section>
                  <div className="relative h-[400px] rounded-[40px] overflow-hidden neon-border">
                    <img 
                      src={courses[0].thumbnailUrl || undefined} 
                      alt="Featured Course"
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-12">
                      <div className="flex items-center gap-2 text-cyan-400 mb-4">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-widest">Featured Course</span>
                      </div>
                      <h2 className="text-4xl font-bold text-white mb-4 max-w-xl leading-tight">
                        {courses[0].title}
                      </h2>
                      <p className="text-gray-300 mb-8 max-w-lg">
                        {courses[0].description}
                      </p>
                      <div className="flex gap-4">
                        <a 
                          href={courses[0].youtubeUrl || courses[0].targetLink || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-8 py-4 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                          <Play className="w-5 h-5" />
                          Start Learning
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Course Grid */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">All Training Modules</h3>
                  <div className="relative w-48">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 outline-none appearance-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                    <BookOpen className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-20" />
                    <p className="text-[var(--text-secondary)]">No courses found in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-[var(--bg-secondary)] rounded-[32px] overflow-hidden border border-[var(--border-color)] hover:border-cyan-500/50 transition-all"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={course.thumbnailUrl || undefined} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                            {course.category}
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-cyan-500 transition-colors">
                            {course.title}
                          </h4>
                          <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                              <span className="flex items-center gap-1.5 text-cyan-500">
                                <Play className="w-3 h-3" />
                                Watch Now
                              </span>
                            </div>
                            <a 
                              href={course.youtubeUrl || course.targetLink || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={() => handleCourseClick(course.id)}
                              className="p-2 bg-[var(--bg-primary)] rounded-xl hover:bg-cyan-500 hover:text-white transition-all"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool, index) => {
                const IconComponent = tool.icon === 'Zap' ? Zap : tool.icon === 'Wrench' ? Wrench : tool.icon === 'FileText' ? FileText : tool.icon === 'Clock' ? Clock : Zap;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-[var(--bg-secondary)] rounded-[32px] overflow-hidden border border-[var(--border-color)] hover:border-cyan-500/50 transition-all shadow-xl hover:shadow-cyan-500/10"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={tool.imageUrl || 'https://picsum.photos/seed/tool/800/450'} 
                        alt={tool.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-cyan-500 transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-2">
                        {tool.description}
                      </p>
                      <a 
                        href={tool.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between py-3 px-4 bg-[var(--bg-primary)] rounded-2xl text-sm font-bold text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all"
                      >
                        Open Tool
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
              {tools.length === 0 && (
                <div className="col-span-full text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                  <Wrench className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-20" />
                  <p className="text-[var(--text-secondary)]">No tools available yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                      <FileDown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">{template.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{template.type} • {template.size}</p>
                    </div>
                  </div>
                  <a href={template.downloadUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-[var(--bg-primary)] rounded-xl hover:bg-cyan-500 hover:text-white transition-all">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                  <FileDown className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-20" />
                  <p className="text-[var(--text-secondary)]">No templates available yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blog' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="group cursor-pointer"
                  onClick={() => setSelectedBlogPost(post)}
                >
                  <div className="aspect-video rounded-3xl overflow-hidden mb-6 neon-border">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs font-bold text-cyan-500 uppercase tracking-widest">
                      <span>{post.author}</span>
                    </div>
                    <h4 className="text-2xl font-bold group-hover:text-cyan-500 transition-colors">{post.title}</h4>
                    <div className="text-[var(--text-secondary)] line-clamp-3 text-sm prose prose-invert prose-sm max-w-none prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-a:no-underline">
                      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</Markdown>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold pt-4 text-cyan-500 group-hover:gap-3 transition-all">
                      Read Article <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
              {blogPosts.length === 0 && (
                <div className="col-span-full text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                  <Newspaper className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-20" />
                  <p className="text-[var(--text-secondary)]">No blog posts available yet.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Blog Post Modal */}
      <AnimatePresence>
        {selectedBlogPost && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedBlogPost(null)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-4xl bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden neon-border max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)] sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold line-clamp-1">{selectedBlogPost.title}</h3>
                    <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest">{selectedBlogPost.author}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBlogPost(null)} 
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-xl">
                  <img src={selectedBlogPost.imageUrl} alt={selectedBlogPost.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="prose prose-invert prose-emerald max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-a:no-underline prose-img:rounded-2xl">
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {selectedBlogPost.content}
                  </Markdown>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
