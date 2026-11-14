import React from 'react';
import { GOOGLE_CLIENT_ID } from './GoogleAuthButton';

// "— or —" divider; hidden together with the Google button when Google isn't configured
export default function AuthDivider({ label = 'or' }) {
  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-700" />
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );
}
