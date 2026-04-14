import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiSearch, HiBell, HiMenuAlt2, HiX } from 'react-icons/hi';
import { toggleSidebar, markAllRead } from '../../store/slices/uiSlice';
import api from '../../services/api';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { notifications, unreadCount } = useSelector((s) => s.ui);
  const [search, setSearch] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get('/users/search', { params: { q } });
      setSearchResults(res.data.data.users || []);
    } catch {}
    finally { setSearching(false); }
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6 flex-shrink-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={() => dispatch(toggleSidebar())} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors lg:hidden">
          <HiMenuAlt2 className="text-xl" />
        </button>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-xl px-3 py-2 w-72 focus-within:border-indigo-500 transition-colors">
            <HiSearch className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search users, communities…"
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchResults([]); }} className="text-gray-400 hover:text-white">
                <HiX className="text-sm" />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => { navigate(`/profile/${u._id}`); setSearch(''); setSearchResults([]); }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {u.avatar ? <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" /> : u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.role} · {u.techDomain || 'No domain'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); dispatch(markAllRead()); }}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors"
          >
            <HiBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="font-semibold text-white text-sm">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications yet</div>
              ) : (
                notifications.slice(0, 8).map((n, i) => (
                  <div key={i} className={`px-4 py-3 border-b border-gray-700 last:border-0 ${!n.read ? 'bg-indigo-900/20' : ''}`}>
                    <p className="text-sm text-white">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button onClick={() => navigate(`/profile/${user?._id}`)} className="flex items-center gap-2 hover:bg-gray-700 rounded-xl p-1.5 transition-colors">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-white hidden md:block">{user?.name}</span>
        </button>
      </div>
    </header>
  );
}
