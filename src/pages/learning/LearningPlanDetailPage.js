import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Badge, Avatar, LoadingSpinner } from '../../components/ui/index';
import { HiBookOpen, HiClock, HiUsers, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function LearningPlanDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [plan, setPlan]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get(`/learning/${id}`);
      setPlan(r.data.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const enrollment = plan?.enrolledStudents?.find(
    (e) => e.student?._id === user?._id || e.student === user?._id
  );
  const isEnrolled = !!enrollment;

  const handleEnroll = async () => {
    try {
      await api.post(`/learning/${id}/enroll`);
      toast.success('Enrolled successfully!');
      load();
    } catch { /* handled */ }
  };

  const handleComplete = async (milestoneIndex) => {
    try {
      await api.patch(`/learning/${id}/progress`, { milestoneIndex });
      toast.success('Milestone marked complete! 🎉');
      load();
    } catch { /* handled */ }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!plan)   return <div className="text-center py-20 text-gray-400">Learning plan not found</div>;

  const diffColors = { beginner: 'green', intermediate: 'amber', advanced: 'red' };
  const completedIndexes = enrollment?.completedMilestones || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={diffColors[plan.difficulty] || 'gray'}>{plan.difficulty}</Badge>
              {plan.tags?.map((t) => <Badge key={t} variant="gray">{t}</Badge>)}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{plan.title}</h1>
            <p className="text-gray-400">{plan.description}</p>
            {plan.targetAudience && (
              <p className="text-sm text-indigo-300 mt-2">🎯 For: {plan.targetAudience}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><HiBookOpen /> {plan.milestones?.length || 0} milestones</span>
              <span className="flex items-center gap-1"><HiClock /> {plan.estimatedDuration || 'Self-paced'}</span>
              <span className="flex items-center gap-1"><HiUsers /> {plan.enrolledStudents?.length || 0} enrolled</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {!isEnrolled ? (
              <button onClick={handleEnroll} className="btn-primary">Enroll Now</button>
            ) : (
              <div className="text-center">
                <Badge variant="green" className="mb-2">Enrolled ✓</Badge>
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${enrollment.progress || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{enrollment.progress || 0}% complete</p>
              </div>
            )}
          </div>
        </div>

        {plan.createdBy && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
            <Avatar src={plan.createdBy.avatar} name={plan.createdBy.name} size="sm" />
            <div>
              <p className="text-sm font-medium text-white">{plan.createdBy.name}</p>
              <p className="text-xs text-gray-400 capitalize">{plan.createdBy.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">📚 Milestones</h2>
        {plan.milestones?.length === 0 && (
          <div className="card text-center py-8 text-gray-400">No milestones added yet</div>
        )}
        {plan.milestones?.map((milestone, i) => {
          const isComplete = completedIndexes.includes(i);
          return (
            <div
              key={i}
              className={`card border-l-4 ${isComplete ? 'border-l-green-500' : 'border-l-dark-300'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      isComplete ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {isComplete ? <HiCheck /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{milestone.title}</h3>
                    {milestone.description && (
                      <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                    )}

                    {milestone.resources?.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</p>
                        {milestone.resources.map((res, j) => (
                          <a
                            key={j}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <span>
                              {res.type === 'video' ? '▶️' : res.type === 'article' ? '📄' : res.type === 'course' ? '🎓' : '📚'}
                            </span>
                            {res.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {milestone.tasks?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</p>
                        {milestone.tasks.map((task, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-indigo-400 mt-0.5 flex-shrink-0">→</span>
                            <span>
                              {task.title}
                              {task.dueInDays ? (
                                <span className="text-gray-500"> ({task.dueInDays} days)</span>
                              ) : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isEnrolled && !isComplete && (
                  <button
                    onClick={() => handleComplete(i)}
                    className="btn-secondary !py-1.5 !px-3 text-sm flex-shrink-0"
                  >
                    <HiCheck /> Mark Done
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
