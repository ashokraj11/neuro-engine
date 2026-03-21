import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
        read: false
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
    }
  };

  return (
    <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] space-y-6">
      <h1 className="text-2xl font-bold">Contact Us</h1>
      <p className="text-[var(--text-secondary)]">
        We value your feedback and are here to help. If you have any questions, concerns, or suggestions, please fill out the form below.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Name</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Email</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Subject</label>
          <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Message</label>
          <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]" />
        </div>
        <button type="submit" disabled={status === 'submitting'} className="px-4 py-2 bg-[var(--neon-cyan)] text-black rounded-lg font-bold hover:opacity-90 transition-all">
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>
        {status === 'success' && <p className="text-green-500">Message sent successfully!</p>}
      </form>

      <div className="space-y-2 pt-4 border-t border-[var(--border-color)]">
        <h2 className="text-xl font-semibold">Support Hours</h2>
        <p className="text-[var(--text-secondary)]">
          Our support team is available Monday through Friday, 9:00 AM to 5:00 PM UTC. We aim to respond to all inquiries within 48 hours.
        </p>
      </div>
    </div>
  );
}
