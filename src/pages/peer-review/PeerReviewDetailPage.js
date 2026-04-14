import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Badge, Avatar, Modal, LoadingSpinner } from '../../components/ui/index';
import { HiStar, HiExternalLink, HiUpload, HiClipboardCheck, HiCheckCircle } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PeerReviewDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [session, setSession] = useState(null);
  const [myAssignments, setMyAssignments] = useState({ toReview: [], mySubmission: null });
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api.get(`/peer-reviews/${id}`),
        api.get(`/peer-reviews/${id}/assignments`),
      ]);
      setSession(sRes.data.data);
      setMyAssignments(aRes.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!session) return <div className="text-center py-20 text-gray-400">Session not found</div>;

  const hasSubmitted = !!myAssignments.mySubmission;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={session.status === 'open' ? 'green' : session.status === 'reviewing' ? 'cyan' : 'gray'}>{session.status}</Badge>
              {session.deadline && <Badge variant="amber">Due {format(new Date(session.deadline), 'MMM d, HH:mm')}</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{session.title}</h1>
            <p className="text-gray-400">{session.description}</p>
          </div>
          {!hasSubmitted && session.status !== 'completed' && (
            <button onClick={() => setShowSubmit(true)} className="btn-primary flex-shrink-0">
              <HiUpload /> Submit Project
            </button>
          )}
          {hasSubmitted && <Badge variant="green" className="flex-shrink-0"><HiCheckCircle /> Submitted</Badge>}
        </div>

        {session.task && (
          <div className="mt-4 bg-gray-800/80 border border-gray-700 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">📋 Task</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{session.task}</p>
          </div>
        )}
      </div>

      {/* My Submission */}
      {myAssignments.mySubmission && (
        <div className="card border-green-800/50">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2"><HiCheckCircle className="text-green-400" /> My Submission</h2>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-medium text-white">{myAssignments.mySubmission.projectTitle}</p>
              <p className="text-sm text-gray-400 mt-1">{myAssignments.mySubmission.projectDescription}</p>
              <a href={myAssignments.mySubmission.projectLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 text-sm mt-2 hover:text-indigo-300">
                <HiExternalLink /> View Project
              </a>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Reviews received</p>
              <p className="text-2xl font-bold text-white">{myAssignments.mySubmission.reviews?.length || 0}</p>
              {myAssignments.mySubmission.averageRating > 0 && (
                <div className="flex items-center gap-1 text-amber-400 justify-end">
                  <HiStar />
                  <span className="font-semibold">{myAssignments.mySubmission.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews on my submission */}
          {myAssignments.mySubmission.reviews?.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-gray-300">Feedback received:</p>
              {myAssignments.mySubmission.reviews.map((rev, i) => (
                <div key={i} className="bg-gray-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={rev.reviewer?.avatar} name={rev.reviewer?.name} size="xs" />
                      <span className="text-sm font-medium text-white">{rev.reviewer?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, j) => <HiStar key={j} className={j < rev.rating ? 'text-amber-400' : 'text-gray-300'} />)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{rev.feedback}</p>
                  {rev.strengths?.length > 0 && (
                    <div className="mt-2"><p className="text-xs text-green-400 font-medium">✅ Strengths: {rev.strengths.join(', ')}</p></div>
                  )}
                  {rev.improvements?.length > 0 && (
                    <div className="mt-1"><p className="text-xs text-amber-400 font-medium">💡 Improve: {rev.improvements.join(', ')}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews to give */}
      {myAssignments.toReview?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <HiClipboardCheck className="text-indigo-400" /> Projects to Review ({myAssignments.toReview.length})
          </h2>
          <div className="space-y-3">
            {myAssignments.toReview.map((sub) => (
              <div key={sub._id} className="bg-gray-800/80 border border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar src={sub.student?.avatar} name={sub.student?.name} size="xs" />
                      <span className="text-sm font-medium text-white">{sub.student?.name}</span>
                    </div>
                    <h3 className="font-semibold text-white">{sub.projectTitle}</h3>
                    <p className="text-sm text-gray-400 mt-1">{sub.projectDescription}</p>
                    <a href={sub.projectLink} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 text-sm mt-2 hover:text-indigo-300">
                      <HiExternalLink /> View Project
                    </a>
                  </div>
                  <button onClick={() => setReviewTarget(sub)} className="btn-primary !py-1.5 !px-3 text-sm flex-shrink-0">
                    Give Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Submissions (mentor/admin view) */}
      {['admin', 'mentor'].includes(user?.role) && session.submissions?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4">All Submissions ({session.submissions.length})</h2>
          <div className="space-y-3">
            {session.submissions.map((sub) => (
              <div key={sub._id} className="bg-gray-800/80 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar src={sub.student?.avatar} name={sub.student?.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">{sub.student?.name}</p>
                      <a href={sub.projectLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <HiExternalLink className="text-xs" /> {sub.projectTitle}
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{sub.reviews?.length}/{session.maxReviewersPerSubmission} reviews</p>
                    {sub.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-amber-400 justify-end">
                        <HiStar className="text-xs" />
                        <span className="text-sm font-semibold">{sub.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SubmitProjectModal isOpen={showSubmit} onClose={() => setShowSubmit(false)} sessionId={id} onSubmitted={load} />
      <GiveReviewModal isOpen={!!reviewTarget} onClose={() => setReviewTarget(null)} sessionId={id} submission={reviewTarget} onReviewed={load} />
    </div>
  );
}

function SubmitProjectModal({ isOpen, onClose, sessionId, onSubmitted }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post(`/peer-reviews/${sessionId}/submit`, {
        ...data,
        techStack: data.techStack ? data.techStack.split(',').map((t) => t.trim()) : [],
      });
      toast.success('Project submitted! You\'ve been assigned peers to review.');
      reset(); onClose(); onSubmitted();
    } catch {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Your Project" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Project Title *</label>
          <input {...register('projectTitle', { required: true })} placeholder="My Awesome Project" className="input" />
        </div>
        <div>
          <label className="label">Project Link *</label>
          <input {...register('projectLink', { required: true, pattern: { value: /^https?:\/\//, message: 'Enter a valid URL' } })}
            placeholder="https://github.com/you/project" className={`input ${errors.projectLink ? 'border-red-500' : ''}`} />
          {errors.projectLink && <p className="text-xs text-red-400 mt-1">{errors.projectLink.message}</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea {...register('projectDescription')} rows={3} placeholder="What does your project do?" className="input resize-none" />
        </div>
        <div>
          <label className="label">Tech Stack <span className="text-gray-500">(comma separated)</span></label>
          <input {...register('techStack')} placeholder="React, Node.js, MongoDB" className="input" />
        </div>
        <div className="bg-indigo-900/20 border border-indigo-800/50 rounded-xl p-3 text-sm text-indigo-300">
          💡 After submitting, you'll be automatically assigned to review other students' projects.
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function GiveReviewModal({ isOpen, onClose, sessionId, submission, onReviewed }) {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({ defaultValues: { rating: 4 } });
  const rating = parseInt(watch('rating') || 4);

  const onSubmit = async (data) => {
    try {
      await api.post(`/peer-reviews/${sessionId}/submissions/${submission._id}/review`, {
        rating: parseInt(data.rating),
        feedback: data.feedback,
        strengths: data.strengths ? data.strengths.split(',').map((s) => s.trim()).filter(Boolean) : [],
        improvements: data.improvements ? data.improvements.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success('Review submitted!');
      reset(); onClose(); onReviewed();
    } catch {}
  };

  if (!submission) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review: ${submission.projectTitle}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="bg-gray-800/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-gray-300">{submission.projectTitle}</span>
          <a href={submission.projectLink} target="_blank" rel="noreferrer" className="btn-ghost !py-1 !px-2 text-xs">
            <HiExternalLink /> Open
          </a>
        </div>

        <div>
          <label className="label">Rating *</label>
          <div className="flex items-center gap-3">
            <input {...register('rating', { required: true })} type="range" min={1} max={5} step={1} className="flex-1" />
            <div className="flex items-center gap-1 text-amber-400 w-20">
              {[...Array(5)].map((_, i) => <HiStar key={i} className={i < rating ? 'text-amber-400' : 'text-gray-300'} />)}
            </div>
            <span className="text-white font-bold w-8 text-center">{rating}/5</span>
          </div>
        </div>

        <div>
          <label className="label">Feedback *</label>
          <textarea {...register('feedback', { required: true, minLength: { value: 20, message: 'Min 20 characters' } })}
            rows={4} placeholder="Give constructive, specific feedback…" className="input resize-none" />
        </div>

        <div>
          <label className="label">Strengths <span className="text-gray-500">(comma separated)</span></label>
          <input {...register('strengths')} placeholder="Clean code, Good documentation, Innovative approach" className="input" />
        </div>

        <div>
          <label className="label">Areas to Improve <span className="text-gray-500">(comma separated)</span></label>
          <input {...register('improvements')} placeholder="Error handling, Test coverage, Performance" className="input" />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
