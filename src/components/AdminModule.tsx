import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, getDocs, setDoc } from 'firebase/firestore';
import { Plus, Pencil, Trash2, Youtube, Link as LinkIcon, Image as ImageIcon, Save, X, Loader2, Upload, CheckCircle2, Users, User as UserIcon, Wrench, FileDown, Copy, ShieldCheck, HelpCircle, Eye, EyeOff, Search, MessageSquare, Sparkles } from 'lucide-react';
import { AdminMessagesModule } from './AdminMessagesModule';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import firebaseConfig from '../../firebase-applet-config.json';
import { MODULE_LIST } from '../constants/modules';
import { cn } from '../lib/utils';

interface ModuleVisibility {
  id: string;
  isVisibleForAll: boolean;
  visibleForUsers: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  targetLink: string;
  category: string;
}

interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  role?: 'master' | 'sub' | 'user';
}

interface Click {
  userId: string;
  courseId?: string;
  toolId?: string;
  generatorId?: string;
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

interface AdConfig {
  placementId: string;
  isVisible: boolean;
  name: string;
  adCode?: string;
}

interface SEOConfig {
  googleVerification?: string;
  googleAnalyticsId?: string;
  robotsTxt?: string;
  sitemapUrl?: string;
}

export function AdminModule({ isMaster }: { isMaster: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibility[]>([]);
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([]);

  const [showUserList, setShowUserList] = useState(false);
  const [showEngagement, setShowEngagement] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'courses' | 'users' | 'tools' | 'templates' | 'blog' | 'system' | 'modules' | 'ads' | 'messages' | 'seo'>('courses');
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'messages'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadMessages(snapshot.docs.filter(doc => !doc.data().read).length);
    }, (error) => {
      console.error("Error fetching unread messages count:", error);
    });
    return () => unsubscribe();
  }, []);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [editingTool, setEditingTool] = useState<Partial<Tool> | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<string | null>(null);
  const [deleteToolConfirmId, setDeleteToolConfirmId] = useState<string | null>(null);
  const [deleteTemplateConfirmId, setDeleteTemplateConfirmId] = useState<string | null>(null);
  const [deleteBlogConfirmId, setDeleteBlogConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [blogPreview, setBlogPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolImageInputRef = useRef<HTMLInputElement>(null);
  const blogImageInputRef = useRef<HTMLInputElement>(null);
  const blogContentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const q = query(collection(db, 'learning'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email,
        phoneNumber: doc.data().phoneNumber
      } as User)));
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    const qClicks = query(collection(db, 'course_clicks'));
    const unsubscribeClicks = onSnapshot(qClicks, (snapshot) => {
      setClicks(prev => [...prev.filter(c => !c.courseId), ...snapshot.docs.map(doc => ({
        userId: doc.data().userId,
        courseId: doc.data().courseId
      } as Click))]);
    }, (error) => {
      console.error("Error fetching clicks:", error);
    });

    const qToolClicks = query(collection(db, 'tool_clicks'));
    const unsubscribeToolClicks = onSnapshot(qToolClicks, (snapshot) => {
      setClicks(prev => [...prev.filter(c => !c.toolId), ...snapshot.docs.map(doc => ({
        userId: doc.data().userId,
        toolId: doc.data().toolId
      } as Click))]);
    }, (error) => {
      console.error("Error fetching tool clicks:", error);
    });

    const qGeneratorClicks = query(collection(db, 'generator_clicks'));
    const unsubscribeGeneratorClicks = onSnapshot(qGeneratorClicks, (snapshot) => {
      setClicks(prev => [...prev.filter(c => !c.generatorId), ...snapshot.docs.map(doc => ({
        userId: doc.data().userId,
        generatorId: doc.data().generatorId
      } as Click))]);
    }, (error) => {
      console.error("Error fetching generator clicks:", error);
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
      unsubscribeUsers();
      unsubscribeClicks();
      unsubscribeToolClicks();
      unsubscribeGeneratorClicks();
      unsubscribeAdConfigs();
    };
  }, []);

  useEffect(() => {
    const qTools = query(collection(db, 'tools'), orderBy('createdAt', 'desc'));
    const unsubscribeTools = onSnapshot(qTools, (snapshot) => {
      setTools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tools'));

    const qTemplates = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
    const unsubscribeTemplates = onSnapshot(qTemplates, (snapshot) => {
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'templates'));

    const qBlog = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsubscribeBlog = onSnapshot(qBlog, (snapshot) => {
      setBlogPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'blog'));

    const qModules = query(collection(db, 'module_visibility'));
    const unsubscribeModules = onSnapshot(qModules, (snapshot) => {
      setModuleVisibility(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ModuleVisibility)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'module_visibility'));

    return () => {
      unsubscribeTools();
      unsubscribeTemplates();
      unsubscribeBlog();
      unsubscribeModules();
    };
  }, []);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; size: string } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Size Validation
    if (file.size > 500 * 1024) {
      setNotification({ message: "Image is too large. Please select an image under 500KB.", type: 'error' });
      return;
    }

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';

    setUploadingImage(true);
    setUploadSuccess(false);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result;
        
        // 2. Resolution Validation
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          
          if (width < 400 || height < 200) {
            setNotification({ 
              message: `Image resolution is too low (${width}x${height}). Please use at least 1280x720 for best quality.`, 
              type: 'error' 
            });
            setUploadingImage(false);
            return;
          }

          setImageMeta({ width, height, size: sizeStr });
          setEditingCourse(prev => prev ? { ...prev, thumbnailUrl: base64 } : null);
          setUploadingImage(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
        };
        img.onerror = () => {
          setNotification({ message: "Failed to process image resolution.", type: 'error' });
          setUploadingImage(false);
        };
        img.src = base64;
      }
    };
    reader.onerror = () => {
      setNotification({ message: "Failed to read image file.", type: 'error' });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleToolImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotification({ message: "Image size must be less than 2MB.", type: 'error' });
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditingTool(prev => prev ? { ...prev, imageUrl: base64 } : null);
      setUploadingImage(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleBlogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotification({ message: "Image size must be less than 2MB.", type: 'error' });
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditingBlogPost(prev => prev ? { ...prev, imageUrl: base64 } : null);
      setUploadingImage(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleTextSelection = () => {
    if (!blogContentRef.current) return;
    const textarea = blogContentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      // Calculate position (simplified for now, appearing above the textarea)
      // In a real app, you'd use a mirror div to find exact coordinates
      const rect = textarea.getBoundingClientRect();
      setToolbarPos({
        top: rect.top - 40,
        left: rect.left + 20
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  };

  const handleAddLink = () => {
    if (!blogContentRef.current) return;
    const textarea = blogContentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      setNotification({ message: "Please select the text you want to hyperlink first.", type: 'error' });
      return;
    }
    
    setSelectionRange({ start, end });
    setShowLinkInput(true);
    setShowFloatingToolbar(false);
    setLinkUrl('https://');
  };

  const confirmAddLink = () => {
    if (!blogContentRef.current || !selectionRange) return;
    const textarea = blogContentRef.current;
    const { start, end } = selectionRange;
    const selectedText = textarea.value.substring(start, end);
    
    if (!selectedText) {
      setShowLinkInput(false);
      setSelectionRange(null);
      return;
    }

    // Using anchor tag as requested by user
    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
    const newText = textarea.value.substring(0, start) + 
                    linkHtml + 
                    textarea.value.substring(end);
    
    setEditingBlogPost(prev => prev ? { ...prev, content: newText } : null);
    setShowLinkInput(false);
    setSelectionRange(null);
    setShowFloatingToolbar(false); // Explicitly hide toolbar
    
    setTimeout(() => {
      textarea.focus();
      // Move cursor to the end of the inserted link to prevent re-triggering the toolbar
      const newCursorPos = start + linkHtml.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = async () => {
    console.log("Save initiated. Current editingCourse:", editingCourse);
    
    if (!editingCourse) {
      console.error("No course data to save.");
      return;
    }

    const title = editingCourse.title?.trim();
    const description = editingCourse.description?.trim();
    const thumbnailUrl = editingCourse.thumbnailUrl;

    if (!title || !description || !thumbnailUrl) {
      const missing = [];
      if (!title) missing.push("Title");
      if (!description) missing.push("Description");
      if (!thumbnailUrl) missing.push("Thumbnail Image");
      setNotification({ message: `Please fill in all required fields: ${missing.join(", ")}.`, type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const { id, ...data } = editingCourse;
      
      const courseData: any = {
        title: title,
        description: description,
        thumbnailUrl: thumbnailUrl,
        category: data.category?.trim() || 'General',
        youtubeUrl: data.youtubeUrl?.trim() || '',
        targetLink: data.targetLink?.trim() || '',
      };

      console.log("Prepared courseData for Firestore:", courseData);

      if (id) {
        console.log("Updating existing course with ID:", id);
        await updateDoc(doc(db, 'learning', id), courseData);
        setNotification({ message: "Course updated successfully!", type: 'success' });
      } else {
        console.log("Creating new course...");
        courseData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'learning'), courseData);
        console.log("New course created with ID:", docRef.id);
        setNotification({ message: "Course created successfully!", type: 'success' });
      }
      
      setEditingCourse(null);
      setImageMeta(null);
    } catch (error: any) {
      console.error("CRITICAL ERROR saving course:", error);
      let errorMsg = error.message || "Unknown error occurred.";
      
      if (errorMsg.includes("permission-denied")) {
        errorMsg = "Permission denied. You might not have admin rights or the data format is invalid according to security rules.";
      } else if (errorMsg.includes("quota-exceeded")) {
        errorMsg = "Firestore quota exceeded. Please try again later.";
      }

      setNotification({ message: "Failed to save course: " + errorMsg, type: 'error' });
      
      try {
        handleFirestoreError(error, OperationType.WRITE, 'learning');
      } catch (e) {
        // Error already handled/logged
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Attempting to delete course with ID:", id);
      await deleteDoc(doc(db, 'learning', id));
      console.log("Course deleted successfully.");
      setNotification({ message: "Course deleted successfully!", type: 'success' });
      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error("CRITICAL ERROR deleting course:", error);
      let errorMsg = error.message || "Unknown error occurred.";
      
      if (errorMsg.includes("permission-denied")) {
        errorMsg = "Permission denied. You might not have admin rights to delete this content.";
      }

      setNotification({ message: "Failed to delete course: " + errorMsg, type: 'error' });
      setDeleteConfirmId(null);
      
      try {
        handleFirestoreError(error, OperationType.DELETE, `learning/${id}`);
      } catch (e) {
        // Error already handled/logged
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setNotification({ message: "User deleted successfully!", type: 'success' });
    } catch (error: any) {
      setNotification({ message: "Failed to delete user: " + error.message, type: 'error' });
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser || !editingUser.email) return;
    
    const isDuplicate = users.some(u => u.email === editingUser.email && u.id !== editingUser.id);
    if (isDuplicate) {
      setNotification({ message: "User with this email already exists!", type: 'error' });
      return;
    }

    setSavingUser(true);
    try {
      if (editingUser.id) {
        await updateDoc(doc(db, 'users', editingUser.id), {
          email: editingUser.email,
          phoneNumber: editingUser.phoneNumber || ''
        });
        setNotification({ message: "User updated successfully!", type: 'success' });
      } else {
        const newUserRef = doc(collection(db, 'users'));
        await setDoc(newUserRef, {
          uid: newUserRef.id,
          email: editingUser.email,
          phoneNumber: editingUser.phoneNumber || '',
          role: 'user',
          createdAt: serverTimestamp()
        });
        setNotification({ message: "User created successfully!", type: 'success' });
      }
      setEditingUser(null);
    } catch (error: any) {
      setNotification({ message: "Failed to save user: " + error.message, type: 'error' });
    } finally {
      setSavingUser(false);
    }
  };

  const handleSaveTool = async () => {
    if (!editingTool || !editingTool.name || !editingTool.description || !editingTool.link || !editingTool.imageUrl) {
      const missing = [];
      if (!editingTool?.name) missing.push("Name");
      if (!editingTool?.description) missing.push("Description");
      if (!editingTool?.link) missing.push("Target Link");
      if (!editingTool?.imageUrl) missing.push("Cover Image");
      setNotification({ message: `Please fill in all required fields: ${missing.join(", ")}.`, type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const data = { ...editingTool, createdAt: serverTimestamp() };
      if (editingTool.id) {
        const { id, ...rest } = data;
        await updateDoc(doc(db, 'tools', id), rest);
      } else {
        await addDoc(collection(db, 'tools'), data);
      }
      setEditingTool(null);
      setNotification({ message: "Tool saved successfully!", type: 'success' });
    } catch (error: any) {
      setNotification({ message: "Error saving tool: " + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name) return;
    setSaving(true);
    try {
      const data = { ...editingTemplate, createdAt: serverTimestamp() };
      if (editingTemplate.id) {
        const { id, ...rest } = data;
        await updateDoc(doc(db, 'templates', id), rest);
      } else {
        await addDoc(collection(db, 'templates'), data);
      }
      setEditingTemplate(null);
      setNotification({ message: "Template saved successfully!", type: 'success' });
    } catch (error: any) {
      setNotification({ message: "Error saving template: " + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBlogPost = async () => {
    if (!editingBlogPost || !editingBlogPost.title || !editingBlogPost.content || !editingBlogPost.imageUrl) {
      const missing = [];
      if (!editingBlogPost?.title) missing.push("Title");
      if (!editingBlogPost?.content) missing.push("Content");
      if (!editingBlogPost?.imageUrl) missing.push("Cover Image");
      setNotification({ message: `Please fill in all required fields: ${missing.join(", ")}.`, type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const data = { ...editingBlogPost, createdAt: serverTimestamp() };
      // Remove date if it exists in the data object to be saved
      if ('date' in data) delete (data as any).date;
      
      if (editingBlogPost.id) {
        const { id, ...rest } = data;
        await updateDoc(doc(db, 'blog', id), rest);
      } else {
        await addDoc(collection(db, 'blog'), data);
      }
      setEditingBlogPost(null);
      setShowLinkInput(false);
      setNotification({ message: "Blog post saved successfully!", type: 'success' });
    } catch (error: any) {
      setNotification({ message: "Error saving blog post: " + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      setNotification({ message: "Item deleted successfully!", type: 'success' });
    } catch (error: any) {
      setNotification({ message: "Error deleting item: " + error.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 border-b border-[var(--border-color)]">
        <button onClick={() => setActiveAdminTab('courses')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'courses' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Courses</button>
        <button onClick={() => setActiveAdminTab('tools')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'tools' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Tools</button>
        <button onClick={() => setActiveAdminTab('templates')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'templates' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Templates</button>
        <button onClick={() => setActiveAdminTab('blog')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'blog' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Blog</button>
        <button onClick={() => setActiveAdminTab('modules')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'modules' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Module Manager</button>
        <button onClick={() => setActiveAdminTab('ads')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'ads' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Ads Control</button>
        <button onClick={() => setActiveAdminTab('messages')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'messages' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} flex items-center gap-2`}>
          Messages
          {unreadMessages > 0 && <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unreadMessages}</span>}
        </button>
        <button onClick={() => setActiveAdminTab('system')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'system' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>System Info</button>
        <button onClick={() => setActiveAdminTab('seo')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'seo' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} flex items-center gap-2`}>
          <Search className="w-4 h-4" />
          SEO
        </button>
        {isMaster && (
          <button onClick={() => setActiveAdminTab('users')} className={`pb-4 px-2 font-bold transition-all ${activeAdminTab === 'users' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Users</button>
        )}
      </div>

      {activeAdminTab === 'courses' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Learning Content</h2>
            <button
              onClick={() => setEditingCourse({
                title: '',
                description: '',
                thumbnailUrl: '',
                youtubeUrl: '',
                targetLink: '',
                category: 'General'
              })}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Course
            </button>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-[var(--bg-secondary)] rounded-3xl neon-border overflow-hidden group">
            <div className="aspect-video relative">
              <img src={course.thumbnailUrl || undefined} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => setEditingCourse(course)}
                  className="p-3 bg-white text-black rounded-full hover:bg-cyan-500 hover:text-white transition-all"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(course.id)}
                  className="p-3 bg-white text-black rounded-full hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-2">{course.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{course.description}</p>
            </div>
          </div>
        ))}
      </div>
        </>
      )}

      {activeAdminTab === 'users' && (
        <>
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-500" />
            User Management
          </h3>
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-all"
          >
            {showUserList ? 'Hide Users' : 'View all Users'}
          </button>
        </div>
        {showUserList && (
          <div className="bg-[var(--bg-secondary)] rounded-3xl neon-border overflow-hidden">
            <div className="p-4 flex justify-end">
              <button onClick={() => setEditingUser({ email: '', phoneNumber: '' })} className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-primary)] text-[var(--text-secondary)] uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Mobile Number</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                    <td className="px-6 py-4 text-[var(--text-primary)]">{user.email}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{user.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingUser(user)} className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4 text-cyan-500" />
                        </button>
                        <button onClick={() => setDeleteUserConfirmId(user.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-500" />
              User Engagement
            </h3>
            <button
              onClick={() => setShowEngagement(!showEngagement)}
              className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-all"
            >
              {showEngagement ? 'Hide Engagement' : 'View User Engagement'}
            </button>
          </div>
          {showEngagement && (
            <div className="bg-[var(--bg-secondary)] rounded-3xl neon-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-primary)] text-[var(--text-secondary)] uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Total Clicks</th>
                    <th className="px-6 py-4">Course Engagement</th>
                    <th className="px-6 py-4">Tool Engagement</th>
                    <th className="px-6 py-4">Generator Engagement</th>
                    <th className="px-6 py-4">Most Interested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {users.map((user) => {
                    const userClicks = clicks.filter(c => c.userId === user.id);
                    const courseCounts: { [courseId: string]: number } = {};
                    const toolCounts: { [toolId: string]: number } = {};
                    const generatorCounts: { [generatorId: string]: number } = {};
                    userClicks.forEach(c => {
                      if (c.courseId) courseCounts[c.courseId] = (courseCounts[c.courseId] || 0) + 1;
                      if (c.toolId) toolCounts[c.toolId] = (toolCounts[c.toolId] || 0) + 1;
                      if (c.generatorId) generatorCounts[c.generatorId] = (generatorCounts[c.generatorId] || 0) + 1;
                    });
                    
                    let mostInterestedCourseId = '';
                    let maxClicks = 0;
                    Object.entries(courseCounts).forEach(([courseId, count]) => {
                      if (count > maxClicks) {
                        maxClicks = count;
                        mostInterestedCourseId = courseId;
                      }
                    });

                    const mostInterestedCourse = courses.find(c => c.id === mostInterestedCourseId);

                    return (
                      <tr key={user.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                        <td className="px-6 py-4 text-[var(--text-primary)]">{user.email}</td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">{userClicks.length}</td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                          {Object.entries(courseCounts).map(([courseId, count]) => {
                            const course = courses.find(c => c.id === courseId);
                            return (
                              <div key={courseId} className="text-xs">
                                {course?.title || 'Unknown'}: {count}
                              </div>
                            );
                          })}
                          {Object.keys(courseCounts).length === 0 && 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                          {Object.entries(toolCounts).map(([toolId, count]) => {
                            const tool = tools.find(t => t.id === toolId);
                            return (
                              <div key={toolId} className="text-xs">
                                {tool?.name || 'Unknown'}: {count}
                              </div>
                            );
                          })}
                          {Object.keys(toolCounts).length === 0 && 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                          {Object.entries(generatorCounts).map(([generatorId, count]) => {
                            return (
                              <div key={generatorId} className="text-xs">
                                {generatorId}: {count}
                              </div>
                            );
                          })}
                          {Object.keys(generatorCounts).length === 0 && 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">{mostInterestedCourse?.title || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )}

      {activeAdminTab === 'tools' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Tools</h2>
            <button
              onClick={() => setEditingTool({ name: '', description: '', icon: 'Zap', link: '' })}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Tool
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden group">
                <div className="aspect-video relative">
                  <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => setEditingTool(tool)} className="p-2 bg-white/90 text-cyan-500 rounded-lg shadow-sm hover:bg-white transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteToolConfirmId(tool.id)} className="p-2 bg-white/90 text-red-500 rounded-lg shadow-sm hover:bg-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)]">{tool.name}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Templates</h2>
            <button
              onClick={() => setEditingTemplate({ name: '', type: 'PDF', size: '', downloadUrl: '' })}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Template
            </button>
          </div>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <FileDown className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h4 className="font-bold text-sm">{template.name}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase">{template.type} • {template.size}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingTemplate(template)} className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTemplateConfirmId(template.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Blog</h2>
            <button
              onClick={() => setEditingBlogPost({ title: '', author: '', imageUrl: '', content: '' })}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Post
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
                <div className="aspect-video relative">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => setEditingBlogPost(post)} className="p-2 bg-white/90 text-cyan-500 rounded-lg shadow-sm"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteBlogConfirmId(post.id)} className="p-2 bg-white/90 text-red-500 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold mb-1">{post.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">By {post.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Module Manager</h2>
            <p className="text-sm text-[var(--text-secondary)]">Control module visibility in the sidebar.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MODULE_LIST.map((module) => {
              const visibility = moduleVisibility.find(v => v.id === module.id) || {
                id: module.id,
                isVisibleForAll: true,
                visibleForUsers: []
              };

              const toggleVisibility = async () => {
                try {
                  await setDoc(doc(db, 'module_visibility', module.id), {
                    ...visibility,
                    isVisibleForAll: !visibility.isVisibleForAll
                  });
                  setNotification({ message: `${module.name} visibility updated!`, type: 'success' });
                } catch (error: any) {
                  handleFirestoreError(error, OperationType.WRITE, `module_visibility/${module.id}`);
                }
              };

              const toggleUserAccess = async (userId: string) => {
                const isVisible = visibility.visibleForUsers.includes(userId);
                const newList = isVisible 
                  ? visibility.visibleForUsers.filter(id => id !== userId)
                  : [...visibility.visibleForUsers, userId];
                
                try {
                  await setDoc(doc(db, 'module_visibility', module.id), {
                    ...visibility,
                    visibleForUsers: newList
                  });
                } catch (error: any) {
                  handleFirestoreError(error, OperationType.WRITE, `module_visibility/${module.id}`);
                }
              };

              return (
                <div key={module.id} className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)] neon-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                        <module.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)]">{module.name}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">{module.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-secondary)]">Visible for All</span>
                        <button
                          onClick={toggleVisibility}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            visibility.isVisibleForAll ? "bg-cyan-500" : "bg-gray-600"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                            visibility.isVisibleForAll ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {!visibility.isVisibleForAll && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-widest text-cyan-500">Selective Access</h5>
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-secondary)]" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full pl-8 pr-4 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {users
                          .filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()))
                          .map(u => (
                            <button
                              key={u.id}
                              onClick={() => toggleUserAccess(u.id)}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left",
                                visibility.visibleForUsers.includes(u.id)
                                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-500"
                                  : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/30"
                              )}
                            >
                              <span className="text-[10px] font-medium truncate max-w-[150px]">{u.email}</span>
                              {visibility.visibleForUsers.includes(u.id) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 opacity-50" />}
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeAdminTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ads Placement Control</h2>
            <p className="text-sm text-[var(--text-secondary)]">Enable or disable AdSense placements across the app.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'global_adsense_script', name: 'Global AdSense Activation Script' },
              { id: 'dashboard_top', name: 'Dashboard Top Ad' },
              { id: 'sidebar_bottom', name: 'Sidebar Bottom Ad' },
              { id: 'footer_ad', name: 'Footer Ad' },
              { id: 'blog_sidebar', name: 'Blog Sidebar Ad' },
              { id: 'generator_bottom', name: 'Generator Bottom Ad' }
            ].map((placement) => {
              const config = adConfigs.find(c => c.placementId === placement.id) || {
                placementId: placement.id,
                isVisible: true,
                name: placement.name,
                adCode: ''
              };

              const updateAdConfig = async (updates: Partial<AdConfig>) => {
                try {
                  await setDoc(doc(db, 'ad_config', placement.id), {
                    placementId: placement.id,
                    name: placement.name,
                    isVisible: config.isVisible,
                    adCode: config.adCode || '',
                    ...updates,
                    updatedAt: serverTimestamp()
                  });
                  setNotification({ message: `${placement.name} updated!`, type: 'success' });
                } catch (error: any) {
                  handleFirestoreError(error, OperationType.WRITE, `ad_config/${placement.id}`);
                }
              };

              return (
                <div key={placement.id} className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)] neon-border flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">{placement.name}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{placement.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest">Ad Code Snippet</label>
                    <textarea
                      value={config.adCode || ''}
                      onChange={(e) => updateAdConfig({ adCode: e.target.value })}
                      className="w-full h-24 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[10px] font-mono"
                      placeholder="Paste <script> and <div> here..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                      Status: <span className={cn("font-bold", config.isVisible ? "text-emerald-500" : "text-red-500")}>
                        {config.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </span>
                    <button
                      onClick={() => updateAdConfig({ isVisible: !config.isVisible })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        config.isVisible ? "bg-cyan-500" : "bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        config.isVisible ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeAdminTab === 'messages' && <AdminMessagesModule />}
      {activeAdminTab === 'seo' && <AdminSEOModule />}
      {activeAdminTab === 'system' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">System Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] neon-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">OAuth & Security</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Manage secure redirects and authentication.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2 tracking-widest">App URL (Origin)</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/20 p-2 rounded-lg text-xs font-mono text-cyan-500 break-all">
                      {window.location.origin}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin);
                        setNotification({ message: 'URL copied to clipboard', type: 'success' });
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2 tracking-widest">Firebase Redirect URI</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/20 p-2 rounded-lg text-xs font-mono text-cyan-500 break-all">
                      {`https://${firebaseConfig.projectId || 'project-905733d7-28a2-43ce-9c2'}.firebaseapp.com/__/auth/handler`}
                    </code>
                    <button 
                      onClick={() => {
                        const url = `https://${firebaseConfig.projectId || 'project-905733d7-28a2-43ce-9c2'}.firebaseapp.com/__/auth/handler`;
                        navigator.clipboard.writeText(url);
                        setNotification({ message: 'URL copied to clipboard', type: 'success' });
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <h4 className="text-sm font-bold text-amber-500 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Setup Instructions
                  </h4>
                  <ol className="text-xs text-[var(--text-secondary)] space-y-2 list-decimal ml-4">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Google Cloud Console</a>.</li>
                    <li>Select your project and edit your OAuth 2.0 Client ID.</li>
                    <li>Add the <strong>App URL</strong> to "Authorized JavaScript origins".</li>
                    <li>Add the <strong>Firebase Redirect URI</strong> to "Authorized redirect URIs".</li>
                    <li>Save changes and wait a few minutes for propagation.</li>
                  </ol>
                </div>

                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                  <h4 className="text-sm font-bold text-purple-500 mb-2 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Database Backup & Restore
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">Export your database to JSON or restore from a previous export.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        const collections = ['learning', 'users', 'course_clicks', 'tools', 'templates', 'blog'];
                        const backup: any = {};
                        for (const col of collections) {
                          const snapshot = await getDocs(collection(db, col));
                          backup[col] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        }
                        const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `backup-${new Date().toISOString()}.json`;
                        a.click();
                        setNotification({ message: 'Backup exported successfully!', type: 'success' });
                      }}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all text-xs"
                    >
                      Export JSON
                    </button>
                    <label className="flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-all text-xs cursor-pointer text-center">
                      Import JSON
                      <input type="file" accept=".json" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          try {
                            const backup = JSON.parse(event.target?.result as string);
                            for (const [col, docs] of Object.entries(backup) as any) {
                              for (const docData of docs) {
                                const { id, ...data } = docData;
                                await setDoc(doc(db, col, id), data);
                              }
                            }
                            setNotification({ message: 'Restore completed successfully!', type: 'success' });
                          } catch (e) {
                            setNotification({ message: 'Failed to restore: ' + e, type: 'error' });
                          }
                        };
                        reader.readAsText(file);
                      }} />
                    </label>
                  </div>
                  <p className="mt-4 text-[10px] text-[var(--text-secondary)]">For large datasets, use the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Firebase Console</a> for managed backups.</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] neon-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-2xl">
                  <Wrench className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Environment Variables</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Required keys for full functionality.</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'VITE_FIREBASE_API_KEY', status: 'Configured' },
                  { name: 'VITE_FIREBASE_PROJECT_ID', status: 'Configured' },
                  { name: 'GEMINI_API_KEY', status: 'Platform Managed' }
                ].map(env => (
                  <div key={env.name} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                    <code className="text-[10px] font-mono text-[var(--text-secondary)]">{env.name}</code>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{env.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden neon-border max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {editingUser.id ? 'Edit User' : 'New User'}
                </h3>
                <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editingUser.phoneNumber || ''}
                    onChange={e => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={savingUser}
                  className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingUser.id ? 'Update User' : 'Create User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tool Edit Modal */}
      <AnimatePresence>
        {editingTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingTool(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden neon-border max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingTool.id ? 'Edit Tool' : 'New Tool'}</h3>
                <button onClick={() => setEditingTool(null)} className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Name *</label>
                      <input type="text" value={editingTool.name || ''} onChange={e => setEditingTool({ ...editingTool, name: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Description *</label>
                      <textarea value={editingTool.description || ''} onChange={e => setEditingTool({ ...editingTool, description: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm h-32 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Target Link *</label>
                      <input type="text" value={editingTool.link || ''} onChange={e => setEditingTool({ ...editingTool, link: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Icon Name (Lucide)</label>
                      <input type="text" value={editingTool.icon || ''} onChange={e => setEditingTool({ ...editingTool, icon: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="Zap, Wrench, etc." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Cover Image *</label>
                    <div 
                      className={`aspect-video bg-[var(--bg-primary)] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 ${
                        uploadSuccess ? 'border-emerald-500/50 ring-4 ring-emerald-500/10' : 'border-[var(--border-color)]'
                      }`}
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                      ) : editingTool.imageUrl ? (
                        <>
                          <img src={editingTool.imageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                              onClick={() => toolImageInputRef.current?.click()}
                              className="p-2 bg-white text-black rounded-full hover:bg-cyan-500 hover:text-white transition-all"
                            >
                              <Upload className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingTool({ ...editingTool, imageUrl: '' })}
                              className="p-2 bg-white text-black rounded-full hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => toolImageInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 text-[var(--text-secondary)] hover:text-cyan-500 transition-colors"
                        >
                          <Upload className="w-8 h-8" />
                          <span className="text-xs font-bold">Upload Cover Image</span>
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={toolImageInputRef} 
                      onChange={handleToolImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex gap-3">
                <button onClick={() => setEditingTool(null)} className="flex-1 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-primary)] transition-colors">Cancel</button>
                <button onClick={handleSaveTool} disabled={saving} className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Tool
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Edit Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingTemplate(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden neon-border max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingTemplate.id ? 'Edit Template' : 'New Template'}</h3>
                <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Name *</label>
                  <input type="text" value={editingTemplate.name || ''} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Type</label>
                    <input type="text" value={editingTemplate.type || ''} onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="PDF, DOCX, etc." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Size</label>
                    <input type="text" value={editingTemplate.size || ''} onChange={e => setEditingTemplate({ ...editingTemplate, size: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="1.2 MB" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Download URL</label>
                  <input type="text" value={editingTemplate.downloadUrl || ''} onChange={e => setEditingTemplate({ ...editingTemplate, downloadUrl: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" />
                </div>
              </div>
              <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex gap-3">
                <button onClick={() => setEditingTemplate(null)} className="flex-1 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-primary)] transition-colors">Cancel</button>
                <button onClick={handleSaveTemplate} disabled={saving} className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blog Edit Modal */}
      <AnimatePresence>
        {editingBlogPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingBlogPost(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden neon-border max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingBlogPost.id ? 'Edit Blog Post' : 'New Blog Post'}</h3>
                <button onClick={() => { setEditingBlogPost(null); setShowLinkInput(false); }} className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Title *</label>
                      <input type="text" value={editingBlogPost.title || ''} onChange={e => setEditingBlogPost({ ...editingBlogPost, title: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Author</label>
                      <input type="text" value={editingBlogPost.author || ''} onChange={e => setEditingBlogPost({ ...editingBlogPost, author: e.target.value })} className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-4">
                          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Content *</label>
                          <div className="flex bg-[var(--bg-primary)] rounded-lg p-0.5 border border-[var(--border-color)]">
                            <button 
                              onClick={() => setBlogPreview(false)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!blogPreview ? 'bg-cyan-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => setBlogPreview(true)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${blogPreview ? 'bg-cyan-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {showLinkInput ? (
                            <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-cyan-500/30 rounded-lg px-2 py-1 animate-in fade-in slide-in-from-top-1 shadow-lg">
                              <input 
                                type="text" 
                                value={linkUrl} 
                                onChange={e => setLinkUrl(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] w-48 text-cyan-500 font-mono"
                                placeholder="https://..."
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter') confirmAddLink();
                                  if (e.key === 'Escape') setShowLinkInput(false);
                                }}
                              />
                              <div className="flex items-center gap-1 border-l border-[var(--border-color)] ml-1 pl-1">
                                <button onClick={confirmAddLink} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors" title="Confirm"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setShowLinkInput(false)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {blogPreview ? (
                        <div className="w-full px-6 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl h-64 overflow-y-auto prose prose-invert prose-sm max-w-none prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-a:no-underline">
                          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {editingBlogPost.content || '*No content yet...*'}
                          </Markdown>
                        </div>
                      ) : (
                        <textarea 
                          ref={blogContentRef}
                          value={editingBlogPost.content || ''} 
                          onChange={e => setEditingBlogPost({ ...editingBlogPost, content: e.target.value })} 
                          onSelect={handleTextSelection}
                          onKeyUp={handleTextSelection}
                          onMouseUp={handleTextSelection}
                          className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm h-64 resize-none font-mono" 
                          placeholder="Write your blog content here... Use markdown for formatting."
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Cover Image *</label>
                    <div 
                      className={`aspect-[4/5] bg-[var(--bg-primary)] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 ${
                        uploadSuccess ? 'border-emerald-500/50 ring-4 ring-emerald-500/10' : 'border-[var(--border-color)]'
                      }`}
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                      ) : editingBlogPost.imageUrl ? (
                        <>
                          <img src={editingBlogPost.imageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                              onClick={() => blogImageInputRef.current?.click()}
                              className="p-2 bg-white text-black rounded-full hover:bg-cyan-500 hover:text-white transition-all"
                            >
                              <Upload className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingBlogPost({ ...editingBlogPost, imageUrl: '' })}
                              className="p-2 bg-white text-black rounded-full hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => blogImageInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 text-[var(--text-secondary)] hover:text-cyan-500 transition-colors"
                        >
                          <Upload className="w-8 h-8" />
                          <span className="text-xs font-bold text-center px-4">Upload Cover Image</span>
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={blogImageInputRef} 
                      onChange={handleBlogImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <p className="text-[10px] text-[var(--text-secondary)] italic">
                      Recommended: High resolution portrait or landscape image.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex gap-3">
                <button onClick={() => { setEditingBlogPost(null); setShowLinkInput(false); }} className="flex-1 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-primary)] transition-colors">Cancel</button>
                <button onClick={handleSaveBlogPost} disabled={saving} className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Blog Post
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toolbar */}
      <AnimatePresence>
        {showFloatingToolbar && toolbarPos && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ 
              position: 'fixed', 
              top: toolbarPos.top, 
              left: toolbarPos.left,
              zIndex: 100 
            }}
            className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-cyan-500/50 rounded-full px-3 py-1.5 shadow-xl backdrop-blur-md"
          >
            <button 
              onClick={handleAddLink}
              className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-wider"
            >
              <LinkIcon className="w-3 h-3" /> Add Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span className="text-sm font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deleteUserConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteUserConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-sm bg-[var(--bg-secondary)] rounded-3xl p-8 shadow-2xl neon-border text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete User?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8">
                This action cannot be undone. All data for this user will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteUserConfirmId(null)}
                  className="flex-1 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteUser(deleteUserConfirmId);
                    setDeleteUserConfirmId(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal for Templates */}
      <AnimatePresence>
        {deleteTemplateConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTemplateConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[var(--bg-secondary)] rounded-3xl p-8 shadow-2xl neon-border text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Template?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8">
                This action cannot be undone. This template will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTemplateConfirmId(null)}
                  className="flex-1 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteItem('templates', deleteTemplateConfirmId);
                    setDeleteTemplateConfirmId(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal for Blog Posts */}
      <AnimatePresence>
        {deleteBlogConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteBlogConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[var(--bg-secondary)] rounded-3xl p-8 shadow-2xl neon-border text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Blog Post?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8">
                This action cannot be undone. This blog post will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteBlogConfirmId(null)}
                  className="flex-1 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteItem('blog', deleteBlogConfirmId);
                    setDeleteBlogConfirmId(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal for Tools */}
      <AnimatePresence>
        {deleteToolConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteToolConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[var(--bg-secondary)] rounded-3xl p-8 shadow-2xl neon-border text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Tool?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8">
                This action cannot be undone. This tool will be permanently removed from the learning module.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteToolConfirmId(null)}
                  className="flex-1 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteItem('tools', deleteToolConfirmId);
                    setDeleteToolConfirmId(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[var(--bg-secondary)] rounded-3xl p-8 shadow-2xl neon-border text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Course?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-8">
                This action cannot be undone. All data for this course will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCourse(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden neon-border max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {editingCourse.id ? 'Edit Course' : 'New Course'}
                </h3>
                <button onClick={() => setEditingCourse(null)} className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Title *</label>
                      <input
                        type="text"
                        value={editingCourse.title || ''}
                        onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                        className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="Course Title"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Description *</label>
                      <textarea
                        value={editingCourse.description || ''}
                        onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                        className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm h-32"
                        placeholder="Course Description"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Category</label>
                      <select
                        value={editingCourse.category || 'General'}
                        onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                        className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm appearance-none cursor-pointer"
                      >
                        <option value="AI">AI</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Strategy">Strategy</option>
                        <option value="Design">Design</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 flex items-center justify-between">
                          Thumbnail Image *
                          {uploadSuccess && (
                            <motion.span 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-emerald-500 flex items-center gap-1 normal-case font-medium"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Upload Successful
                            </motion.span>
                          )}
                        </label>
                        <div 
                          className={`aspect-video bg-[var(--bg-primary)] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 ${
                            uploadSuccess ? 'border-emerald-500/50 ring-4 ring-emerald-500/10' : 'border-[var(--border-color)]'
                          }`}
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                          ) : editingCourse.thumbnailUrl ? (
                            <>
                              <img src={editingCourse.thumbnailUrl || undefined} className="w-full h-full object-cover" alt="Preview" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 bg-white text-black rounded-full hover:bg-cyan-500 hover:text-white transition-all"
                                  title="Change Image"
                                >
                                  <Upload className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingCourse({ ...editingCourse, thumbnailUrl: '' });
                                    setImageMeta(null);
                                  }}
                                  className="p-2 bg-white text-black rounded-full hover:bg-red-500 hover:text-white transition-all"
                                  title="Remove Image"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                              {uploadSuccess && (
                                <div className="absolute top-3 right-3 p-1.5 bg-emerald-500 text-white rounded-full shadow-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              )}
                            </>
                          ) : (
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/5 transition-colors"
                            >
                              <ImageIcon className="w-8 h-8 text-[var(--text-secondary)] mb-2" />
                              <span className="text-xs text-[var(--text-secondary)] font-bold">Click to upload image</span>
                              <div className="mt-2 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">Recommended: 1280 x 720</span>
                                <span className="text-[10px] text-[var(--text-secondary)] opacity-60">Max size: 500KB</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {imageMeta && editingCourse.thumbnailUrl && (
                          <div className="mt-2 flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Resolution</span>
                                <span className="text-xs font-bold text-[var(--text-primary)]">{imageMeta.width} x {imageMeta.height}</span>
                              </div>
                              <div className="w-px h-6 bg-[var(--border-color)]" />
                              <div className="flex flex-col">
                                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Size</span>
                                <span className="text-xs font-bold text-[var(--text-primary)]">{imageMeta.size}</span>
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              Optimized
                            </div>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">YouTube URL</label>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                        <input
                          type="text"
                          value={editingCourse.youtubeUrl || ''}
                          onChange={e => setEditingCourse({ ...editingCourse, youtubeUrl: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Target Link (Button)</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                        <input
                          type="text"
                          value={editingCourse.targetLink || ''}
                          onChange={e => setEditingCourse({ ...editingCourse, targetLink: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                          placeholder="https://example.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex gap-3">
                <button
                  onClick={() => setEditingCourse(null)}
                  className="flex-1 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingCourse.id ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminSEOModule() {
  const [seoConfig, setSeoConfig] = useState<SEOConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'seo_config', 'global'), (doc) => {
      if (doc.exists()) {
        setSeoConfig(doc.data() as SEOConfig);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching SEO config in Admin:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'seo_config', 'global'), {
        ...seoConfig,
        updatedAt: serverTimestamp()
      });
      setNotification({ message: 'SEO settings saved successfully!', type: 'success' });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, 'seo_config/global');
      setNotification({ message: 'Error saving SEO settings: ' + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">SEO & Verification</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(0,243,255,0.4)]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      {notification && (
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
          notification.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
        )}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Search Console */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] neon-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-500/10 rounded-2xl">
              <Search className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Google Search Console</h3>
              <p className="text-xs text-[var(--text-secondary)]">Ownership verification for SEO indexing.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2 tracking-widest">Verification Code (HTML Tag)</label>
              <input
                type="text"
                value={seoConfig.googleVerification || ''}
                onChange={(e) => setSeoConfig({ ...seoConfig, googleVerification: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                placeholder="e.g. YOUR_VERIFICATION_CODE_HERE"
              />
              <p className="mt-2 text-[10px] text-[var(--text-secondary)]">
                Copy the 'content' value from the meta tag provided by Google Search Console.
              </p>
            </div>
          </div>
        </div>

        {/* Google Analytics */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] neon-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Google Analytics</h3>
              <p className="text-xs text-[var(--text-secondary)]">Track visitor behavior and traffic.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2 tracking-widest">Measurement ID (G-XXXXXXX)</label>
              <input
                type="text"
                value={seoConfig.googleAnalyticsId || ''}
                onChange={(e) => setSeoConfig({ ...seoConfig, googleAnalyticsId: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Robots.txt */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] neon-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Robots.txt</h3>
              <p className="text-xs text-[var(--text-secondary)]">Instructions for search engine crawlers.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2 tracking-widest">Content</label>
              <textarea
                value={seoConfig.robotsTxt || ''}
                onChange={(e) => setSeoConfig({ ...seoConfig, robotsTxt: e.target.value })}
                className="w-full h-32 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-mono"
                placeholder="User-agent: *
Allow: /"
              />
            </div>
          </div>
        </div>

        {/* Sitemap */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] neon-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <FileDown className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Sitemap</h3>
              <p className="text-xs text-[var(--text-secondary)]">Link to your sitemap.xml file.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2 tracking-widest">Sitemap URL</label>
              <input
                type="text"
                value={seoConfig.sitemapUrl || ''}
                onChange={(e) => setSeoConfig({ ...seoConfig, sitemapUrl: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                placeholder="https://yourdomain.com/sitemap.xml"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
