import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, Avatar, LoadingSpinner, Modal } from '../../components/ui/index';
import { HiUsers, HiCalendar, HiMicrophone, HiPaperAirplane, HiChartBar } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { getSocket, joinTownhallRoom, sendTownhallMessage } from '../../services/socket';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TownhallDetailPage() {
  const { id }           = useParams();
  const { user }         = useSelector((s) => s.auth);
  const [townhall, setTownhall] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [thRes, msgRes] = await Promise.all([
        api.get(`/townhalls/${id}`),
        api.get('/chats', { params: { room: `townhall:${id}`, limit: 10000 } }),
      ]);
      setTownhall(thRes.data.data);
      setMessages(msgRes.data.data || []);
    } catch { /* handled */ }
  }, [id]);

  useEffect(() => {
    load().finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) {
      joinTownhallRoom(id);
      const handleMsg = (msg) => setMessages((prev) => [...prev, msg]);
      socket.on('townhall_message', handleMsg);
      return () => socket.off('townhall_message', handleMsg);
    }
  }, [id, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const res = await api.post('/chats', {
        content: input.trim(),
        room: `townhall:${id}`,
        townhallId: id,
      });
      const saved = res.data.data;
      setMessages((prev) => [...prev, saved]);
      sendTownhallMessage({ ...saved, townhallId: id });
      setInput('');
    } catch { /* handled */ }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/townhalls/${id}/status`, { status });
      toast.success(`Town Hall ${status === 'live' ? 'is now LIVE!' : 'ended'}`);
      load();
    } catch { /* handled */ }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await api.post(`/townhalls/${id}/vote`, { pollId, optionIndex });
      load();
    } catch { /* handled */ }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/townhalls/${id}/join`);
      load();
    } catch { /* handled */ }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!townhall) return <div className="text-center py-20 text-gray-400">Town Hall not found</div>;

  const isHost      = townhall.hostedBy?._id === user?._id;
  const isAttendee  = townhall.attendees?.some((a) => a._id === user?._id);
  const statusColors = { scheduled: 'cyan', live: 'green', ended: 'gray' };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={statusColors[townhall.status] || 'gray'}>
                {townhall.status === 'live' && (
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block mr-1 animate-pulse" />
                )}
                {townhall.status}
              </Badge>
              {townhall.isGlobal && <Badge variant="cyan">Global</Badge>}
              {townhall.community && <Badge variant="primary">{townhall.community.name}</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{townhall.title}</h1>
            <p className="text-gray-400">{townhall.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <HiCalendar /> {format(new Date(townhall.scheduledAt), 'MMM d, yyyy • HH:mm')}
              </span>
              <span className="flex items-center gap-1.5">
                <HiUsers /> {townhall.attendees?.length || 0} attendees
              </span>
              <span className="flex items-center gap-1.5">
                <HiMicrophone /> {townhall.hostedBy?.name}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {!isAttendee && townhall.status !== 'ended' && (
              <button onClick={handleJoin} className="btn-primary">Join Town Hall</button>
            )}
            {isHost && townhall.status === 'scheduled' && (
              <button
                onClick={() => handleStatusChange('live')}
                className="btn-primary !bg-green-600 hover:!bg-green-500"
              >
                🔴 Go Live
              </button>
            )}
            {isHost && townhall.status === 'live' && (
              <>
                <button onClick={() => handleStatusChange('ended')} className="btn-secondary">
                  End Town Hall
                </button>
                <button onClick={() => setShowPoll(true)} className="btn-secondary">
                  <HiChartBar /> Add Poll
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 card !p-0 flex flex-col" style={{ height: '600px' }}>
          <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-white">💬 Discussion</h2>
            <span className="text-xs text-gray-400">{messages.length} messages</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.map((msg, i) => {
              const isMine = msg.sender?._id === user?._id;
              return (
                <div key={msg._id || i} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <Avatar
                    src={msg.sender?.avatar}
                    name={msg.sender?.name}
                    size="xs"
                    className="flex-shrink-0 mt-1"
                  />
                  <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {!isMine && (
                      <span className="text-xs text-indigo-300 font-medium mb-0.5">
                        {msg.sender?.name}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 text-sm text-white rounded-2xl ${
                        isMine ? 'message-bubble-self' : 'message-bubble-other'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {townhall.status !== 'ended' && (
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition-colors">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())
                  }
                  placeholder="Share your thoughts…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <HiPaperAirplane className="text-white text-xs rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Agenda */}
          {townhall.agenda?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-3">📋 Agenda</h3>
              <ol className="space-y-2">
                {townhall.agenda.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-900/50 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Polls */}
          {townhall.polls?.length > 0 && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-white">📊 Live Polls</h3>
              {townhall.polls.map((poll) => {
                const totalVotes = poll.options.reduce(
                  (acc, o) => acc + (o.votes?.length || 0), 0
                );
                return (
                  <div key={poll._id} className="bg-gray-800/80 rounded-xl p-4">
                    <p className="font-medium text-white text-sm mb-3">{poll.question}</p>
                    {poll.options.map((opt, i) => {
                      const pct    = totalVotes ? Math.round(((opt.votes?.length || 0) / totalVotes) * 100) : 0;
                      const voted  = opt.votes?.includes(user?._id);
                      return (
                        <button
                          key={i}
                          onClick={() => poll.isActive && handleVote(poll._id, i)}
                          disabled={!poll.isActive}
                          className={`w-full text-left mb-2 rounded-lg overflow-hidden border transition-colors ${
                            voted ? 'border-indigo-500' : 'border-gray-700 hover:border-gray-600'
                          } ${!poll.isActive ? 'cursor-default' : ''}`}
                        >
                          <div className="relative px-3 py-2">
                            <div
                              className="absolute inset-0 bg-indigo-900/30 transition-all rounded-lg"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between text-sm">
                              <span className={voted ? 'text-indigo-300 font-medium' : 'text-gray-300'}>
                                {opt.text}
                              </span>
                              <span className="text-gray-400 text-xs">{pct}%</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <p className="text-xs text-gray-500 mt-1">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Attendees */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">
              👥 Attendees ({townhall.attendees?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {townhall.attendees?.slice(0, 20).map((a) => (
                <Avatar key={a._id} src={a.avatar} name={a.name} size="sm" title={a.name} />
              ))}
              {(townhall.attendees?.length || 0) > 20 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-400">
                  +{townhall.attendees.length - 20}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPoll && (
        <AddPollModal
          isOpen
          onClose={() => setShowPoll(false)}
          townhallId={id}
          onAdded={load}
        />
      )}
    </div>
  );
}

function AddPollModal({ isOpen, onClose, townhallId, onAdded }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const options = [data.opt1, data.opt2, data.opt3, data.opt4].filter(Boolean);
    if (options.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }
    try {
      await api.post(`/townhalls/${townhallId}/polls`, {
        question: data.question,
        options,
      });
      toast.success('Poll added!');
      reset();
      onClose();
      onAdded();
    } catch { /* handled */ }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Live Poll">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Question *</label>
          <input
            {...register('question', { required: 'Question is required' })}
            className="input"
            placeholder="What topic should we discuss next?"
          />
        </div>
        <div className="space-y-2">
          <label className="label">Options (min 2)</label>
          {['opt1', 'opt2', 'opt3', 'opt4'].map((k, i) => (
            <input
              key={k}
              {...register(k, { required: i < 2 })}
              className="input"
              placeholder={`Option ${i + 1}${i < 2 ? ' *' : ' (optional)'}`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Launch Poll'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
