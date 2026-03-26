import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface AdSenseProps {
  adSlot: string;
  adClient?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidthResponsive?: boolean;
  className?: string;
  adCode?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSense({ 
  adSlot, 
  adClient = "ca-pub-XXXXXXXXXXXXXXXX",
  adFormat = 'auto', 
  fullWidthResponsive = true,
  className,
  adCode
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (adCode && adRef.current) {
      // Handle custom ad code
      const container = adRef.current.querySelector('.custom-ad-container');
      if (container) {
        container.innerHTML = '';
        const range = document.createRange();
        const documentFragment = range.createContextualFragment(adCode);
        container.appendChild(documentFragment);
      }
      return;
    }

    // Only initialize AdSense once per component instance
    if (initialized.current) return;

    let timeoutId: NodeJS.Timeout;
    let resizeObserver: ResizeObserver;

    const initializeAd = () => {
      if (initialized.current) return;
      
      try {
        // Final check for width
        if (adRef.current && adRef.current.offsetWidth > 10) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
          if (resizeObserver) resizeObserver.disconnect();
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    };

    // Use ResizeObserver to detect when the element actually has a width
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 10) {
          // Once we have width, wait a tiny bit for layout to settle
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(initializeAd, 200);
        }
      }
    });

    if (adRef.current) {
      resizeObserver.observe(adRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [adCode, adSlot, adClient, adFormat, fullWidthResponsive]);

  return (
    <div 
      ref={adRef}
      className={cn("my-1 overflow-hidden rounded-lg bg-zinc-900/50 border border-white/5 p-1 flex flex-col items-center", className)}
    >
      <span className="text-[6px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Advertisement</span>
      <div className="w-full min-h-[25px] flex items-center justify-center">
        {adCode ? (
          <div className="custom-ad-container w-full flex flex-col items-center justify-center" />
        ) : (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minWidth: '100px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
          />
        )}
      </div>
    </div>
  );
}
