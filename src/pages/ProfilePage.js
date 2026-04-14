import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import api from '../services/api';
import { Badge, Avatar, Modal, LoadingSpinner } from '../components/ui/index';
import {
  HiPencil, HiGlobe, HiCode, HiMail,
  HiExternalLink, HiUserCircle,
} from 'react-icons/hi';
import { useForm } from 'react-hook-form';

const DOMAINS = [
  'Web Development', 'Mobile Development', 'Data Science',
  'Machine Learning', 'DevOps', 'Cybersecurity', 'Blockchain',
  'Cloud Computing', 'UI/UX Design', 'Other',
];

export default function ProfilePage() {
  const { id }       = useParams();
  const dispatch     = useDispatch();
  const { user: currentUser } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const isOwn = currentUser?._id === id;

  useEffect(() => {
    api.get(`/users/${id}`)
      .then((r) => setProfile(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-400">User not found</div>;

  const roleColors = { admin: 'red', mentor: 'amber', student: 'primary' };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar src={profile.avatar} name={profile.name} size="xl" />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-700 ${
                  profile.isActive ? 'bg-green-400' : 'bg-gray-500'
                }`}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={roleColors[profile.role] || 'gray'}>{profile.role}</Badge>
                {profile.techDomain && <Badge variant="cyan">{profile.techDomain}</Badge>}
                {profile.isEmailVerified && <Badge variant="green">✓ Verified</Badge>}
              </div>
              {profile.bio && (
                <p className="text-gray-400 mt-3 max-w-md">{profile.bio}</p>
              )}
            </div>
          </div>
          {isOwn && (
            <button onClick={() => setShowEdit(true)} className="btn-secondary flex-shrink-0">
              <HiPencil /> Edit Profile
            </button>
          )}
        </div>

        {/* Social Links — using text labels, no Si icons */}
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-700 flex-wrap">
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors bg-gray-800/80 px-3 py-1.5 rounded-lg"
            >
              <HiExternalLink className="text-xs" /> GitHub
            </a>
          )}
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors bg-gray-800/80 px-3 py-1.5 rounded-lg"
            >
              <HiExternalLink className="text-xs" /> LinkedIn
            </a>
          )}
          {profile.twitter && (
            <a
              href={profile.twitter}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-sky-400 transition-colors bg-gray-800/80 px-3 py-1.5 rounded-lg"
            >
              <HiExternalLink className="text-xs" /> Twitter
            </a>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-300 transition-colors bg-gray-800/80 px-3 py-1.5 rounded-lg"
            >
              <HiGlobe className="text-xs" /> Website
            </a>
          )}
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <HiMail /> {profile.email}
          </span>
        </div>
      </div>

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <HiCode /> Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="primary">{skill}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Communities */}
      {profile.communities?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-3">
            🏘️ Communities ({profile.communities.length})
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {profile.communities.slice(0, 6).map((c) => (
              <div key={c._id} className="flex items-center gap-2 bg-gray-800/80 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-300 text-sm flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.domain}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Communities', value: profile.communities?.length || 0 },
          { label: 'Member Since', value: new Date(profile.createdAt).getFullYear() },
          { label: 'Role',         value: profile.role },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl font-bold text-indigo-400">{s.value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <EditProfileModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        profile={profile}
        onSaved={() => {
          setShowEdit(false);
          api.get(`/users/${id}`).then((r) => setProfile(r.data.data));
        }}
      />
    </div>
  );
}

function EditProfileModal({ isOpen, onClose, profile, onSaved }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name:       profile?.name        || '',
      bio:        profile?.bio         || '',
      techDomain: profile?.techDomain  || '',
      github:     profile?.github      || '',
      linkedin:   profile?.linkedin    || '',
      twitter:    profile?.twitter     || '',
      website:    profile?.website     || '',
      skills:     profile?.skills?.join(', ') || '',
    },
  });

  const onSubmit = async (data) => {
    await dispatch(updateProfile({
      ...data,
      skills: data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }));
    onSaved();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Name</label>
          <input {...register('name')} className="input" />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="input resize-none"
            placeholder="Tell others about yourself…"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tech Domain</label>
            <select {...register('techDomain')} className="input">
              <option value="">Select…</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Skills <span className="text-gray-500">(comma separated)</span></label>
            <input {...register('skills')} className="input" placeholder="React, Node.js, Python" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">GitHub URL</label>
            <input {...register('github')} className="input" placeholder="https://github.com/you" />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input {...register('linkedin')} className="input" placeholder="https://linkedin.com/in/you" />
          </div>
          <div>
            <label className="label">Twitter URL</label>
            <input {...register('twitter')} className="input" placeholder="https://twitter.com/you" />
          </div>
          <div>
            <label className="label">Website</label>
            <input {...register('website')} className="input" placeholder="https://yoursite.com" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
