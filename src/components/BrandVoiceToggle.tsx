import React from 'react';
import { Brain } from 'lucide-react';

interface BrandVoiceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function BrandVoiceToggle({ enabled, onToggle, disabled }: BrandVoiceToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 w-fit">
        <button
          onClick={() => onToggle(!enabled)}
          disabled={disabled}
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            enabled ? 'bg-cyan-600' : 'bg-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
          Brand & Avatar DNA
        </span>
      </div>
      {disabled && (
        <p className="text-[9px] text-cyan-500/70 font-medium">
          Configure in Brand Voice DNA to enable
        </p>
      )}
    </div>
  );
}
