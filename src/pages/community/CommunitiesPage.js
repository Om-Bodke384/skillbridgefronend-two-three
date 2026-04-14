import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunities, joinCommunity } from '../../store/slices/communitySlice';
import { Badge, EmptyState, Pagination } from '../../components/ui/index';
import { HiSearch, HiPlus, HiUsers } from 'react-icons/hi';
import CreateCommunityModal from '../../components/community/CreateCommunityModal';

const DOMAINS = [
  'All','Web Development','Mobile Development','Data Science',
  'Machine Learning','DevOps','Cybersecurity','Blockchain',
  'Cloud Computing','UI/UX Design','Other',
];

export default function CommunitiesPage() {
  const dispatch = useDispatch();
  const { communities, myCommunities, pagination, isLoading } = useSelector((s) => s.community);
  const { user } = useSelector((s) => s.auth);
  const [search, setSearch]     = useState('');
  const [domain, setDomain]     = useState('');
  const [page, setPage]         = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchCommunities({
      page,
      limit: 12,
      domain: domain || undefined,
      search: search || undefined,
    }));
  }, [dispatch, page, domain, search]);

  const canCreate = ['admin', 'mentor'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Communities</h1>
          <p className="text-gray-400 mt-1">Find your tribe — join domain-specific tech communities</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <HiPlus /> Create Community
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search communities…"
            className="input pl-10"
          />
        </div>
        <select
          value={domain}
          onChange={(e) => { setDomain(e.target.value); setPage(1); }}
          className="input sm:w-56"
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d === 'All' ? '' : d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-48">
              <div className="w-12 h-12 rounded-xl bg-gray-600 mb-3" />
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-600 rounded w-full mb-1" />
              <div className="h-3 bg-gray-600 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : communities.length === 0 ? (
        <EmptyState
          icon="🏘️"
          title="No communities found"
          description="Try different search terms or create a new community!"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => {
            const isMember = myCommunities.some((m) => m._id === c._id);
            return (
              <div key={c._id} className="card-hover flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-900/50 border border-indigo-700/30 flex items-center justify-center text-2xl font-bold text-indigo-300 flex-shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>
                  <Badge variant="primary">{c.domain}</Badge>
                </div>
                <Link to={`/communities/${c._id}`}>
                  <h3 className="font-bold text-white mb-1 hover:text-indigo-300 transition-colors">
                    {c.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 line-clamp-2 flex-1 mb-4">{c.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <HiUsers /> <span>{c.memberCount || 0} members</span>
                  </div>
                  {isMember ? (
                    <Link to={`/communities/${c._id}`} className="btn-secondary !py-1.5 !px-3 text-sm">
                      View
                    </Link>
                  ) : (
                    <button
                      onClick={() => dispatch(joinCommunity(c._id))}
                      className="btn-primary !py-1.5 !px-3 text-sm"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />

      <CreateCommunityModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
