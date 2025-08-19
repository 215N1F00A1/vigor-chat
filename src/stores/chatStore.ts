import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Message, Conversation, AuthUser, TypingUser } from '@/types/chat';

interface ChatState {
  // Auth
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  
  // Users & Conversations
  users: User[];
  conversations: Conversation[];
  activeConversation: string | null;
  
  // Messages
  messages: Record<string, Message[]>;
  
  // Real-time states
  typingUsers: TypingUser[];
  onlineUsers: Set<string>;
  
  // Actions
  login: (user: AuthUser) => void;
  logout: () => void;
  setUsers: (users: User[]) => void;
  setActiveConversation: (userId: string | null) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  initializeMockData: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      users: [],
      conversations: [],
      activeConversation: null,
      messages: {},
      typingUsers: [],
      onlineUsers: new Set(),

      // Actions
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      
      logout: () => set({ 
        currentUser: null, 
        isAuthenticated: false,
        activeConversation: null,
        messages: {},
        typingUsers: [],
        onlineUsers: new Set()
      }),

      setUsers: (users) => {
        const state = get();
        const conversations: Conversation[] = users
          .filter(user => user.id !== state.currentUser?.id)
          .map(user => ({
            userId: user.id,
            user,
            unreadCount: 0
          }));
        
        set({ users, conversations });
      },

      setActiveConversation: (userId) => set({ activeConversation: userId }),

      addMessage: (message) => set((state) => {
        const conversationKey = message.conversationKey;
        const existingMessages = state.messages[conversationKey] || [];
        
        return {
          messages: {
            ...state.messages,
            [conversationKey]: [...existingMessages, message]
          }
        };
      }),

      updateMessageStatus: (messageId, status) => set((state) => {
        const updatedMessages = { ...state.messages };
        
        Object.keys(updatedMessages).forEach(conversationKey => {
          updatedMessages[conversationKey] = updatedMessages[conversationKey].map(msg => {
            if (msg.id === messageId) {
              const now = new Date();
              return {
                ...msg,
                status,
                ...(status === 'delivered' && { deliveredAt: now }),
                ...(status === 'read' && { readAt: now })
              };
            }
            return msg;
          });
        });

        return { messages: updatedMessages };
      }),

      setTyping: (userId, isTyping) => set((state) => {
        const typingUsers = state.typingUsers.filter(t => t.userId !== userId);
        if (isTyping) {
          typingUsers.push({ userId, isTyping });
        }
        return { typingUsers };
      }),

      setUserOnline: (userId, isOnline) => set((state) => {
        const onlineUsers = new Set(state.onlineUsers);
        if (isOnline) {
          onlineUsers.add(userId);
        } else {
          onlineUsers.delete(userId);
        }
        
        const users = state.users.map(user => 
          user.id === userId ? { ...user, isOnline, lastSeen: isOnline ? undefined : new Date() } : user
        );

        return { onlineUsers, users };
      }),

      initializeMockData: () => {
        const mockUsers: User[] = [
          {
            id: '2',
            name: 'Alice Johnson',
            email: 'alice@test.com',
            isOnline: true,
          },
          {
            id: '3',
            name: 'Bob Smith',
            email: 'bob@test.com',
            isOnline: false,
            lastSeen: new Date(Date.now() - 5 * 60 * 1000)
          },
          {
            id: '4',
            name: 'Carol Davis',
            email: 'carol@test.com',
            isOnline: true,
          }
        ];

        get().setUsers(mockUsers);

        // Add some mock messages
        const mockMessages: Message[] = [
          {
            id: '1',
            conversationKey: '1_2',
            from: '2',
            to: '1',
            body: 'Hey! How are you doing?',
            status: 'read',
            sentAt: new Date(Date.now() - 10 * 60 * 1000),
            readAt: new Date(Date.now() - 9 * 60 * 1000)
          },
          {
            id: '2',
            conversationKey: '1_2',
            from: '1',
            to: '2',
            body: 'I\'m doing great! Thanks for asking 😊',
            status: 'delivered',
            sentAt: new Date(Date.now() - 8 * 60 * 1000),
            deliveredAt: new Date(Date.now() - 7 * 60 * 1000)
          },
          {
            id: '3',
            conversationKey: '1_3',
            from: '3',
            to: '1',
            body: 'Working on that new project we discussed',
            status: 'sent',
            sentAt: new Date(Date.now() - 2 * 60 * 1000)
          }
        ];

        mockMessages.forEach(message => get().addMessage(message));
        
        // Set online users
        get().setUserOnline('2', true);
        get().setUserOnline('4', true);
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);