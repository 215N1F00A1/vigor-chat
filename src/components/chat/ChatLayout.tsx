import { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { UserList } from './UserList';
import { ChatWindow } from './ChatWindow';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, LogOut, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatLayout = () => {
  const [showUserList, setShowUserList] = useState(true);
  const { currentUser, activeConversation, logout } = useChatStore();

  const handleUserSelect = () => {
    if (window.innerWidth < 1024) {
      setShowUserList(false);
    }
  };

  const handleBackToList = () => {
    setShowUserList(true);
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-16 bg-card/50 border-r border-border/50 flex flex-col items-center py-4 space-y-4">
        {/* Logo */}
        <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col space-y-2">
          <Button variant="ghost" size="sm" className="w-12 h-12 p-0">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-12 h-12 p-0">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* User Avatar & Logout */}
        <div className="space-y-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-secondary text-white font-medium">
              {currentUser?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-12 h-12 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* User List */}
        <div className={cn(
          "w-80 border-r border-border/50 glass transition-all duration-300",
          showUserList ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:relative absolute inset-y-0 left-16 z-10 lg:z-auto"
        )}>
          <div onClick={handleUserSelect}>
            <UserList />
          </div>
        </div>

        {/* Chat Window */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          !showUserList && activeConversation ? "lg:ml-0" : "lg:ml-0"
        )}>
          {activeConversation ? (
            <ChatWindow onBack={handleBackToList} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
              <div className="text-center space-y-4 max-w-md mx-auto p-8">
                <div className="relative">
                  <div className="p-8 rounded-full bg-gradient-primary/10 mx-auto w-32 h-32 flex items-center justify-center">
                    <MessageCircle className="h-16 w-16 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">💬</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Welcome to Vigor Chat
                  </h2>
                  <p className="text-muted-foreground">
                    Select a conversation from the sidebar to start chatting
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-success rounded-full status-online"></div>
                    <span>Real-time messaging</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Read receipts</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {!showUserList && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-5"
          onClick={handleBackToList}
        />
      )}
    </div>
  );
};