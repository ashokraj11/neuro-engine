import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] space-y-4">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="text-[var(--text-secondary)]">Last updated: March 21, 2026</p>
      <p className="text-[var(--text-secondary)]">
        At Neuro Engine AI, we take your privacy seriously. This Privacy Policy explains what information we collect and how we use it.
      </p>
      <h2 className="text-xl font-semibold">Information We Collect</h2>
      <p className="text-[var(--text-secondary)]">
        We collect information you provide directly to us, such as your name, email address, and any content you generate using our tools. We also automatically collect certain technical information when you visit our site, such as your IP address, browser type, and usage data.
      </p>
      <h2 className="text-xl font-semibold">How We Use Your Information</h2>
      <p className="text-[var(--text-secondary)]">
        We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.
      </p>
      <h2 className="text-xl font-semibold">Third-Party Services</h2>
      <p className="text-[var(--text-secondary)]">
        We may use third-party services, such as Google AdSense, which may use cookies to serve ads based on your prior visits to our website. You can opt out of personalized advertising by visiting Ads Settings.
      </p>
      <h2 className="text-xl font-semibold">Contact Us</h2>
      <p className="text-[var(--text-secondary)]">
        If you have any questions about this Privacy Policy, please contact us.
      </p>
    </div>
  );
}
