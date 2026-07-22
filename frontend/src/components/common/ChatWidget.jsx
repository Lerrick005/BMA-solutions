import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, Send, X, Users, User, Search,
  Smile
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { playNotificationSound } from '../../utils/sound';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    users,
    currentUser,
    unreadCount,
    sendMessage,
    sendDirectMessage,
    getMessagesForUser,
    markAsRead,
    getOnlineUsers,
    getUserById,
    typingUsers,
    startTyping,
    stopTyping,
    addReaction,
  } = useChat();

  const userMessages = getMessagesForUser(currentUser.id);
  const onlineUsers = getOnlineUsers();

  // Play sound on new message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.userId !== currentUser.id && isOpen) {
        playNotificationSound();
      }
    }
  }, [messages, isOpen, currentUser.id]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userMessages]);

  // Mark messages as read
  useEffect(() => {
    if (isOpen) {
      userMessages.forEach(msg => {
        if (!msg.readBy.includes(currentUser.id)) {
          markAsRead(msg.id, currentUser.id);
        }
      });
    }
  }, [isOpen, userMessages, currentUser.id, markAsRead]);

  // Handle typing
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping(currentUser.id);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setIsTyping(false);
      stopTyping(currentUser.id);
    }, 2000);

    setTypingTimeout(timeout);
  };

  // EMOJIS - Multiple selection (stays open)
  const emojis = [
    '😊', '😂', '❤️', '👍', '🎉', '🔥', 
    '👋', '💪', '✨', '🌟', '🎯', '🏆', 
    '💯', '🤝', '🙌', '👏', '💀', '😍',
    '🤔', '😎', '🥳', '😅', '🤗', '😤',
    '😇', '🤩', '😱', '🥺', '😏', '🤣'
  ];

  // Add emoji without closing the picker
  const addEmoji = (emoji) => {
    setInput(input + emoji);
    // Don't close the picker - stays open for multiple selections
  };

  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Close emoji picker (used by Close button)
  const closeEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  // Message reactions
  const reactions = ['❤️', '👍', '😂', '🎉', '🔥', '👏'];

  const handleAddReaction = (messageId, reaction) => {
    addReaction(messageId, reaction, currentUser.id);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    handleTyping();

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1 && (lastAtSymbol === 0 || value[lastAtSymbol - 1] === ' ')) {
      const search = textBeforeCursor.substring(lastAtSymbol + 1);
      setMentionSearch(search);
      setShowMentions(true);
      setCursorPosition(cursorPos);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionClick = (user) => {
    const textBeforeCursor = input.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = input.substring(cursorPosition);

    const newText = textBeforeCursor.substring(0, lastAtSymbol) +
      `@${user.name} ` +
      textAfterCursor;

    setInput(newText);
    setShowMentions(false);
    inputRef.current.focus();
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const mentionRegex = /@(\w+\s?\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(input)) !== null) {
      mentions.push(match[1]);
    }

    if (selectedUser) {
      sendDirectMessage(selectedUser.id, input);
      setSelectedUser(null);
    } else {
      sendMessage(input, mentions.length > 0 ? 'mention' : 'team', mentions);
    }

    setInput('');
    setShowMentions(false);
    setIsTyping(false);
    stopTyping(currentUser.id);
    inputRef.current.focus();
  };

  const filteredMentionUsers = users.filter(user =>
    user.id !== currentUser.id &&
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.id !== currentUser.id &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getMessageStyle = (msg) => {
    if (msg.userId === currentUser.id) {
      return 'bg-primary text-white rounded-br-none';
    }
    if (msg.type === 'direct' && msg.toUserId === currentUser.id) {
      return 'bg-purple-100 text-gray-800 rounded-bl-none border border-purple-200';
    }
    if (msg.type === 'mention' && msg.mentions.includes(currentUser.name)) {
      return 'bg-yellow-50 text-gray-800 rounded-bl-none border border-yellow-200';
    }
    return 'bg-white text-gray-800 shadow-soft rounded-bl-none';
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] p-4 bg-primary text-white rounded-full shadow-soft-lg hover:bg-primary-dark transition-all duration-200 hover:scale-105"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-80 sm:w-96 bg-white rounded-2xl shadow-soft-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-sm">
                  {selectedUser ? `💬 ${selectedUser.name}` : 'Team Chat'}
                </h3>
                <p className="text-xs opacity-80">
                  {selectedUser ? 'Direct message' : `${onlineUsers.length} online`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowUserList(!showUserList);
                  setSelectedUser(null);
                }}
                className="text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                {showUserList ? '✕' : '👥'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User List */}
          {showUserList && (
            <div className="p-3 border-b border-gray-100 max-h-48 overflow-y-auto">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setShowUserList(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedUser ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                    }`}
                >
                  👥 Team Chat
                </button>
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserList(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedUser?.id === user.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                      {user.avatar}
                    </div>
                    <span>{user.name}</span>
                    {user.status === 'active' && (
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-auto"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && typingUsers[0] !== currentUser.id && (
            <div className="px-4 py-1 text-xs text-gray-400 italic">
              {typingUsers.map(id => {
                const user = getUserById(id);
                return user ? `${user.name} is typing...` : '';
              }).join(', ')}
            </div>
          )}

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {userMessages.filter(msg => {
              if (selectedUser) {
                return msg.userId === selectedUser.id ||
                  msg.toUserId === selectedUser.id ||
                  (msg.type === 'direct' && (msg.userId === currentUser.id || msg.toUserId === currentUser.id));
              }
              return msg.type === 'team' || msg.type === 'mention' ||
                (msg.type === 'direct' && msg.userId === currentUser.id);
            }).map((msg) => {
              const reactionList = msg.reactions || {};
              const reactionKeys = Object.keys(reactionList);

              return (
                <div key={msg.id} className="group">
                  <div
                    className={`flex ${msg.userId === currentUser.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${getMessageStyle(msg)}`}>
                      {msg.userId !== currentUser.id && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">{msg.userName}</span>
                          {msg.type === 'direct' && msg.toUserId && (
                            <span className="text-xs text-purple-500">💬 DM</span>
                          )}
                          {msg.type === 'mention' && msg.mentions.includes(currentUser.name) && (
                            <span className="text-xs text-yellow-600">📌 Mention</span>
                          )}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                      {/* Reactions Display */}
                      {reactionKeys.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reactionKeys.map((reaction) => {
                            const users = reactionList[reaction] || [];
                            const count = users.length;
                            const hasReacted = users.includes(currentUser.id);
                            return (
                              <button
                                key={reaction}
                                onClick={() => handleAddReaction(msg.id, reaction)}
                                className={`text-xs rounded-full px-2 py-0.5 inline-flex items-center gap-0.5 transition-all ${
                                  hasReacted
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {reaction} {count > 0 && <span className="text-xs font-bold">{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className={`flex items-center justify-between mt-1.5 gap-2`}>
                        <span className={`text-xs ${msg.userId === currentUser.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.userId === currentUser.id && (
                          <span className="text-xs text-white/50">
                            {msg.readBy.length > 1 ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Reaction Buttons - Hover to show */}
                  {msg.userId !== currentUser.id && (
                    <div className="flex justify-start gap-1 mt-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {reactions.map((reaction) => (
                        <button
                          key={reaction}
                          onClick={() => handleAddReaction(msg.id, reaction)}
                          className="text-sm hover:bg-gray-100 hover:scale-110 p-1 rounded-full transition-all"
                          title={`React with ${reaction}`}
                        >
                          {reaction}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 relative">
            {selectedUser && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">💬 To:</span>
                <span className="text-xs font-medium text-primary">{selectedUser.name}</span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={selectedUser ? `Message ${selectedUser.name}...` : "Type a message... ( @ to mention )"}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
              />

              {/* Emoji Picker Button */}
              <button
                onClick={toggleEmojiPicker}
                className={`p-2.5 rounded-xl transition-colors ${
                  showEmojiPicker 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-400 hover:text-primary hover:bg-gray-100'
                }`}
                type="button"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Emoji Picker - STAYS OPEN after clicking emojis */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-soft-lg p-3 max-w-[220px] z-50">
                <div className="grid grid-cols-6 gap-1.5">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="text-2xl hover:bg-gray-100 hover:scale-125 rounded p-1 transition-all"
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Click multiple emojis</span>
                  <button
                    onClick={closeEmojiPicker}
                    className="text-xs text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            )}

            {/* Mention Suggestions */}
            {showMentions && filteredMentionUsers.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-soft max-h-32 overflow-y-auto">
                {filteredMentionUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleMentionClick(user)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                      {user.avatar}
                    </div>
                    <span>{user.name}</span>
                    <span className="text-xs text-gray-400">@{user.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;