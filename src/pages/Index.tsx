import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { ChatLayout } from '@/components/chat/ChatLayout';

const Index = () => {
  const { isAuthenticated, initializeMockData } = useChatStore();

  useEffect(() => {
    if (isAuthenticated) {
      initializeMockData();
    }
  }, [isAuthenticated, initializeMockData]);

  return (
    <div className="h-screen overflow-hidden">
      {isAuthenticated ? <ChatLayout /> : <AuthContainer />}
    </div>
  );
};

export default Index;
