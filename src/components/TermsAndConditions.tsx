import React from 'react';

export function TermsAndConditions() {
  return (
    <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] space-y-4">
      <h1 className="text-2xl font-bold">Terms and Conditions</h1>
      <p className="text-[var(--text-secondary)]">Last updated: March 21, 2026</p>
      <p className="text-[var(--text-secondary)]">
        By accessing or using Neuro Engine AI, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.
      </p>
      <h2 className="text-xl font-semibold">Use of Service</h2>
      <p className="text-[var(--text-secondary)]">
        You are responsible for your use of the service and for any content you generate. You agree not to use the service for any illegal or unauthorized purpose.
      </p>
      <h2 className="text-xl font-semibold">Intellectual Property</h2>
      <p className="text-[var(--text-secondary)]">
        The service and its original content, features, and functionality are and will remain the exclusive property of Neuro Engine AI and its licensors.
      </p>
      <h2 className="text-xl font-semibold">Termination</h2>
      <p className="text-[var(--text-secondary)]">
        We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
      </p>
      <h2 className="text-xl font-semibold">Changes to Terms</h2>
      <p className="text-[var(--text-secondary)]">
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
      </p>
    </div>
  );
}
