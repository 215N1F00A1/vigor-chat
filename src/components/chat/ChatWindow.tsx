import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/types/chat';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, Send, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  onBack: () => void;
}

export const ChatWindow = ({ onBack }: ChatWindowProps) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { 
    activeConversation, 
    conversations, 
    messages, 
    currentUser, 
    addMessage, 
    updateMessageStatus,
    setTyping,
    typingUsers 
  } = useChatStore();

  const currentConversation = conversations.find(c => c.userId === activeConversation);
  
  const getConversationKey = () => {
    if (!currentUser || !activeConversation) return '';
    const ids = [currentUser.id, activeConversation].sort();
    return `${ids[0]}_${ids[1]}`;
  };

  const conversationMessages = messages[getConversationKey()] || [];
  const isOtherUserTyping = typingUsers.some(t => t.userId === activeConversation && t.isTyping);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, isOtherUserTyping]);

  // Simulate message delivery and read receipts
  useEffect(() => {
    conversationMessages.forEach(msg => {
      if (msg.from === currentUser?.id && msg.status === 'sent') {
        setTimeout(() => {
          updateMessageStatus(msg.id, 'delivered');
        }, 1000);
      }
      if (msg.from === currentUser?.id && msg.status === 'delivered') {
        setTimeout(() => {
          updateMessageStatus(msg.id, 'read');
        }, 3000);
      }
    });
  }, [conversationMessages, currentUser?.id, updateMessageStatus]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUser || !activeConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationKey: getConversationKey(),
      from: currentUser.id,
      to: activeConversation,
      body: messageText.trim(),
      status: 'sent',
      sentAt: new Date()
    };

    addMessage(newMessage);
    setMessageText('');
    
    // Stop typing indicator
    if (isTyping) {
      setTyping(currentUser.id, false);
      setIsTyping(false);
    }

    // Simulate incoming response
    setTimeout(() => {
      const responses = [
        "That's interesting! Tell me more.",
        "I completely agree with you on that.",
        "Sounds good to me! 👍",
        "Let me think about it and get back to you.",
        "Perfect! When do we start?",
        "I'm excited about this opportunity.",
        "Thanks for sharing that with me."
      ];
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversationKey: getConversationKey(),
        from: activeConversation,
        to: currentUser.id,
        body: responses[Math.floor(Math.random() * responses.length)],
        status: 'sent',
        sentAt: new Date()
      };
      
      addMessage(responseMessage);
    }, 2000 + Math.random() * 3000);
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (!currentUser) return;

    if (text.length > 0 && !isTyping) {
      setTyping(currentUser.id, true);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(currentUser.id, false);
      setIsTyping(false);
    }, 1000);
  };

  const getMessageStatusIcon = (message: Message) => {
    if (message.from !== currentUser?.id) return null;
    
    switch (message.status) {
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

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">
            Select a conversation to start chatting
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 glass">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-secondary text-white font-medium">
                {currentConversation.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            {currentConversation.user.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-success rounded-full border-2 border-card status-online" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium">{currentConversation.user.name}</h3>
            <p className="text-xs text-muted-foreground">
              {isOtherUserTyping ? (
                <span className="text-primary">typing...</span>
              ) : currentConversation.user.isOnline ? (
                'Online'
              ) : (
                `Last seen ${formatDistanceToNow(currentConversation.user.lastSeen || new Date(), { addSuffix: true })}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversationMessages.map((message, index) => {
            const isFromCurrentUser = message.from === currentUser?.id;
            const showAvatar = index === 0 || conversationMessages[index - 1].from !== message.from;
            const showTimestamp = index === conversationMessages.length - 1 || 
              new Date(conversationMessages[index + 1].sentAt).getTime() - new Date(message.sentAt).getTime() > 300000;

            return (
              <div key={message.id} className="animate-slide-in">
                <div className={cn(
                  "flex items-end space-x-2",
                  isFromCurrentUser ? "justify-end" : "justify-start"
                )}>
                  {!isFromCurrentUser && showAvatar && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gradient-secondary text-white text-xs">
                        {currentConversation.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!isFromCurrentUser && !showAvatar && (
                    <div className="w-6" />
                  )}

                  <div className={cn(
                    "max-w-[70%] px-4 py-2 rounded-2xl",
                    isFromCurrentUser 
                      ? "message-sent text-white rounded-br-sm" 
                      : "message-received rounded-bl-sm"
                  )}>
                    <p className="text-sm break-words">{message.body}</p>
                    
                    <div className={cn(
                      "flex items-center justify-end space-x-1 mt-1",
                      isFromCurrentUser ? "text-white/70" : "text-muted-foreground"
                    )}>
                      <span className="text-xs">
                        {format(message.sentAt, 'HH:mm')}
                      </span>
                      {getMessageStatusIcon(message)}
                    </div>
                  </div>
                </div>

                {showTimestamp && (
                  <div className="text-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(message.sentAt, 'MMM d, HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isOtherUserTyping && (
            <div className="flex items-end space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-secondary text-white text-xs">
                  {currentConversation.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="message-received px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-input/50 border-border/50 focus:border-primary transition-smooth"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};