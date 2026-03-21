import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, Phone, X } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileVerificationProps {
  userId: string;
  onVerified: () => void;
}

export function MobileVerification({ userId, onVerified }: MobileVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSavePhoneNumber = async () => {
    setLoading(true);
    setError(null);
    try {
      // Update user document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber: phoneNumber
      });
      
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Failed to save phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-secondary)] p-8 rounded-3xl shadow-2xl w-full max-w-sm neon-border max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Enter Mobile Number</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
          <button
            onClick={handleSavePhoneNumber}
            disabled={loading || !phoneNumber}
            className="w-full py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Number'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-xl text-sm flex items-center gap-2">
            <X className="w-4 h-4" /> {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}
