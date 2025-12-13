import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FundingCall, Announcement, UserRole, Notification } from '../types';
import { ADMIN_DOMAIN } from '../constants';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  fundingCalls: FundingCall[];
  announcements: Announcement[];
  notifications: Notification[];
  login: (email: string, password: string) => { success: boolean; message?: string };
  signup: (user: Omit<User, 'id'>) => { success: boolean; message?: string };
  logout: () => void;
  updateUserProfile: (user: User) => void;
  addFundingCall: (call: Omit<FundingCall, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateFundingCall: (call: FundingCall) => void;
  deleteFundingCall: (id: string) => void;
  addAnnouncement: (message: string) => void;
  updateAnnouncement: (id: string, message: string) => void;
  deleteAnnouncement: (id: string) => void;
  removeNotification: (id: string) => void;
  repostCall: (id: string, newDeadline: string) => void;
  
  // PWA Install Logic
  isInstallable: boolean;
  installApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Initial Data
const INITIAL_USERS: User[] = [
  { id: '1', username: 'Admin User', email: 'admin@fdc.ac.in', password: 'password123', role: UserRole.ADMIN, designation: 'Director', mobile: '9876543210', location: 'Block A, Office 1' },
  { id: '2', username: 'John Student', email: 'john@vit.ac.in', password: 'password123', role: UserRole.STUDENT },
  { id: '3', username: 'Dr. Smith', email: 'smith@gmail.com', password: 'password123', role: UserRole.RESEARCHER }
];

const INITIAL_CALLS: FundingCall[] = [
  {
    id: 'fc_1',
    title: 'AI Research Grant 2024',
    agency: 'DST',
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], // 5 days from now
    departments: ['Computer Science', 'Information Technology'],
    description: 'Grant for advanced AI research in healthcare.',
    attachmentUrl: 'https://example.com/doc',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fc_2',
    title: 'Sustainable Energy Fund',
    agency: 'SERB',
    deadline: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0], // 2 days ago
    departments: ['Electrical Eng', 'Mechanical Eng'],
    description: 'Funding for renewable energy projects.',
    status: 'Expired',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load users from localStorage or use initial data
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('funding_app_users');
      return savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
    } catch (error) {
      console.error('Error loading users from local storage', error);
      return INITIAL_USERS;
    }
  });

  // Load current user session from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedSession = localStorage.getItem('funding_app_session');
      return savedSession ? JSON.parse(savedSession) : null;
    } catch (error) {
      return null;
    }
  });

  const [fundingCalls, setFundingCalls] = useState<FundingCall[]>(INITIAL_CALLS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Persist Users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('funding_app_users', JSON.stringify(users));
  }, [users]);

  // Persist Session to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('funding_app_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('funding_app_session');
    }
  }, [currentUser]);

  // Auto-Archiving Logic & Notification Generation on Mount/Update
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    setFundingCalls(prevCalls => prevCalls.map(call => {
      if (call.status === 'Active' && call.deadline < today) {
        return { ...call, status: 'Expired' };
      }
      return call;
    }));

    // Generate notifications for active calls
    const newNotifications: Notification[] = [];
    fundingCalls.forEach(call => {
      if (call.status === 'Active') {
        const diffTime = Math.abs(new Date(call.deadline).getTime() - new Date().getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays <= 3 && new Date(call.deadline) >= new Date()) {
           // Don't add if already exists to avoid spam in this PoC
        }
      }
    });

  }, [currentUser]); // Run when user changes or periodic

  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const signup = (userData: Omit<User, 'id'>) => {
    if (users.some(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered. Please login.' };
    }
    
    // Domain Validation
    if (userData.role === UserRole.ADMIN && !userData.email.endsWith(ADMIN_DOMAIN)) {
      return { success: false, message: `Admin email must end with ${ADMIN_DOMAIN}` };
    }
    if (userData.role !== UserRole.ADMIN && userData.email.endsWith(ADMIN_DOMAIN)) {
      return { success: false, message: `Non-admin users cannot use ${ADMIN_DOMAIN}` };
    }

    const newUser = { ...userData, id: Math.random().toString(36).substr(2, 9) };
    
    // Add new user to list (persisted via useEffect)
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    // Automatically log the user in
    setCurrentUser(newUser);
    
    return { success: true };
  };

  const logout = () => setCurrentUser(null);

  const updateUserProfile = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const addFundingCall = (callData: Omit<FundingCall, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newCall: FundingCall = {
      ...callData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFundingCalls([newCall, ...fundingCalls]);
    
    // Notify all
    setNotifications(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'NEW_CALL',
      message: `New Funding Call: ${newCall.title}`,
      timestamp: new Date().toISOString(),
      relatedId: newCall.id
    }, ...prev]);
  };

  const updateFundingCall = (updatedCall: FundingCall) => {
    setFundingCalls(prev => prev.map(c => c.id === updatedCall.id ? { ...updatedCall, updatedAt: new Date().toISOString() } : c));
  };

  const deleteFundingCall = (id: string) => {
    setFundingCalls(prev => prev.filter(c => c.id !== id));
  };

  const addAnnouncement = (message: string) => {
    const newAnnouncement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      createdAt: new Date().toISOString(),
      isReadBy: []
    };
    setAnnouncements([newAnnouncement, ...announcements]);

    setNotifications(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'ANNOUNCEMENT',
      message: `Admin: ${message}`,
      timestamp: new Date().toISOString(),
      relatedId: newAnnouncement.id
    }, ...prev]);
  };

  const updateAnnouncement = (id: string, message: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, message } : a));
    // Also update related notification if exists
    setNotifications(prev => prev.map(n => n.relatedId === id ? { ...n, message: `Admin: ${message}` } : n));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    // Also remove related notification
    setNotifications(prev => prev.filter(n => n.relatedId !== id));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const repostCall = (id: string, newDeadline: string) => {
    setFundingCalls(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Active',
          deadline: newDeadline,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, fundingCalls, announcements, notifications,
      login, signup, logout, updateUserProfile,
      addFundingCall, updateFundingCall, deleteFundingCall,
      addAnnouncement, updateAnnouncement, deleteAnnouncement, removeNotification,
      repostCall,
      isInstallable: !!deferredPrompt, installApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};