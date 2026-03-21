import React from 'react';
import { Brain } from 'lucide-react';

interface BrandVoiceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function BrandVoiceToggle({ enabled, onToggle, disabled }: BrandVoiceToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <Brain className="w-4 h-4 text-cyan-500" />
        Apply Brand Voice & Avatar DNA
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-cyan-600' : 'bg-gray-400'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
