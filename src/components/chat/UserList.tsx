import { useChatStore } from '@/stores/chatStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

export const UserList = () => {
  const { conversations, messages, setActiveConversation, currentUser } = useChatStore();

  const getConversationKey = (userId: string) => {
    if (!currentUser) return '';
    const ids = [currentUser.id, userId].sort();
    return `${ids[0]}_${ids[1]}`;
  };

  const getLastMessage = (userId: string) => {
    const conversationKey = getConversationKey(userId);
    const conversationMessages = messages[conversationKey] || [];
    return conversationMessages[conversationMessages.length - 1];
  };

  const getMessageStatusIcon = (status: string, fromCurrentUser: boolean) => {
    if (!fromCurrentUser) return null;
    
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xl font-semibold">Conversations</h2>
        <p className="text-sm text-muted-foreground">
          {conversations.length} contacts
        </p>
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => {
            const lastMessage = getLastMessage(conversation.userId);
            const isFromCurrentUser = lastMessage?.from === currentUser?.id;

            return (
              <div
                key={conversation.userId}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-smooth animate-slide-in"
                onClick={() => setActiveConversation(conversation.userId)}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-medium">
                      {conversation.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Online status */}
                  {conversation.user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success rounded-full border-2 border-card status-online" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate">
                      {conversation.user.name}
                    </h3>
                    
                    {lastMessage && (
                      <div className="flex items-center space-x-1">
                        {getMessageStatusIcon(lastMessage.status, isFromCurrentUser)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(lastMessage.sentAt, { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage ? (
                        <>
                          {isFromCurrentUser && 'You: '}
                          {lastMessage.body}
                        </>
                      ) : (
                        conversation.user.isOnline ? 'Online' : `Last seen ${formatDistanceToNow(conversation.user.lastSeen || new Date())}`
                      )}
                    </p>

                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="bg-primary text-primary-foreground h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};