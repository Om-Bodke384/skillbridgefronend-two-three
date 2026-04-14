import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge, Avatar, LoadingSpinner } from '../../components/ui/index';
import { HiLightningBolt, HiUsers, HiCalendar, HiExternalLink } from 'react-icons/hi';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function HackathonDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/hackathons/${id}`).then((r) => setHackathon(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    try { await api.post(`/hackathons/${id}/register`); toast.success('Registered!'); }
    catch {}
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!hackathon) return <div className="text-center py-20 text-gray-400">Hackathon not found</div>;

  const isRegistered = hackathon.registeredUsers?.some((u) => u._id === user?._id);
  const statusColors = { upcoming: 'gray', registration: 'cyan', active: 'green', judging: 'amber', completed: 'gray' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={statusColors[hackathon.status]}>{hackathon.status}</Badge>
              {hackathon.isGlobal && <Badge variant="cyan">Global</Badge>}
              {hackathon.community && <Badge variant="primary">{hackathon.community.name}</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{hackathon.title}</h1>
            <p className="text-gray-400">{hackathon.description}</p>
          </div>
          {['registration', 'upcoming'].includes(hackathon.status) && (
            isRegistered ? <Badge variant="green">Registered ✓</Badge> :
            <button onClick={handleRegister} className="btn-primary flex-shrink-0"><HiLightningBolt /> Register</button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Start Date', value: format(new Date(hackathon.startDate), 'MMM d, yyyy') },
            { label: 'End Date', value: format(new Date(hackathon.endDate), 'MMM d, yyyy') },
            { label: 'Registered', value: hackathon.registeredUsers?.length || 0 },
            { label: 'Teams', value: hackathon.teams?.length || 0 },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800/80 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hackathon.prizes?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-white mb-3">🏆 Prizes</h2>
            {hackathon.prizes.map((p, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-400 font-bold text-sm">{i + 1}</div>
                <div><p className="font-medium text-white text-sm">{p.position}</p><p className="text-xs text-amber-300">{p.reward}</p></div>
              </div>
            ))}
          </div>
        )}
        {hackathon.themes?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-white mb-3">💡 Themes</h2>
            <div className="flex flex-wrap gap-2">
              {hackathon.themes.map((t) => <Badge key={t} variant="primary">{t}</Badge>)}
            </div>
          </div>
        )}
      </div>

      {hackathon.teams?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Teams ({hackathon.teams.length})</h2>
          <div className="grid gap-3">
            {hackathon.teams.map((team, i) => (
              <div key={i} className="bg-gray-800/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{team.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {team.members?.map((m) => <Avatar key={m._id} src={m.avatar} name={m.name} size="xs" />)}
                  </div>
                </div>
                {team.projectLink && (
                  <a href={team.projectLink} target="_blank" rel="noreferrer" className="btn-ghost text-sm">
                    <HiExternalLink /> View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
