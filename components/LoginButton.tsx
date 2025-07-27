"use client";

import { signIn } from 'next-auth/react';

/**
 * Renders a button that triggers Google sign‑in via NextAuth.
 */
export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="mt-6 rounded-md bg-brand px-6 py-3 text-white transition-colors hover:bg-brand-light"
    >
      Log ind med Google
    </button>
  );
}
