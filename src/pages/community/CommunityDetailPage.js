import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunity, joinCommunity, leaveCommunity } from '../../store/slices/communitySlice';
import { Badge, Avatar, LoadingSpinner } from '../../components/ui/index';
import {
  HiUsers, HiUserAdd, HiLogout, HiChevronRight,
  HiChat, HiLink, HiExternalLink,
} from 'react-icons/hi';

const TABS = ['Overview', 'Chat', 'Announcements', 'Events', 'Hackathons', 'Learning', 'Peer Review'];

export default function CommunityDetailPage() {
  const { id }       = useParams();
  const dispatch     = useDispatch();
  const { activeCommunity: community, myCommunities, isLoading } = useSelector((s) => s.community);
  const { user }     = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('Overview');

  const isMember = myCommunities.some((c) => c._id === id);
  const isMentor = community?.mentors?.some((m) => m._id === user?._id);
  const isAdmin  = community?.admins?.some((a)  => a._id === user?._id);

  useEffect(() => { dispatch(fetchCommunity(id)); }, [dispatch, id]);

  if (isLoading || !community) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="card overflow-hidden !p-0">
        <div className="h-32 bg-gradient-to-br from-indigo-900/60 via-gray-800 to-gray-900 relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #06b6d4 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4 flex-wrap gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-900 border-4 border-gray-700 flex items-center justify-center text-3xl font-bold text-indigo-300">
              {community.name[0].toUpperCase()}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Social links — using text labels instead of Si icons */}
              {community.whatsappLink && (
                <a
                  href={community.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 text-green-400 rounded-xl hover:bg-green-900/50 transition-colors text-xs font-medium"
                >
                  <HiLink className="text-sm" /> WhatsApp
                </a>
              )}
              {community.discordLink && (
                <a
                  href={community.discordLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/30 text-indigo-400 rounded-xl hover:bg-indigo-900/50 transition-colors text-xs font-medium"
                >
                  <HiLink className="text-sm" /> Discord
                </a>
              )}
              {community.telegramLink && (
                <a
                  href={community.telegramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-xl hover:bg-blue-900/50 transition-colors text-xs font-medium"
                >
                  <HiLink className="text-sm" /> Telegram
                </a>
              )}
              {community.slackLink && (
                <a
                  href={community.slackLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/30 text-purple-400 rounded-xl hover:bg-purple-900/50 transition-colors text-xs font-medium"
                >
                  <HiLink className="text-sm" /> Slack
                </a>
              )}
              {!isMember ? (
                <button
                  onClick={() => dispatch(joinCommunity(id))}
                  className="btn-primary"
                >
                  <HiUserAdd /> Join Community
                </button>
              ) : (
                <button
                  onClick={() => dispatch(leaveCommunity(id))}
                  className="btn-secondary text-sm"
                >
                  <HiLogout /> Leave
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{community.name}</h1>
              <p className="text-gray-400 max-w-xl">{community.description}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Badge variant="primary">{community.domain}</Badge>
                {community.tags?.map((t) => <Badge key={t} variant="gray">{t}</Badge>)}
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <HiUsers /> {community.memberCount} members
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hidden bg-gray-800 border border-gray-700 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {community.rules?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-white mb-3">📜 Community Rules</h3>
                <ol className="space-y-2">
                  {community.rules.map((rule, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-indigo-900/50 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Mentors */}
            <div className="card">
              <h3 className="font-semibold text-white mb-3">🎓 Mentors</h3>
              {community.mentors?.length === 0 ? (
                <p className="text-sm text-gray-400">No mentors yet</p>
              ) : (
                community.mentors?.slice(0, 5).map((m) => (
                  <Link
                    to={`/profile/${m._id}`}
                    key={m._id}
                    className="flex items-center gap-2 mb-2 hover:bg-gray-700 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Avatar src={m.avatar} name={m.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{m.role}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Members */}
            <div className="card">
              <h3 className="font-semibold text-white mb-3">
                👥 Members ({community.memberCount})
              </h3>
              <div className="flex flex-wrap gap-2">
                {community.members?.slice(0, 12).map((m) => (
                  <Link key={m._id} to={`/profile/${m._id}`} title={m.name}>
                    <Avatar
                      src={m.avatar}
                      name={m.name}
                      size="sm"
                      className="hover:ring-2 hover:ring-indigo-500 transition-all"
                    />
                  </Link>
                ))}
                {community.memberCount > 12 && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-400">
                    +{community.memberCount - 12}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Chat' && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-white font-semibold mb-2">Community Chat</p>
          <p className="text-gray-400 text-sm mb-5">Chat with all community members in real-time</p>
          <Link
            to={`/chat?room=community:${id}`}
            className="btn-primary"
          >
            <HiChat /> Open Chat
          </Link>
        </div>
      )}

      {['Announcements', 'Events', 'Hackathons', 'Learning', 'Peer Review'].includes(activeTab) && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">
            {activeTab === 'Announcements' ? '📢'
              : activeTab === 'Events' ? '📅'
              : activeTab === 'Hackathons' ? '⚡'
              : activeTab === 'Learning' ? '🎓'
              : '📋'}
          </p>
          <p className="text-gray-400 mb-4">{activeTab} for this community</p>
          <Link
            to={`/${activeTab.toLowerCase().replace(' ', '-')}?communityId=${id}`}
            className="btn-primary"
          >
            View {activeTab}
          </Link>
        </div>
      )}
    </div>
  );
}
