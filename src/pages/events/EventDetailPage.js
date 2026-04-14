import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, Avatar, LoadingSpinner } from '../../components/ui/index';
import { HiCalendar, HiUsers, HiVideoCamera, HiLocationMarker, HiCheckCircle } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}`).then((r) => setEvent(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    try {
      await api.post(`/events/${id}/register`);
      toast.success('Registered for event!');
      const r = await api.get(`/events/${id}`);
      setEvent(r.data.data);
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!event) return <div className="text-center py-20 text-gray-400">Event not found</div>;

  const isRegistered = event.registeredUsers?.some((u) => u._id === user?._id);
  const isFull = event.registeredUsers?.length >= event.capacity;
  const statusColors = { upcoming: 'cyan', live: 'green', completed: 'gray', cancelled: 'red' };
  const typeIcon = { webinar: '🎙️', workshop: '🛠️', meetup: '☕', conference: '🏛️', bootcamp: '🚀', other: '📅' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-800/80 border border-gray-700 flex items-center justify-center text-4xl flex-shrink-0">
              {typeIcon[event.type] || '📅'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={statusColors[event.status] || 'gray'}>{event.status}</Badge>
                <Badge variant="gray">{event.type}</Badge>
                <Badge variant={event.format === 'online' ? 'cyan' : 'amber'}>{event.format}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
            </div>
          </div>
          {event.status === 'upcoming' && (
            isRegistered ? (
              <Badge variant="green" className="flex-shrink-0 !py-2 !px-3"><HiCheckCircle /> Registered</Badge>
            ) : (
              <button onClick={handleRegister} disabled={isFull} className="btn-primary flex-shrink-0">
                {isFull ? 'Event Full' : 'Register'}
              </button>
            )
          )}
        </div>

        <p className="text-gray-400 mt-4">{event.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/80 rounded-xl p-3">
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><HiCalendar /> Start</p>
            <p className="text-sm font-semibold text-white">{format(new Date(event.startDate), 'MMM d, yyyy')}</p>
            <p className="text-xs text-gray-400">{format(new Date(event.startDate), 'HH:mm')}</p>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-3">
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><HiCalendar /> End</p>
            <p className="text-sm font-semibold text-white">{format(new Date(event.endDate), 'MMM d, yyyy')}</p>
            <p className="text-xs text-gray-400">{format(new Date(event.endDate), 'HH:mm')}</p>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-3">
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><HiUsers /> Registered</p>
            <p className="text-sm font-semibold text-white">{event.registeredUsers?.length || 0} / {event.capacity}</p>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-3">
            {event.format !== 'offline' && event.meetingLink ? (
              <>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><HiVideoCamera /> Link</p>
                {isRegistered ? (
                  <a href={event.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">Join Meeting →</a>
                ) : (
                  <p className="text-xs text-gray-500">Register to get link</p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><HiLocationMarker /> Venue</p>
                <p className="text-sm font-semibold text-white">{event.venue || 'TBD'}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {event.speakers?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4">🎤 Speakers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {event.speakers.map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-800/80 rounded-xl p-4">
                <Avatar src={s.avatar} name={s.name} size="md" />
                <div>
                  <p className="font-semibold text-white">{s.name}</p>
                  {s.topic && <p className="text-xs text-indigo-300 mt-0.5">Topic: {s.topic}</p>}
                  {s.bio && <p className="text-sm text-gray-400 mt-1">{s.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {event.registeredUsers?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-3">Attendees ({event.registeredUsers.length})</h2>
          <div className="flex flex-wrap gap-2">
            {event.registeredUsers.slice(0, 20).map((u) => (
              <Avatar key={u._id} src={u.avatar} name={u.name} size="sm" className="hover:ring-2 hover:ring-indigo-500 transition-all" title={u.name} />
            ))}
            {event.registeredUsers.length > 20 && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-400">
                +{event.registeredUsers.length - 20}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
