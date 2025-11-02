// components/chat/FloatingChat.js
import React, { useState, useEffect, useRef } from 'react';
import './FloatingChat.css';
import socket from '../../socketConnection';
import { useChat } from './ChatContext';
import { fetchUnreadCounts } from './ChatContext';

export default function FloatingChat({ user, onClose, isMinimized, minimizeChat, restoreChat, positionIndex = 0, mode = "floating", hideControls = false }) {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const myId = localStorage.getItem('userId');
  const { setUnreadCounts, selectedConversation } = useChat();

  // Fetch message history when chat opens or user changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!myId || !user.userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${myId}/${user.userId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchHistory();
  }, [user.userId, myId]);

  useEffect(() => {
    // Scroll to bottom when messages change or when minimized state changes
    if (!isMinimized && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  useEffect(() => {
    // When chat is opened and not minimized, mark as read and refetch unread counts
    if (!isMinimized && myId && user.userId) {
      fetch('http://localhost:5000/api/messages/markAsRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: user.userId, to: myId })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to mark as read');
        return res.json();
      })
      .then(() => {
        fetchUnreadCounts(myId, setUnreadCounts);
      })
      .catch(() => {
        fetchUnreadCounts(myId, setUnreadCounts);
      });
    }
  }, [isMinimized, myId, user.userId, setUnreadCounts]);

  useEffect(() => {
    // Listen for real-time incoming messages for this chat
    const handleReceive = (msg) => {
      if (msg && msg.from === user.userId && msg.to === myId) {
        // Fetch latest messages for this chat
        fetch(`http://localhost:5000/api/messages/${myId}/${user.userId}`)
          .then(res => res.json())
          .then(data => setMessages(data));
        // If chat is open (not minimized), mark as read and refetch unread counts
        if (!isMinimized) {
          fetch('http://localhost:5000/api/messages/markAsRead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: user.userId, to: myId })
          })
          .then(res => {
            if (!res.ok) throw new Error('Failed to mark as read');
            return res.json();
          })
          .then(() => {
            fetchUnreadCounts(myId, setUnreadCounts);
          })
          .catch(() => {
            fetchUnreadCounts(myId, setUnreadCounts);
          });
        }
      }
    };
    socket.on('receiveMessage', handleReceive);
    return () => {
      socket.off('receiveMessage', handleReceive);
    };
  }, [user.userId, myId, isMinimized, setUnreadCounts]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    const msg = {
      from: myId,
      to: user.userId,
      text: messageInput,
      time: new Date().toISOString()
    };
    socket.emit('sendMessage', msg);
    setMessages(prev => [...prev, msg]);
    setMessageInput('');
  };

  return (
    <div className={
      `${mode === "window" ? "chat-window-mode" : `floating-chat chat-pos-${positionIndex}`}${isMinimized ? " minimized" : ""}`
    }>
      <div className="chat-header">
        <img src={user.profilePicture} alt="profile" className="chat-avatar" />
        <span>{user.first_name} {user.last_name}</span>
        {!hideControls && (
          <div className="chat-controls">
            <button onClick={() => isMinimized ? restoreChat() : minimizeChat()}>_</button>
            <button onClick={onClose}>×</button>
          </div>
        )}
      </div>
      {!isMinimized && (
        <div className="chat-body">
          <div className="chat-messages">
            {messages.map((msg, idx) => {
              const showDate =
                idx === 0 ||
                new Date(msg.time).toDateString() !== new Date(messages[idx - 1].time).toDateString();
              return (
                <React.Fragment key={idx}>
                  {showDate && (
                    <div className="msg-date">
                      {new Date(msg.time).toLocaleDateString()}
                    </div>
                  )}
                  <div className={msg.from === myId ? 'my-message' : 'their-message'}>
                    {msg.text}
                    <div className="msg-time">
                      {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
      {!isMinimized && (
        <div className="chat-input">
          <textarea
            placeholder="Aa"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            style={{ resize: 'none', minHeight: 32, maxHeight: 120, width: '100%' }}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
    </div>
  );
}
