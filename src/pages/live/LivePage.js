import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiVideoCamera, HiEye, HiUser } from 'react-icons/hi';

export default function LivePage() {
  const { user }    = useSelector((s) => s.auth);
  const navigate    = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [title, setTitle]       = useState('');
  const [showForm, setShowForm] = useState(false);

  const canGoLive = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    api.get('/live')
      .then((r) => setSessions(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleGoLive = async () => {
    if (!title.trim()) return toast.error('Enter a title');
    try {
      const { data } = await api.post('/live', { title });
      toast.success('You are live!');
      navigate(`/live/${data.data.live._id}`, { state: { ...data.data, isHost: true } });
    } catch { /* handled by interceptor */ }
  };

  const handleJoin = async (session) => {
    try {
      const { data } = await api.post(`/live/${session._id}/join`);
      navigate(`/live/${session._id}`, { state: { ...data.data, isHost: false } });
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🔴 Live Sessions</h1>
          <p className="text-gray-400 text-sm mt-1">Watch mentors and students go live</p>
        </div>
        {canGoLive && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <HiVideoCamera /> Go Live
          </button>
        )}
      </div>

      {/* Go Live Form */}
      {showForm && canGoLive && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-semibold">Start a Live Session</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter session title..."
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-xl border border-gray-600 focus:border-red-500 outline-none"
          />
          <button
            onClick={handleGoLive}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-medium transition-colors"
          >
            🔴 Start Live
          </button>
        </div>
      )}

      {/* Live Sessions */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <HiVideoCamera className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No live sessions right now</p>
          {canGoLive && <p className="text-sm mt-1">Be the first to go live!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div key={session._id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-red-500 transition-colors">
              <div className="bg-gray-900 h-32 flex items-center justify-center relative">
                <HiVideoCamera className="text-5xl text-gray-600" />
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
                <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  <HiEye /> {session.viewerCount}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-white font-semibold truncate">{session.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs text-white font-bold">
                    {session.hostedBy?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white">{session.hostedBy?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.hostedBy?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(session)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Join Live
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}