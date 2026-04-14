import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, EmptyState, Modal } from '../../components/ui/index';
import { HiPlus, HiUsers, HiCalendar, HiMicrophone } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function TownhallPage() {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get('communityId');
  const { user } = useSelector((s) => s.auth);
  const [townhalls, setTownhalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = ['admin', 'mentor'].includes(user?.role);

  const load = () => {
    setLoading(true);
    api.get('/townhalls', { params: { communityId, status: undefined, limit: 20000 } })
      .then((r) => setTownhalls(r.data.data.townhalls || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [communityId]);

  const statusColors = { scheduled: 'cyan', live: 'green', ended: 'gray' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl flex items-center gap-2">🏛️ Town Hall</h1>
          <p className="section-subtitle">Open discussions inspired by European town halls — everyone has a voice</p>
        </div>
        {canCreate && <button onClick={() => setShowCreate(true)} className="btn-primary"><HiPlus /> Host Town Hall</button>}
      </div>

      {/* Live banner */}
      {townhalls.some((t) => t.status === 'live') && (
        <div className="bg-green-900/20 border border-green-700/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="font-semibold text-green-300">A Town Hall is LIVE right now!</span>
          </div>
          <Link to={`/townhalls/${townhalls.find((t) => t.status === 'live')?._id}`} className="btn-primary !py-1.5 !text-sm">
            Join Now
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-36" />)}</div>
      ) : townhalls.length === 0 ? (
        <EmptyState icon="🏛️" title="No town halls yet" description="Mentors and admins can host town halls for open community discussions." />
      ) : (
        <div className="grid gap-4">
          {townhalls.map((t) => (
            <Link key={t._id} to={`/townhalls/${t._id}`} className="card-hover group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={statusColors[t.status] || 'gray'}>
                      {t.status === 'live' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block mr-1 animate-pulse" />}
                      {t.status}
                    </Badge>
                    {t.isGlobal && <Badge variant="cyan">Global</Badge>}
                    {t.community && <Badge variant="primary">{t.community.name}</Badge>}
                  </div>
                  <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">{t.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{t.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><HiCalendar /> {format(new Date(t.scheduledAt), 'MMM d, yyyy • HH:mm')}</span>
                    <span className="flex items-center gap-1"><HiUsers /> {t.attendees?.length || 0} attendees</span>
                    <span className="flex items-center gap-1"><HiMicrophone /> Hosted by {t.hostedBy?.name}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateTownhallModal isOpen onClose={() => setShowCreate(false)} onCreated={load} communityId={communityId} />}
    </div>
  );
}

function CreateTownhallModal({ isOpen, onClose, onCreated, communityId }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const onSubmit = async (data) => {
    await api.post('/townhalls', {
      ...data,
      community: communityId || undefined,
      isGlobal: !communityId,
      agenda: data.agenda ? data.agenda.split('\n').filter(Boolean) : [],
      maxAttendees: parseInt(data.maxAttendees) || 500,
    });
    reset(); onClose(); onCreated();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Host a Town Hall" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" placeholder="Monthly Community Q&A" /></div>
        <div><label className="label">Description *</label><textarea {...register('description', { required: true })} rows={3} className="input resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Scheduled At *</label><input {...register('scheduledAt', { required: true })} type="datetime-local" className="input" /></div>
          <div><label className="label">Max Attendees</label><input {...register('maxAttendees')} type="number" defaultValue={500} className="input" /></div>
        </div>
        <div><label className="label">Agenda <span className="text-gray-500">(one item per line)</span></label>
          <textarea {...register('agenda')} rows={4} className="input resize-none" placeholder="Welcome & introductions&#10;Community updates&#10;Open Q&A&#10;Closing remarks" /></div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">{isSubmitting ? '…' : 'Create Town Hall'}</button>
        </div>
      </form>
    </Modal>
  );
}
