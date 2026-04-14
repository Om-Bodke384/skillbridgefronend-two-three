// ─── Hackathon Page ──────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, EmptyState, Modal } from '../../components/ui/index';
import { HiLightningBolt, HiPlus, HiCalendar, HiUsers, HiClock } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function HackathonPage() {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get('communityId');
  const { user } = useSelector((s) => s.auth);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = ['admin', 'mentor'].includes(user?.role);

  const load = () => {
    setLoading(true);
    api.get('/hackathons', { params: { communityId, isGlobal: !communityId || undefined, limit: 20 } })
      .then((r) => setHackathons(r.data.data.hackathons || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [communityId]);

  const statusColors = { upcoming: 'gray', registration: 'cyan', active: 'green', judging: 'amber', completed: 'gray' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl flex items-center gap-2"><HiLightningBolt className="text-amber-400" /> Hackathons</h1>
          <p className="section-subtitle">Build, compete, and win with your community</p>
        </div>
        {canCreate && <button onClick={() => setShowCreate(true)} className="btn-primary"><HiPlus /> Create Hackathon</button>}
      </div>

      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-48" />)}</div>
      ) : hackathons.length === 0 ? (
        <EmptyState icon="⚡" title="No hackathons yet" description="Stay tuned for upcoming hackathons!" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hackathons.map((h) => (
            <Link key={h._id} to={`/hackathons/${h._id}`} className="card-hover group">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={statusColors[h.status] || 'gray'}>{h.status}</Badge>
                {h.community && <Badge variant="primary">{h.community.name}</Badge>}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{h.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4">{h.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><HiCalendar /> {format(new Date(h.startDate), 'MMM d')} – {format(new Date(h.endDate), 'MMM d, yyyy')}</span>
                <span className="flex items-center gap-1"><HiUsers /> {h.registeredUsers?.length || 0} registered</span>
                <span className="flex items-center gap-1"><HiClock /> Max {h.maxTeamSize} per team</span>
              </div>
              {h.prizes?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {h.prizes.slice(0, 3).map((p, i) => (
                    <div key={i} className="bg-amber-900/20 border border-amber-800/50 rounded-lg px-3 py-1 text-xs">
                      <span className="text-amber-300 font-medium">{p.position}:</span>
                      <span className="text-gray-300 ml-1">{p.reward}</span>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateHackathonModal isOpen onClose={() => setShowCreate(false)} onCreated={load} communityId={communityId} />}
    </div>
  );
}

function CreateHackathonModal({ isOpen, onClose, onCreated, communityId }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const onSubmit = async (data) => {
    await api.post('/hackathons', { ...data, community: communityId || undefined, isGlobal: !communityId,
      themes: data.themes ? data.themes.split(',').map((t) => t.trim()) : [],
      prizes: [{ position: '1st', reward: data.prize1 || 'TBD' }, { position: '2nd', reward: data.prize2 || 'TBD' }],
    });
    reset(); onClose(); onCreated();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Hackathon" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" placeholder="Hack the Future 2025" /></div>
        <div><label className="label">Description *</label><textarea {...register('description', { required: true })} rows={3} className="input resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Registration Start *</label><input {...register('registrationStart', { required: true })} type="datetime-local" className="input" /></div>
          <div><label className="label">Registration End *</label><input {...register('registrationEnd', { required: true })} type="datetime-local" className="input" /></div>
          <div><label className="label">Hack Start *</label><input {...register('startDate', { required: true })} type="datetime-local" className="input" /></div>
          <div><label className="label">Hack End *</label><input {...register('endDate', { required: true })} type="datetime-local" className="input" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">1st Prize</label><input {...register('prize1')} className="input" placeholder="$500 + Certificate" /></div>
          <div><label className="label">2nd Prize</label><input {...register('prize2')} className="input" placeholder="$250 + Certificate" /></div>
        </div>
        <div><label className="label">Themes <span className="text-gray-500">(comma separated)</span></label><input {...register('themes')} className="input" placeholder="AI, Sustainability, EdTech" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Min Team Size</label><input {...register('minTeamSize')} type="number" defaultValue={1} min={1} max={10} className="input" /></div>
          <div><label className="label">Max Team Size</label><input {...register('maxTeamSize')} type="number" defaultValue={4} min={1} max={10} className="input" /></div>
        </div>
        <div className="flex gap-3"><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">{isSubmitting ? '…' : 'Create'}</button></div>
      </form>
    </Modal>
  );
}
