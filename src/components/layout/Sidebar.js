import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import {
  HiHome,
  HiUserGroup,
  HiChatAlt2,
  HiSpeakerphone,
  HiLightningBolt,
  HiCalendar,
  HiBell,
  HiAcademicCap,
  HiClipboardCheck,
  HiHand,
  HiShieldCheck,
  HiLogout,
  HiChevronLeft,
  HiChevronRight,
  HiOfficeBuilding,
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard',       icon: HiHome,            label: 'Dashboard'       },
  { to: '/communities',     icon: HiUserGroup,        label: 'Communities'     },
  { to: '/chat',            icon: HiChatAlt2,         label: 'Chat'            },
  { to: '/townhalls',       icon: HiOfficeBuilding,   label: 'Town Hall'       },
  { to: '/hackathons',      icon: HiLightningBolt,    label: 'Hackathons'      },
  { to: '/events',          icon: HiCalendar,         label: 'Events'          },
  { to: '/announcements',   icon: HiBell,             label: 'Announcements'   },
  { to: '/learning',        icon: HiAcademicCap,      label: 'Learning Plans'  },
  { to: '/peer-review',     icon: HiClipboardCheck,   label: 'Peer Review'     },
  { to: '/peer-mentorship', icon: HiHand,             label: 'Peer Mentorship' },
];

export default function Sidebar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { sidebarCollapsed }  = useSelector((s) => s.ui);
  const { user }              = useSelector((s) => s.auth);
  const { myCommunities }     = useSelector((s) => s.community);
  const [showCommunities, setShowCommunities] = useState(true);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 flex flex-col z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <HiLightningBolt className="text-white text-sm" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">SkillBridge</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
            <HiLightningBolt className="text-white text-sm" />
          </div>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <HiChevronLeft className="text-lg" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-gray-400 hover:text-white p-3 hover:bg-gray-700 transition-colors flex justify-center"
        >
          <HiChevronRight className="text-lg" />
        </button>
      )}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto scrollbar-hidden px-2 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm cursor-pointer ${
                isActive
                  ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`
            }
          >
            <Icon className={`text-lg flex-shrink-0 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Admin link */}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            title={sidebarCollapsed ? 'Admin' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm cursor-pointer ${
                isActive
                  ? 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
                  : 'text-gray-400 hover:text-amber-300 hover:bg-gray-700'
              }`
            }
          >
            <HiShieldCheck className={`text-lg flex-shrink-0 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
            {!sidebarCollapsed && <span>Admin Panel</span>}
          </NavLink>
        )}

        {/* My Communities */}
        {!sidebarCollapsed && myCommunities.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setShowCommunities(!showCommunities)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
            >
              <span>My Communities</span>
              <HiChevronRight
                className={`transition-transform ${showCommunities ? 'rotate-90' : ''}`}
              />
            </button>
            {showCommunities && (
              <div className="mt-1 space-y-0.5">
                {myCommunities.slice(0, 6).map((community) => (
                  <NavLink
                    key={community._id}
                    to={`/communities/${community._id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`
                    }
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-300">
                      {community.name[0].toUpperCase()}
                    </div>
                    <span className="truncate">{community.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-700 p-3">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <NavLink
              to={`/profile/${user?._id}`}
              className="flex items-center gap-2.5 flex-1 min-w-0 hover:bg-gray-700 rounded-xl p-1.5 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <HiLogout className="text-lg" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full flex justify-center p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <HiLogout className="text-lg" />
          </button>
        )}
      </div>
    </aside>
  );
}
