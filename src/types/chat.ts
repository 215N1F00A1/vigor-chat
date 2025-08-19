export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  conversationKey: string;
  from: string;
  to: string;
  body: string;
  status: 'sent' | 'delivered' | 'read';
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

export interface Conversation {
  userId: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

export interface AuthUser extends User {
  token: string;
}

export interface TypingUser {
  userId: string;
  isTyping: boolean;
}