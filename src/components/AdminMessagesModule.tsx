import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Loader2, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
  read: boolean;
}

export function AdminMessagesModule() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contact Form Messages</h2>
      <div className="bg-[var(--bg-secondary)] rounded-3xl neon-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-primary)] text-[var(--text-secondary)] uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Message</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {messages.map((msg) => (
              <tr key={msg.id} className={`hover:bg-[var(--bg-primary)] transition-colors ${msg.read ? '' : 'bg-cyan-900/10'}`}>
                <td className="px-6 py-4">{msg.name}</td>
                <td className="px-6 py-4">{msg.email}</td>
                <td className="px-6 py-4">{msg.subject}</td>
                <td className="px-6 py-4 max-w-xs truncate">{msg.message}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {!msg.read && (
                      <button onClick={() => markAsRead(msg.id)} className="p-2 hover:bg-green-500/20 rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(msg.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
