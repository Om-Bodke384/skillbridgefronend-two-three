import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, EmptyState, Modal } from '../../components/ui/index';
import { HiBell, HiPlus, HiPin, HiTrash } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AnnouncementsPage() {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get('communityId');
  const { user } = useSelector((s) => s.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = ['admin', 'mentor'].includes(user?.role);

  const load = () => {
    setLoading(true);
    api.get('/announcements', { params: { communityId, isGlobal: !communityId || undefined, limit: 30 } })
      .then((r) => setAnnouncements(r.data.data.announcements || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [communityId]);

  const handleDelete = async (id) => {
    try { await api.delete(`/announcements/${id}`); toast.success('Deleted'); load(); } catch {}
  };

  const priorityVariant = { low: 'gray', medium: 'primary', high: 'amber', urgent: 'red' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-3xl flex items-center gap-2"><HiBell className="text-amber-400" /> Announcements</h1>
          <p className="section-subtitle">Stay up to date with the latest news</p>
        </div>
        {canCreate && <button onClick={() => setShowCreate(true)} className="btn-primary"><HiPlus /> Post Announcement</button>}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}</div>
      ) : announcements.length === 0 ? (
        <EmptyState icon="📢" title="No announcements" description="Nothing posted yet. Check back soon!" />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a._id} className={`card ${a.isPinned ? 'border-amber-700/50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {a.isPinned && <span className="text-amber-400 text-xs flex items-center gap-1">📌 Pinned</span>}
                    <Badge variant={priorityVariant[a.priority] || 'gray'}>{a.priority}</Badge>
                    {a.tags?.map((t) => <Badge key={t} variant="gray">{t}</Badge>)}
                  </div>
                  <h3 className="font-bold text-white mb-1">{a.title}</h3>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span>{a.author?.name}</span>
                    <span>{format(new Date(a.createdAt), 'MMM d, yyyy')}</span>
                    <span>{a.readBy?.length || 0} read</span>
                  </div>
                </div>
                {canCreate && a.author?._id === user?._id && (
                  <button onClick={() => handleDelete(a._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
                    <HiTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateAnnouncementModal isOpen onClose={() => setShowCreate(false)} onCreated={load} communityId={communityId} />}
    </div>
  );
}

function CreateAnnouncementModal({ isOpen, onClose, onCreated, communityId }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: { priority: 'medium' } });
  const onSubmit = async (data) => {
    await api.post('/announcements', {
      ...data, community: communityId || undefined, isGlobal: !communityId,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
    reset(); onClose(); onCreated();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Announcement" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" placeholder="Announcement title" /></div>
        <div><label className="label">Content *</label><textarea {...register('content', { required: true })} rows={5} className="input resize-none" placeholder="Write your announcement…" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Priority</label>
            <select {...register('priority')} className="input">
              <option value="low">Low</option><option value="medium">Medium</option>
              <option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <div><label className="label">Tags <span className="text-gray-500">(comma)</span></label><input {...register('tags')} className="input" placeholder="update, important" /></div>
        </div>
        <div className="flex items-center gap-2">
          <input {...register('isPinned')} type="checkbox" id="pin" className="w-4 h-4 rounded" />
          <label htmlFor="pin" className="text-sm text-gray-300">Pin this announcement</label>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">{isSubmitting ? '…' : 'Post'}</button>
        </div>
      </form>
    </Modal>
  );
}
