import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FundingCall, Announcement, UserRole, Notification } from '../types';
import { ADMIN_DOMAIN } from '../constants';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, onValue, set, push, remove, update, get } from 'firebase/database';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  fundingCalls: FundingCall[];
  announcements: Announcement[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (user: Omit<User, 'id'>) => Promise<{ success: boolean; message?: string }>;
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
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [fundingCalls, setFundingCalls] = useState<FundingCall[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize PWA Logic
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
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

  // Sync Data from Firebase
  useEffect(() => {
    // Sync Users
    const usersRef = ref(db, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(Object.values(data));
      } else {
        setUsers([]);
      }
    });

    // Sync Funding Calls
    const callsRef = ref(db, 'fundingCalls');
    const unsubCalls = onValue(callsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const callsArray = Object.values(data) as FundingCall[];
        // Sort by createdAt desc
        setFundingCalls(callsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setFundingCalls([]);
      }
    });

    // Sync Announcements
    const announceRef = ref(db, 'announcements');
    const unsubAnnounce = onValue(announceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data) as Announcement[];
        setAnnouncements(arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setAnnouncements([]);
      }
    });

    // Sync Notifications
    const notifRef = ref(db, 'notifications');
    const unsubNotif = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data) as Notification[];
        setNotifications(arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else {
        setNotifications([]);
      }
    });

    return () => {
      unsubUsers();
      unsubCalls();
      unsubAnnounce();
      unsubNotif();
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended user profile from DB
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setCurrentUser(snapshot.val());
        } else {
          // Fallback if record missing (should rarely happen if signup works right)
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: UserRole.STUDENT,
            username: firebaseUser.displayName || 'User'
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Update expired calls Logic (Runs locally per client, but updates DB)
  useEffect(() => {
    if (!fundingCalls.length) return;
    const today = new Date().toISOString().split('T')[0];

    fundingCalls.forEach(call => {
      if (call.status === 'Active' && call.deadline < today) {
        updateFundingCall({ ...call, status: 'Expired' });
      }
    });
  }, [fundingCalls]);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (createError: any) {
      return { success: false, message: createError.message };
    }
  };

  const signup = async (userData: Omit<User, 'id'>) => {
    try {
      // Domain Validation
      if (userData.role === UserRole.ADMIN && !userData.email.endsWith(ADMIN_DOMAIN)) {
        return { success: false, message: `Admin email must end with ${ADMIN_DOMAIN}` };
      }
      if (userData.role !== UserRole.ADMIN && userData.email.endsWith(ADMIN_DOMAIN)) {
        return { success: false, message: `Non-admin users cannot use ${ADMIN_DOMAIN}` };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password || 'password123');
      const uid = userCredential.user.uid;

      const newUser: User = {
        ...userData,
        id: uid,
        // Don't save password in DB
        password: ''
      };

      // Save detailed profile to RTDB
      await set(ref(db, `users/${uid}`), newUser);

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    signOut(auth);
  };

  const updateUserProfile = async (updatedUser: User) => {
    if (updatedUser.id) {
      await update(ref(db, `users/${updatedUser.id}`), updatedUser);
      // Local state update handled by onValue listener
    }
  };

  const addFundingCall = async (callData: Omit<FundingCall, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const callsRef = ref(db, 'fundingCalls');
    const newCallRef = push(callsRef);
    const id = newCallRef.key as string;

    const newCall: FundingCall = {
      ...callData,
      id,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await set(newCallRef, newCall);

    // Create Notification
    const notifRef = push(ref(db, 'notifications'));
    await set(notifRef, {
      id: notifRef.key,
      type: 'NEW_CALL',
      message: `New Funding Call: ${newCall.title}`,
      timestamp: new Date().toISOString(),
      relatedId: newCall.id
    });
  };

  const updateFundingCall = async (updatedCall: FundingCall) => {
    await update(ref(db, `fundingCalls/${updatedCall.id}`), {
      ...updatedCall,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteFundingCall = async (id: string) => {
    await remove(ref(db, `fundingCalls/${id}`));
  };

  const addAnnouncement = async (message: string) => {
    const annRef = push(ref(db, 'announcements'));
    const id = annRef.key as string;

    const newAnnouncement: Announcement = {
      id,
      message,
      createdAt: new Date().toISOString(),
      isReadBy: []
    };
    await set(annRef, newAnnouncement);

    // Notification
    const notifRef = push(ref(db, 'notifications'));
    await set(notifRef, {
      id: notifRef.key,
      type: 'ANNOUNCEMENT',
      message: `Admin: ${message}`,
      timestamp: new Date().toISOString(),
      relatedId: id
    });
  };

  const updateAnnouncement = async (id: string, message: string) => {
    await update(ref(db, `announcements/${id}`), { message });
    // Update notif logic if needed, but keeping simple
  };

  const deleteAnnouncement = async (id: string) => {
    await remove(ref(db, `announcements/${id}`));
  };

  const removeNotification = async (id: string) => {
    await remove(ref(db, `notifications/${id}`));
  };

  const repostCall = async (id: string, newDeadline: string) => {
    await update(ref(db, `fundingCalls/${id}`), {
      status: 'Active',
      deadline: newDeadline,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, fundingCalls, announcements, notifications,
      login, signup, logout, updateUserProfile,
      addFundingCall, updateFundingCall, deleteFundingCall,
      addAnnouncement, updateAnnouncement, deleteAnnouncement, removeNotification,
      repostCall,
      isInstallable: !!deferredPrompt, installApp, loading
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