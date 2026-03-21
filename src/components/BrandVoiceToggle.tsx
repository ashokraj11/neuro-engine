import React from 'react';
import { Brain } from 'lucide-react';

interface BrandVoiceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function BrandVoiceToggle({ enabled, onToggle, disabled }: BrandVoiceToggleProps) {
  return (
    <div className="flex items-center gap-2 w-fit">
      <button
        onClick={() => onToggle(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
          enabled ? 'bg-cyan-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
        Brand Voice
      </span>
    </div>
  );
}
