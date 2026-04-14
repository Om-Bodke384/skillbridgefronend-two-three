import React from 'react';
import { HiX } from 'react-icons/hi';

// ─── LoadingSpinner ──────────────────────────────────────────────────────────
export function LoadingSpinner({ fullScreen, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizes[size]} border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin`} />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-gray-400 text-sm">Loading SkillBridge…</p>
        </div>
      </div>
    );
  }
  return spinner;
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-gray-800 border border-gray-700 rounded-2xl w-full ${sizes[size]} shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <HiX />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover flex-shrink-0 ${sizes[size]} ${className}`} />;
  return (
    <div className={`rounded-full bg-indigo-700 flex items-center justify-center font-bold text-white flex-shrink-0 ${sizes[size]} ${className}`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50',
    green:   'bg-green-900/50 text-green-300 border-green-700/50',
    amber:   'bg-amber-900/50 text-amber-300 border-amber-700/50',
    red:     'bg-red-900/50 text-red-300 border-red-700/50',
    cyan:    'bg-cyan-900/50 text-cyan-300 border-cyan-700/50',
    gray:    'bg-gray-600 text-gray-300 border-gray-600',
    purple:  'bg-purple-900/50 text-purple-300 border-purple-700/50',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800/80 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Previous
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800/80 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Next
      </button>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-indigo-900/30 text-indigo-400',
    green:   'bg-green-900/30 text-green-400',
    amber:   'bg-amber-900/30 text-amber-400',
    red:     'bg-red-900/30 text-red-400',
    cyan:    'bg-cyan-900/30 text-cyan-400',
    purple:  'bg-purple-900/30 text-purple-400',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && <p className="text-xs text-green-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea className={`input resize-none ${error ? 'border-red-500' : ''}`} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'border-red-500' : ''}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
