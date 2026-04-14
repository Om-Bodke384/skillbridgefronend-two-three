import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, EmptyState, Modal } from '../../components/ui/index';
import { HiCalendar, HiPlus, HiUsers, HiLocationMarker, HiVideoCamera } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get('communityId');
  const { user } = useSelector((s) => s.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = ['admin', 'mentor'].includes(user?.role);

  const load = () => {
    setLoading(true);
    api.get('/events', { params: { communityId, isGlobal: !communityId || undefined, limit: 20 } })
      .then((r) => setEvents(r.data.data.events || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [communityId]);

  const typeIcon = { webinar: '🎙️', workshop: '🛠️', meetup: '☕', conference: '🏛️', bootcamp: '🚀', other: '📅' };
  const statusColors = { upcoming: 'cyan', live: 'green', completed: 'gray', cancelled: 'red' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl flex items-center gap-2"><HiCalendar className="text-cyan-400" /> Events</h1>
          <p className="section-subtitle">Webinars, workshops, meetups and more</p>
        </div>
        {canCreate && <button onClick={() => setShowCreate(true)} className="btn-primary"><HiPlus /> Create Event</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-44" />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon="📅" title="No events scheduled" description="Check back soon for upcoming events!" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map((ev) => (
            <Link key={ev._id} to={`/events/${ev._id}`} className="card-hover group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-800/80 border border-gray-700 flex items-center justify-center text-3xl flex-shrink-0">
                  {typeIcon[ev.type] || '📅'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant={statusColors[ev.status] || 'gray'}>{ev.status}</Badge>
                    <Badge variant="gray">{ev.type}</Badge>
                    <Badge variant={ev.format === 'online' ? 'cyan' : ev.format === 'offline' ? 'amber' : 'purple'}>{ev.format}</Badge>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{ev.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ev.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><HiCalendar /> {format(new Date(ev.startDate), 'MMM d, yyyy • HH:mm')}</span>
                    <span className="flex items-center gap-1"><HiUsers /> {ev.registeredUsers?.length || 0}/{ev.capacity}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateEventModal isOpen onClose={() => setShowCreate(false)} onCreated={load} communityId={communityId} />}
    </div>
  );
}

function CreateEventModal({ isOpen, onClose, onCreated, communityId }) {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({ defaultValues: { format: 'online', type: 'webinar' } });
  const format_ = watch('format');

  const onSubmit = async (data) => {
    await api.post('/events', {
      ...data,
      community: communityId || undefined,
      isGlobal: !communityId,
      capacity: parseInt(data.capacity) || 100,
    });
    reset(); onClose(); onCreated();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Event" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Event Title *</label>
          <input {...register('title', { required: true })} className="input" placeholder="Introduction to GraphQL" />
        </div>
        <div>
          <label className="label">Description *</label>
          <textarea {...register('description', { required: true })} rows={3} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <select {...register('type')} className="input">
              {['webinar','workshop','meetup','conference','bootcamp','other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Format</label>
            <select {...register('format')} className="input">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date *</label>
            <input {...register('startDate', { required: true })} type="datetime-local" className="input" />
          </div>
          <div>
            <label className="label">End Date *</label>
            <input {...register('endDate', { required: true })} type="datetime-local" className="input" />
          </div>
        </div>
        {(format_ === 'online' || format_ === 'hybrid') && (
          <div>
            <label className="label">Meeting Link</label>
            <input {...register('meetingLink')} className="input" placeholder="https://meet.google.com/…" />
          </div>
        )}
        {(format_ === 'offline' || format_ === 'hybrid') && (
          <div>
            <label className="label">Venue</label>
            <input {...register('venue')} className="input" placeholder="Conference Hall A, Mumbai" />
          </div>
        )}
        <div>
          <label className="label">Capacity</label>
          <input {...register('capacity')} type="number" defaultValue={100} min={1} className="input" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
