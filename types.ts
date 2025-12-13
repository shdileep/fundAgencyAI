export enum UserRole {
  ADMIN = 'Admin',
  STUDENT = 'Student',
  RESEARCHER = 'Researcher',
  OTHER = 'Other'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
  designation?: string;
  mobile?: string;
  location?: string;
}

export type FundingStatus = 'Active' | 'Expired' | 'Archived';

export interface FundingCall {
  id: string;
  title: string;
  agency: string;
  deadline: string; // YYYY-MM-DD
  departments: string[];
  description: string;
  attachmentUrl?: string;
  status: FundingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  message: string;
  createdAt: string;
  isReadBy: string[]; // User IDs
}

export interface Notification {
  id: string;
  type: 'NEW_CALL' | 'ANNOUNCEMENT' | 'EXPIRING_SOON';
  message: string;
  timestamp: string;
  relatedId?: string;
}