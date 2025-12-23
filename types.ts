export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  alias: string;
  password?: string;
  role: UserRole;
  joinedAt: Date;
  reputation: number;
  followers: string[];
  following: string[];
  totalLikesReceived: number;
  bio?: string;
  totalTransmissions: number;
  isWeeklyTop?: boolean;
}

export interface Message {
  id: string;
  senderAlias: string;
  senderRole: UserRole;
  content: string;
  timestamp: Date;
  tags: string[];
  replyToId?: string;
  ip?: string;
  isFlagged: boolean;
}

export interface Comment {
  id: string;
  authorAlias: string;
  content: string;
  timestamp: Date;
  likes: string[];
  replies?: Comment[];
}

export interface SocialPost {
  id: string;
  authorAlias: string;
  content: string;
  timestamp: Date;
  likes: string[];
  comments: Comment[];
  background?: string;
}

export interface AppSettings {
  adminPin: string;
  announcement: string;
  donationTarget: number;
  donationCurrent: number;
  accountName: string;
  accountNumber: string;
}
