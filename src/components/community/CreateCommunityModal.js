import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { createCommunity } from '../../store/slices/communitySlice';
import { Modal } from '../ui/index';

const DOMAINS = ['Web Development','Mobile Development','Data Science','Machine Learning','DevOps','Cybersecurity','Blockchain','Cloud Computing','UI/UX Design','Other'];

export default function CreateCommunityModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(createCommunity({
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      rules: data.rules ? data.rules.split('\n').filter(Boolean) : [],
    }));
    if (!result.error) { reset(); onClose(); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Community" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        <div>
          <label className="label">Community Name *</label>
          <input {...register('name', { required: 'Name required', minLength: { value: 3, message: 'Min 3 chars' } })}
            placeholder="e.g. React Developers Hub" className={`input ${errors.name ? 'border-red-500' : ''}`} />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea {...register('description', { required: 'Description required', minLength: { value: 20, message: 'Min 20 chars' } })}
            rows={3} placeholder="What is this community about?" className={`input resize-none ${errors.description ? 'border-red-500' : ''}`} />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tech Domain *</label>
            <select {...register('domain', { required: 'Domain required' })} className="input">
              <option value="">Select domain</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.domain && <p className="text-xs text-red-400 mt-1">{errors.domain.message}</p>}
          </div>
          <div>
            <label className="label">Visibility</label>
            <select {...register('isPublic')} className="input">
              <option value={true}>Public</option>
              <option value={false}>Private</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">WhatsApp Link</label>
            <input {...register('whatsappLink')} placeholder="https://chat.whatsapp.com/…" className="input" />
          </div>
          <div>
            <label className="label">Discord Link</label>
            <input {...register('discordLink')} placeholder="https://discord.gg/…" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Tags <span className="text-gray-500">(comma separated)</span></label>
          <input {...register('tags')} placeholder="react, frontend, javascript" className="input" />
        </div>

        <div>
          <label className="label">Community Rules <span className="text-gray-500">(one per line)</span></label>
          <textarea {...register('rules')} rows={3} placeholder="Be respectful&#10;No spam&#10;Help each other" className="input resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Community'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
