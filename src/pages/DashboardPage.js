import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { StatCard, Badge, Avatar } from '../components/ui/index';
import { HiUserGroup, HiLightningBolt, HiArrowRight, HiBell } from 'react-icons/hi';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const { myCommunities } = useSelector((s) => s.community);
  const [announcements, setAnnouncements] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/announcements', { params: { isGlobal: true, limit: 4000 } }),
      api.get('/hackathons', { params: { limit: 3000 } }),
      api.get('/events', { params: { limit: 3000 } }),
    ]).then(([ann, hack, ev]) => {
      setAnnouncements(ann.data.data.announcements || []);
      setHackathons(hack.data.data.hackathons || []);
      setEvents(ev.data.data.events || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {greeting}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400">Here's what's happening in your communities today</p>
        </div>
        <Link to="/communities" className="btn-primary hidden sm:flex">
          <HiUserGroup /> Explore Communities
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🏘️" label="My Communities" value={myCommunities.length} color="primary" />
        <StatCard icon="⚡" label="Hackathons" value={hackathons.length} color="amber" />
        <StatCard icon="📅" label="Upcoming Events" value={events.length} color="cyan" />
        <StatCard icon="📋" label="Reviews Pending" value="—" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Communities */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Communities</h2>
            <Link to="/communities/my" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all <HiArrowRight /></Link>
          </div>
          {myCommunities.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-400 text-sm mb-3">You haven't joined any communities yet.</p>
              <Link to="/communities" className="btn-primary text-sm">Explore Communities</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myCommunities.slice(0, 5).map((c) => (
                <Link key={c._id} to={`/communities/${c._id}`} className="card-hover flex items-center gap-3 !p-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 flex-shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.domain}</p>
                  </div>
                  <Badge variant="gray" className="ml-auto flex-shrink-0">{c.memberCount || 0}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><HiBell className="text-amber-400" /> Announcements</h2>
              <Link to="/announcements" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">All <HiArrowRight /></Link>
            </div>
            {announcements.length === 0 ? (
              <div className="card"><p className="text-gray-400 text-sm text-center py-4">No announcements yet</p></div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a._id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {a.isPinned && <span className="text-xs text-amber-400">📌 Pinned</span>}
                          <Badge variant={a.priority === 'urgent' ? 'red' : a.priority === 'high' ? 'amber' : 'gray'}>{a.priority}</Badge>
                        </div>
                        <h3 className="font-semibold text-white text-sm">{a.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{a.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 flex-shrink-0">{format(new Date(a.createdAt), 'MMM d')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hackathons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><HiLightningBolt className="text-amber-400" /> Active Hackathons</h2>
              <Link to="/hackathons" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">All <HiArrowRight /></Link>
            </div>
            {hackathons.length === 0 ? (
              <div className="card"><p className="text-gray-400 text-sm text-center py-4">No hackathons right now</p></div>
            ) : (
              <div className="grid gap-3">
                {hackathons.map((h) => (
                  <Link key={h._id} to={`/hackathons/${h._id}`} className="card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{h.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(h.startDate), 'MMM d')} → {format(new Date(h.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant={h.status === 'active' ? 'green' : h.status === 'registration' ? 'cyan' : 'gray'}>
                        {h.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
