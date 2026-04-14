import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyCommunities } from '../../store/slices/communitySlice';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((s) => s.ui);

  useEffect(() => {
    dispatch(fetchMyCommunities());
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
