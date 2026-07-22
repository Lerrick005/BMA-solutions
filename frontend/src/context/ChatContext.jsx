import React, { createContext, useState, useContext, useEffect } from 'react';
import { usersData } from '../data/usersData';
import toast from 'react-hot-toast';

// Create Chat Context
const ChatContext = createContext();

// Chat Provider
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      userId: 2,
      userName: 'Jane Smith',
      userAvatar: 'JS',
      message: 'Hey team, can we review the proposal?',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'team',
      mentions: [],
      readBy: [1, 2, 3, 4, 5],
      reactions: {},
    },
    {
      id: 2,
      userId: 1,
      userName: 'Brian Arika',
      userAvatar: 'BA',
      message: 'Sure, sending it over now.',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      type: 'team',
      mentions: [],
      readBy: [1, 2, 3, 4, 5],
      reactions: {},
    },
    {
      id: 3,
      userId: 3,
      userName: 'Mike Thompson',
      userAvatar: 'MT',
      message: 'Great work on the new leads everyone! 🎉',
      timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      type: 'team',
      mentions: [],
      readBy: [1, 2, 3, 4, 5],
      reactions: { '❤️': [1, 2, 3] },
    },
    {
      id: 4,
      userId: 2,
      userName: 'Jane Smith',
      userAvatar: 'JS',
      message: '@Brian Arika can you check the latest report?',
      timestamp: new Date(Date.now() - 600000 * 0.5).toISOString(),
      type: 'mention',
      mentions: ['Brian Arika'],
      readBy: [1, 2, 3, 4, 5],
      reactions: {},
    },
  ]);

  const [users] = useState(usersData);
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Brian Arika',
    email: 'brianarika4@gmail.com',
    avatar: 'BA',
    role: 'admin',
  });

  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get user by ID
  const getUserById = (id) => {
    return users.find(u => u.id === id) || users[0];
  };

  // Get user by name
  const getUserByName = (name) => {
    return users.find(u => u.name === name) || null;
  };

  // Send message
  const sendMessage = (message, type = 'team', mentions = []) => {
    const newMessage = {
      id: messages.length + 1,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: message,
      timestamp: new Date().toISOString(),
      type: type,
      mentions: mentions,
      readBy: [currentUser.id],
      reactions: {},
    };

    setMessages([...messages, newMessage]);

    // If mentions exist, notify mentioned users
    if (mentions.length > 0) {
      mentions.forEach(mention => {
        const user = getUserByName(mention);
        if (user && user.id !== currentUser.id) {
          toast.success(`🔔 You were mentioned by ${currentUser.name}`, {
            duration: 5000,
            icon: '💬',
          });
        }
      });
    }

    return newMessage;
  };

  // Send direct message
  const sendDirectMessage = (toUserId, message) => {
    const toUser = getUserById(toUserId);
    const newMessage = {
      id: messages.length + 1,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: message,
      timestamp: new Date().toISOString(),
      type: 'direct',
      toUserId: toUserId,
      toUserName: toUser?.name || 'Unknown',
      mentions: [],
      readBy: [currentUser.id],
      reactions: {},
    };

    setMessages([...messages, newMessage]);
    toast.success(`💬 Message sent to ${toUser?.name || 'user'}!`);
    return newMessage;
  };

  // ADD REACTION - FIXED
  const addReaction = (messageId, reaction, userId) => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (msg.id === messageId) {
          // Get current reactions or create empty object
          const currentReactions = msg.reactions || {};
          
          // Get users who reacted with this reaction or create empty array
          const currentUsers = currentReactions[reaction] || [];
          
          // Check if user already reacted
          const userIndex = currentUsers.indexOf(userId);
          
          let updatedReactions;
          if (userIndex === -1) {
            // Add user to reaction
            updatedReactions = {
              ...currentReactions,
              [reaction]: [...currentUsers, userId]
            };
          } else {
            // Remove user from reaction (toggle off)
            const newUsers = currentUsers.filter(id => id !== userId);
            updatedReactions = { ...currentReactions };
            if (newUsers.length > 0) {
              updatedReactions[reaction] = newUsers;
            } else {
              delete updatedReactions[reaction];
            }
          }
          
          return {
            ...msg,
            reactions: updatedReactions
          };
        }
        return msg;
      });
    });
    
    // Show toast feedback
    toast.success(`✅ Reaction added!`);
  };

  // Get messages for user
  const getMessagesForUser = (userId) => {
    return messages.filter(msg => {
      if (msg.type === 'team') return true;
      if (msg.type === 'direct') {
        return msg.userId === userId || msg.toUserId === userId ||
          msg.userId === currentUser.id || msg.toUserId === currentUser.id;
      }
      if (msg.type === 'mention') {
        return msg.mentions.includes(currentUser.name) || msg.userId === userId;
      }
      return true;
    });
  };

  // Mark message as read
  const markAsRead = (messageId, userId) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId && !msg.readBy.includes(userId)
          ? { ...msg, readBy: [...msg.readBy, userId] }
          : msg
      )
    );
  };

  // Get unread count for current user
  const getUnreadCount = () => {
    const unread = messages.filter(msg =>
      !msg.readBy.includes(currentUser.id) &&
      (msg.type === 'team' ||
        msg.type === 'mention' ||
        (msg.type === 'direct' && msg.toUserId === currentUser.id))
    );
    return unread.length;
  };

  // Update unread count
  useEffect(() => {
    setUnreadCount(getUnreadCount());
  }, [messages, currentUser.id]);

  // Typing functions
  const startTyping = (userId) => {
    if (!typingUsers.includes(userId)) {
      setTypingUsers([...typingUsers, userId]);
    }
  };

  const stopTyping = (userId) => {
    setTypingUsers(typingUsers.filter(id => id !== userId));
  };

  // Get online users (simulated)
  const getOnlineUsers = () => {
    return users.filter(u => u.status === 'active');
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        currentUser,
        unreadCount,
        typingUsers,
        sendMessage,
        sendDirectMessage,
        getMessagesForUser,
        markAsRead,
        getUnreadCount,
        startTyping,
        stopTyping,
        getOnlineUsers,
        getUserById,
        getUserByName,
        setCurrentUser,
        addReaction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;