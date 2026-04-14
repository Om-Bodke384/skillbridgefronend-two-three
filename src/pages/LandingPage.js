import React from 'react';
import { Link } from 'react-router-dom';
import { HiLightningBolt, HiUserGroup, HiChat, HiAcademicCap, HiClipboardCheck, HiArrowRight } from 'react-icons/hi';

const features = [
  { icon: '🏘️', title: 'Domain Communities',     desc: 'Join tech-specific communities for Web Dev, ML, DevOps, Cybersecurity and more.' },
  { icon: '🏛️', title: 'Town Halls',             desc: 'Participate in open discussions with live polls, hands raised and real-time chat.' },
  { icon: '⚡', title: 'Hackathons',              desc: 'Compete in community or global hackathons. Form teams, submit projects, win prizes.' },
  { icon: '📅', title: 'Events',                  desc: 'Attend webinars, workshops, meetups and conferences organized by mentors.' },
  { icon: '📋', title: 'Peer Review',             desc: 'Submit your projects and get feedback from peers. Give reviews to earn respect.' },
  { icon: '🙋', title: 'Peer Mentorship',         desc: 'Ask for help from community peers. Someone always knows what you need to learn.' },
  { icon: '🎓', title: 'Learning Plans',          desc: 'Follow structured, mentor-curated learning paths with milestones and resources.' },
  { icon: '📢', title: 'Announcements',           desc: 'Stay updated with pinned announcements from mentors and community admins.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <HiLightningBolt className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight">SkillBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Get Started <HiArrowRight /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/50 rounded-full px-4 py-1.5 mb-6 text-sm text-indigo-300">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            The #1 Developer Community Platform
          </div>
          <h1 className="text-6xl font-bold leading-tight mb-6">
            Where <span className="text-gradient">developers</span><br />grow together
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join domain-specific communities, participate in hackathons, get peer reviews,
            attend town halls, and accelerate your career with structured mentorship.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary !py-4 !px-8 text-lg shadow-xl shadow-indigo-900/30">
              Join SkillBridge Free <HiArrowRight className="text-xl" />
            </Link>
            <Link to="/login" className="btn-secondary !py-4 !px-8 text-lg">Sign in</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-gray-700">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+',  label: 'Communities' },
            { value: '5K+',  label: 'Developers' },
            { value: '100+', label: 'Hackathons' },
            { value: '2K+',  label: 'Projects Reviewed' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-gradient mb-1">{s.value}</p>
              <p className="text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to grow</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">One platform for communities, learning, collaboration, and career growth</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-indigo-700/50 transition-all duration-300 group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border-indigo-700/50 py-16">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-900/30">
              <HiLightningBolt className="text-white text-3xl" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to bridge your skills?</h2>
            <p className="text-gray-400 mb-8">Join thousands of developers already growing on SkillBridge</p>
            <Link to="/register" className="btn-primary !py-4 !px-10 text-lg shadow-xl shadow-indigo-900/30">
              Create Free Account <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-8 px-6 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
            <HiLightningBolt className="text-white text-xs" />
          </div>
          <span className="font-semibold text-white">SkillBridge</span>
        </div>
        <p>© {new Date().getFullYear()} SkillBridge. Built for the developer community.</p>
      </footer>
    </div>
  );
}
