import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../../socketConnection';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

function fetchUnreadCounts(myId, setUnreadCounts) {
  if (!myId) return;
  fetch(`http://localhost:5000/api/messages/unreadCounts/${myId}`)
    .then(res => res.json())
    .then(data => {
      setUnreadCounts(data);
    });
}

export function ChatProvider({ children }) {
  const [openChats, setOpenChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  // עדכן userId בכל שינוי ב-localStorage (למשל אחרי login/logout)
  useEffect(() => {
    const handleStorage = () => {
      setUserId(localStorage.getItem('userId'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const myId = userId;
    if (myId) {
      fetchUnreadCounts(myId, setUnreadCounts);
    }
  }, [userId]);


  useEffect(() => {
    const myId = userId;
    if (selectedConversation && myId) {
      fetch('http://localhost:5000/api/messages/markAsRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: selectedConversation.userId, to: myId })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to mark as read');
        return res.json();
      })
      .then(data => {
        fetchUnreadCounts(myId, setUnreadCounts);
      })
      .catch(err => {
        console.error('[ChatContext] Error marking as read:', err);
        fetchUnreadCounts(myId, setUnreadCounts);
      });
    }
  }, [selectedConversation, userId]);

  useEffect(() => {
    const myId = String(userId);
    const handleReceive = (msg) => {
    
    if (String(msg.to) === myId &&
        (window.location.pathname !== "/MessagesPage" ||
        !selectedConversation ||
        String(selectedConversation.userId) !== String(msg.from))) {
        fetchUnreadCounts(myId, setUnreadCounts);
    }
};
    socket.on('receiveMessage', handleReceive);
    return () => {
      socket.off('receiveMessage', handleReceive);
    };
  }, [selectedConversation, setUnreadCounts, userId]);

  useEffect(() => {
    if (userId && socket) {
      socket.connect();
      socket.emit('register', userId);
      fetchUnreadCounts(userId, setUnreadCounts);
    } else {
      setUnreadCounts({});
      setSelectedConversation(null);
      if (socket) socket.disconnect();
    }
  }, [userId]);

  const openChat = (user) => {
    setOpenChats(prev => {
      const existingIndex = prev.findIndex(c => c.user.userId === user.userId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const [chat] = updated.splice(existingIndex, 1);
        updated.push(chat);
        return updated;
      }
      if (prev.length >= 2) {
        return [...prev.slice(1), { user, minimized: false }];
      }
      return [...prev, { user, minimized: false }];
    });
  };

  const closeChat = (userId) => {
    setOpenChats(prev => prev.filter(c => c.user.userId !== userId));
  };

  const minimizeChat = (userId) => {
    setOpenChats(prev => prev.map(c =>
      c.user.userId === userId ? { ...c, minimized: true } : c
    ));
  };

  const restoreChat = (userId) => {
    setOpenChats(prev => prev.map(c =>
      c.user.userId === userId ? { ...c, minimized: false } : c
    ));
  };

  const closeAllChats = () => setOpenChats([]);

  return (
    <ChatContext.Provider value={{
      openChats,
      openChat,
      closeChat,
      minimizeChat,
      restoreChat,
      closeAllChats,
      unreadCounts,
      setUnreadCounts,
      selectedConversation,
      setSelectedConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export { fetchUnreadCounts }; 