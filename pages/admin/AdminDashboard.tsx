import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, User, FileText, BarChart2, Bell, LogOut, Trash2, Menu, X } from 'lucide-react';
import AdminProfile from './Profile';
import FundingManagement from './FundingManagement';
import Insights from './Insights';
import Announcements from './Announcements';
import ExpiredPosts from './ExpiredPosts';

const AdminSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.includes(path);

  const navItemClass = (path: string) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive(path) ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-indigo-800 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-indigo-900 text-white transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-indigo-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-xs text-indigo-300 mt-1">Funding Call Notice Board</p>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin/profile" className={navItemClass('profile')} onClick={() => onClose()}>
            <User size={20} /> <span>Profile</span>
          </Link>
          <Link to="/admin/funding" className={navItemClass('funding')} onClick={() => onClose()}>
            <FileText size={20} /> <span>Funding Mgmt</span>
          </Link>
          <Link to="/admin/insights" className={navItemClass('insights')} onClick={() => onClose()}>
            <BarChart2 size={20} /> <span>Insights</span>
          </Link>
          <Link to="/admin/announcements" className={navItemClass('announcements')} onClick={() => onClose()}>
            <Bell size={20} /> <span>Announcements</span>
          </Link>
          <Link to="/admin/expired" className={navItemClass('expired')} onClick={() => onClose()}>
            <Trash2 size={20} /> <span>Expired Posts</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold">Admin Portal</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-indigo-800 rounded">
          <Menu size={24} />
        </button>
      </div>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full">
        <Routes>
          <Route path="/" element={<FundingManagement />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/funding" element={<FundingManagement />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/expired" element={<ExpiredPosts />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;