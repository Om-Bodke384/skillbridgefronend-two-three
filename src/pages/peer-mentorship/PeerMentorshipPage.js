import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, EmptyState, Modal, Avatar } from '../../components/ui/index';
import { HiHand, HiPlus, HiCheck, HiStar } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function PeerMentorshipPage() {
  const [searchParams] = useSearchParams();
  const communityId    = searchParams.get('communityId');
  const { user }       = useSelector((s) => s.auth);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab]               = useState('open');

  const load = () => {
    setLoading(true);
    api.get('/peer-mentorship', {
      params: { communityId: communityId || undefined, status: tab, limit: 20 },
    })
      .then((r) => setRequests(r.data.data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [communityId, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRespond = async (requestId, message) => {
    try {
      await api.post(`/peer-mentorship/${requestId}/respond`, { message });
      toast.success('Response sent!');
      load();
    } catch { /* handled */ }
  };

  const handleAccept = async (requestId, responseId) => {
    try {
      await api.patch(`/peer-mentorship/${requestId}/responses/${responseId}/accept`);
      toast.success('Helper accepted!');
      load();
    } catch { /* handled */ }
  };

  const handleResolve = async (requestId) => {
    try {
      await api.patch(`/peer-mentorship/${requestId}/resolve`, { rating: 5 });
      toast.success('Request marked as resolved!');
      load();
    } catch { /* handled */ }
  };

  const urgencyVariant = { low: 'gray', medium: 'amber', high: 'red' };
  const statusVariant  = { open: 'green', in_progress: 'cyan', resolved: 'gray', closed: 'gray' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <HiHand className="text-purple-400" /> Peer Mentorship
          </h1>
          <p className="text-gray-400 mt-1">Ask for help from peers — knowledge flows both ways</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <HiPlus /> Ask for Help
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 w-fit">
        {['open', 'in_progress', 'resolved'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon="🙋"
          title="No requests"
          description={
            tab === 'open'
              ? "No one needs help right now. Be the first to ask!"
              : "Nothing here yet."
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isOwner      = req.requester?._id === user?._id;
            const hasResponded = req.responses?.some((r) => r.helper?._id === user?._id);

            return (
              <div key={req._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={statusVariant[req.status] || 'gray'}>
                        {req.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={urgencyVariant[req.urgency] || 'gray'}>
                        {req.urgency} urgency
                      </Badge>
                      {req.skillsNeeded?.slice(0, 3).map((s) => (
                        <Badge key={s} variant="gray">{s}</Badge>
                      ))}
                    </div>

                    <h3 className="font-bold text-white mb-1">{req.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{req.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Avatar src={req.requester?.avatar} name={req.requester?.name} size="xs" />
                        <span className="text-xs text-gray-400">{req.requester?.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {req.responses?.length || 0} response{req.responses?.length !== 1 ? 's' : ''}
                      </span>
                      {req.rating && (
                        <span className="flex items-center gap-1 text-amber-400 text-xs">
                          <HiStar /> {req.rating}/5
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Responses */}
                {req.responses?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                    {req.responses.slice(0, 3).map((resp) => (
                      <div
                        key={resp._id}
                        className={`flex items-start gap-2 p-3 rounded-xl ${
                          resp.isAccepted
                            ? 'bg-green-900/20 border border-green-700/30'
                            : 'bg-gray-800/80'
                        }`}
                      >
                        <Avatar src={resp.helper?.avatar} name={resp.helper?.name} size="xs" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-white">{resp.helper?.name}</span>
                            {resp.isAccepted && <Badge variant="green">Accepted ✓</Badge>}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{resp.message}</p>
                        </div>
                        {isOwner && req.status === 'open' && !resp.isAccepted && (
                          <button
                            onClick={() => handleAccept(req._id, resp._id)}
                            className="btn-primary !py-1 !px-2 text-xs flex-shrink-0"
                          >
                            <HiCheck /> Accept
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline respond */}
                {req.status === 'open' && !isOwner && !hasResponded && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <RespondInline requestId={req._id} onRespond={handleRespond} />
                  </div>
                )}

                {/* Resolve button */}
                {isOwner && req.status === 'in_progress' && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => handleResolve(req._id)}
                      className="btn-secondary text-sm"
                    >
                      ✅ Mark as Resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateRequestModal
          isOpen
          onClose={() => setShowCreate(false)}
          onCreated={load}
          communityId={communityId}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RespondInline({ requestId, onRespond }) {
  const [msg, setMsg]       = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    await onRespond(requestId, msg);
    setMsg('');
    setSending(false);
  };

  return (
    <div className="flex gap-2">
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Offer your help…"
        className="input !py-2 flex-1 text-sm"
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
      />
      <button
        onClick={handleSend}
        disabled={!msg.trim() || sending}
        className="btn-primary !py-2 !px-4 text-sm"
      >
        {sending ? '…' : 'Help'}
      </button>
    </div>
  );
}

function CreateRequestModal({ isOpen, onClose, onCreated, communityId }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    defaultValues: { urgency: 'medium' },
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/peer-mentorship', {
        ...data,
        community: communityId || undefined,
        isGlobal: !communityId,
        skillsNeeded: data.skillsNeeded
          ? data.skillsNeeded.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });
      toast.success('Help request posted!');
      reset();
      onClose();
      onCreated();
    } catch { /* handled */ }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask for Help" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className={`input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Need help with React state management"
          />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters' } })}
            rows={4}
            className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Describe your problem in detail so peers can help effectively…"
          />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Urgency</label>
            <select {...register('urgency')} className="input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label">Skills Needed <span className="text-gray-500">(comma)</span></label>
            <input
              {...register('skillsNeeded')}
              className="input"
              placeholder="React, Redux, TypeScript"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Post Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
