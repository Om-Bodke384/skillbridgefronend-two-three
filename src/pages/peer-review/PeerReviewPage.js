import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, EmptyState, Modal, Avatar } from '../../components/ui/index';
import { HiPlus, HiClipboardCheck, HiStar, HiExternalLink, HiClock } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function PeerReviewPage() {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get('communityId');
  const { user } = useSelector((s) => s.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = ['admin', 'mentor'].includes(user?.role);

  const load = () => {
    setLoading(true);
    api.get('/peer-reviews', { params: { communityId, limit: 20 } })
      .then((r) => setReviews(r.data.data.reviews || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [communityId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl flex items-center gap-2"><HiClipboardCheck className="text-indigo-400" /> Peer Review</h1>
          <p className="section-subtitle">Submit projects, get feedback, give reviews — grow together</p>
        </div>
        {canCreate && <button onClick={() => setShowCreate(true)} className="btn-primary"><HiPlus /> Create Session</button>}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState icon="📋" title="No peer review sessions" description="Mentors can create sessions for students to submit and review each other's projects." />
      ) : (
        <div className="grid gap-4">
          {reviews.map((r) => (
            <Link key={r._id} to={`/peer-review/${r._id}`} className="card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={r.status === 'open' ? 'green' : r.status === 'reviewing' ? 'cyan' : 'gray'}>{r.status}</Badge>
                    {r.community && <Badge variant="primary">{r.community.name}</Badge>}
                    {r.tags?.slice(0, 3).map((t) => <Badge key={t} variant="gray">{t}</Badge>)}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Avatar src={r.createdBy?.avatar} name={r.createdBy?.name} size="xs" /> {r.createdBy?.name}</span>
                    <span className="flex items-center gap-1"><HiClipboardCheck /> {r.submissions?.length || 0} submissions</span>
                    {r.deadline && <span className="flex items-center gap-1"><HiClock /> Due {format(new Date(r.deadline), 'MMM d')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 flex-shrink-0">
                  <HiStar />
                  <span className="text-sm font-medium">Peer Review</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateReviewModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={load} communityId={communityId} />
    </div>
  );
}

function CreateReviewModal({ isOpen, onClose, onCreated, communityId }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await api.post('/peer-reviews', {
      ...data,
      communityId: communityId || undefined,
      isGlobal: !communityId,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
    reset(); onClose(); onCreated();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Peer Review Session" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Session Title *</label>
          <input {...register('title', { required: true })} placeholder="e.g. Build a REST API — Week 3 Review" className="input" />
        </div>
        <div>
          <label className="label">Description *</label>
          <textarea {...register('description', { required: true })} rows={3} placeholder="What should students build and focus on?" className="input resize-none" />
        </div>
        <div>
          <label className="label">Task Instructions</label>
          <textarea {...register('task')} rows={4} placeholder="Detailed task description…" className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Deadline</label>
            <input {...register('deadline')} type="datetime-local" className="input" />
          </div>
          <div>
            <label className="label">Max Reviewers/Submission</label>
            <input {...register('maxReviewersPerSubmission')} type="number" defaultValue={2} min={1} max={5} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Tags <span className="text-gray-500">(comma separated)</span></label>
          <input {...register('tags')} placeholder="api, backend, nodejs" className="input" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
