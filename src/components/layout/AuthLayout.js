import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HiLightningBolt } from 'react-icons/hi';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900 flex-col justify-between p-12 border-r border-gray-700 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <HiLightningBolt className="text-white text-xl" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">SkillBridge</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Where <span className="text-gradient">developers</span> grow together
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Join domain-specific communities, participate in hackathons, get peer reviews, and accelerate your career with mentorship.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Communities', value: '50+' },
              { label: 'Developers', value: '5K+' },
              { label: 'Hackathons', value: '100+' },
              { label: 'Projects Reviewed', value: '2K+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                <p className="text-2xl font-bold text-indigo-400">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-sm relative z-10">© 2025 SkillBridge. Built for the community.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <HiLightningBolt className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-white">SkillBridge</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
