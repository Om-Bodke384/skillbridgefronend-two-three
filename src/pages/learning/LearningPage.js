import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, EmptyState, Modal, Avatar } from '../../components/ui/index';
import { HiAcademicCap, HiPlus, HiClock, HiUsers, HiBookOpen } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function LearningPage() {
  const [searchParams]  = useSearchParams();
  const communityId     = searchParams.get('communityId');
  const { user }        = useSelector((s) => s.auth);
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = ['admin', 'mentor'].includes(user?.role);

  const load = () => {
    setLoading(true);
    api.get('/learning', { params: { communityId: communityId || undefined, limit: 20 } })
      .then((r) => setPlans(r.data.data.plans || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [communityId]);

  const diffColors = { beginner: 'green', intermediate: 'amber', advanced: 'red' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <HiAcademicCap className="text-green-400" /> Learning Plans
          </h1>
          <p className="text-gray-400 mt-1">Structured guided learning paths created by mentors</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <HiPlus /> Create Plan
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-44" />)}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon="🎓"
          title="No learning plans yet"
          description="Mentors can create structured learning paths for students."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <Link key={plan._id} to={`/learning/${plan._id}`} className="card-hover group">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={diffColors[plan.difficulty] || 'gray'}>{plan.difficulty}</Badge>
                {plan.community && <Badge variant="primary">{plan.community.name}</Badge>}
              </div>
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-indigo-300 transition-colors">
                {plan.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4">{plan.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <HiBookOpen /> {plan.milestones?.length || 0} milestones
                </span>
                <span className="flex items-center gap-1">
                  <HiClock /> {plan.estimatedDuration || 'Self-paced'}
                </span>
                <span className="flex items-center gap-1">
                  <HiUsers /> {plan.enrolledStudents?.length || 0} enrolled
                </span>
              </div>
              {plan.createdBy && (
                <div className="flex items-center gap-2 mt-4">
                  <Avatar src={plan.createdBy.avatar} name={plan.createdBy.name} size="xs" />
                  <span className="text-xs text-gray-400">{plan.createdBy.name}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <CreateLearningPlanModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
        communityId={communityId}
      />
    </div>
  );
}

function CreateLearningPlanModal({ isOpen, onClose, onCreated, communityId }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { difficulty: 'beginner' },
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/learning', {
        ...data,
        community: communityId || undefined,
        isPublished: true,
        tags: data.tags
          ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        milestones: data.milestonesList
          ? data.milestonesList
              .split('\n')
              .filter(Boolean)
              .map((title, i) => ({ title: title.trim(), order: i }))
          : [],
      });
      toast.success('Learning plan created!');
      reset();
      onClose();
      onCreated();
    } catch { /* handled */ }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Learning Plan" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="input"
            placeholder="Full Stack Development in 12 Weeks"
          />
        </div>
        <div>
          <label className="label">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="input resize-none"
            placeholder="What will students learn?"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Difficulty</label>
            <select {...register('difficulty')} className="input">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Estimated Duration</label>
            <input {...register('estimatedDuration')} className="input" placeholder="8 weeks" />
          </div>
        </div>
        <div>
          <label className="label">Milestone Titles <span className="text-gray-500">(one per line)</span></label>
          <textarea
            {...register('milestonesList')}
            rows={5}
            className="input resize-none"
            placeholder={"HTML & CSS Basics\nJavaScript Fundamentals\nReact Basics\nNode.js & Express\nMongoDB"}
          />
        </div>
        <div>
          <label className="label">Target Audience</label>
          <input
            {...register('targetAudience')}
            className="input"
            placeholder="Beginners with basic programming knowledge"
          />
        </div>
        <div>
          <label className="label">Tags <span className="text-gray-500">(comma separated)</span></label>
          <input {...register('tags')} className="input" placeholder="react, fullstack, beginner" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Create Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
