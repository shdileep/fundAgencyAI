import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Filter, ExternalLink, Calendar, Briefcase, X, Trash2, Download } from 'lucide-react';
import { PREDEFINED_AGENCIES, PREDEFINED_DEPARTMENTS } from '../../constants';

const UserDashboard = () => {
  const { currentUser, fundingCalls, logout, notifications, removeNotification, isInstallable, installApp } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [filterAgency, setFilterAgency] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Get active calls
  const activeCalls = fundingCalls.filter(c => c.status === 'Active');

  const filteredCalls = activeCalls.filter(call => {
    // Searchable text match for Agency
    const matchesAgency = filterAgency 
      ? call.agency.toLowerCase().includes(filterAgency.toLowerCase()) 
      : true;
    
    // Searchable text match for Department
    // Check if any of the departments in the call match the search text
    const matchesDept = filterDept 
      ? call.departments.some(d => d.toLowerCase().includes(filterDept.toLowerCase()))
      : true;

    const matchesMonth = filterMonth ? call.deadline.startsWith(filterMonth) : true;
    return matchesAgency && matchesDept && matchesMonth;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Branding */}
            <div className="flex items-center flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-bold text-indigo-600 truncate">Funding Board</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Install Button (Mobile/PWA) */}
              {isInstallable && (
                <button 
                  onClick={installApp}
                  className="hidden sm:flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Download size={16} className="mr-1.5" /> Install App
                </button>
              )}

              {/* Notification Icon */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell size={22} />
                  {notifications.length > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                
                {/* Notification Dropdown - Mobile Optimized */}
                {showNotifications && (
                    <>
                      {/* Backdrop for mobile to close on click outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute right-[-3rem] sm:right-0 mt-2 w-[90vw] sm:w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                          <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                          </div>
                          <div className="max-h-[60vh] overflow-y-auto">
                              {notifications.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-center text-gray-500">No new notifications</p>
                              ) : (
                                  notifications.map(n => (
                                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b last:border-0 transition-colors flex justify-between items-start group">
                                          <div>
                                            <p className="text-sm text-gray-800 font-medium leading-snug">{n.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                          </div>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                            className="ml-2 text-gray-400 hover:text-red-600 p-1"
                                            title="Delete Notification"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                    </>
                )}
              </div>

              {/* User Profile / Logout */}
              <div className="flex items-center border-l pl-2 sm:pl-4 ml-2 sm:ml-4 border-gray-200">
                <div className="text-right hidden sm:block mr-3">
                  <p className="text-sm font-medium text-gray-900 leading-none">{currentUser?.username}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currentUser?.role}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        
        {/* Header & Filter Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Active Funding Calls</h2>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full sm:w-auto flex justify-center items-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
              showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" /> 
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters Section - Collapsible */}
        {showFilters && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 animate-fade-in-down">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Searchable Agency Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Agency (Search)</label>
                <div className="relative">
                  <input
                    list="agencies-list"
                    className="block w-full pl-3 pr-3 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-white shadow-sm"
                    placeholder="Select or type agency..."
                    value={filterAgency}
                    onChange={e => setFilterAgency(e.target.value)}
                  />
                  <datalist id="agencies-list">
                    {PREDEFINED_AGENCIES.filter(a => a !== 'Other').map(a => <option key={a} value={a} />)}
                  </datalist>
                </div>
              </div>

              {/* Searchable Department Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Department (Search)</label>
                <div className="relative">
                  <input
                    list="departments-list"
                    className="block w-full pl-3 pr-3 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-white shadow-sm"
                    placeholder="Select or type department..."
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                  />
                  <datalist id="departments-list">
                    {PREDEFINED_DEPARTMENTS.filter(d => d !== 'Other').map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Month</label>
                  <input 
                    type="month" 
                    className="block w-full pl-3 pr-3 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-white shadow-sm"
                    value={filterMonth} 
                    onChange={e => setFilterMonth(e.target.value)} 
                  />
              </div>
            </div>
            {/* Clear Filters Button */}
            {(filterAgency || filterDept || filterMonth) && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => { setFilterAgency(''); setFilterDept(''); setFilterMonth(''); }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCalls.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
              <div className="p-3 bg-gray-100 rounded-full mb-3">
                <Filter className="text-gray-400" size={24} />
              </div>
              <h3 className="text-gray-900 font-medium text-lg">No matches found</h3>
              <p className="text-gray-500 mt-1 text-center px-4">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            filteredCalls.map(call => (
              <div key={call.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {call.agency}
                    </span>
                    {isToday(call.deadline) && (
                      <span className="flex items-center text-red-600 text-xs font-bold animate-pulse bg-red-50 px-2 py-1 rounded-md border border-red-100">
                        <span className="h-1.5 w-1.5 bg-red-600 rounded-full mr-1.5"></span> Expiring Today
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{call.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{call.description}</p>
                  
                  <div className="space-y-2.5 text-sm text-gray-500">
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                        <Calendar size={16} className="mr-2.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500 text-xs uppercase font-semibold mr-2">Deadline</span>
                        <span className={`font-medium ${isToday(call.deadline) ? 'text-red-600' : 'text-gray-900'}`}>{call.deadline}</span>
                    </div>
                    <div className="flex items-start p-2 bg-gray-50 rounded-lg">
                        <Briefcase size={16} className="mr-2.5 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                            {call.departments.slice(0, 3).map(d => (
                                <span key={d} className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-xs font-medium text-gray-600">{d}</span>
                            ))}
                            {call.departments.length > 3 && <span className="text-xs text-gray-400 self-center">+{call.departments.length - 3} more</span>}
                        </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">#{call.id}</span>
                    {call.attachmentUrl ? (
                         <a href={call.attachmentUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors shadow-sm">
                            Details <ExternalLink size={14} className="ml-1.5" />
                         </a>
                    ) : (
                        <span className="text-gray-400 text-xs italic">No details</span>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};

export default UserDashboard;