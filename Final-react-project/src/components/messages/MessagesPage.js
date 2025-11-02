// components/messages/MessagesPage.js
import React, { useState } from 'react';
import './MessagePage.css';
import HeaderBar from '../HeaderBar/HeaderBar';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import { useChat, fetchUnreadCounts } from './ChatContext';
import { useEffect } from 'react';

export default function MessagesPage() {
  const { selectedConversation, setSelectedConversation, setUnreadCounts } = useChat();

  useEffect(() => {
    if (selectedConversation) {
      const myId = localStorage.getItem('userId');
      // Mark as read and refetch unread counts (in case ChatContext didn't already do it)
      fetch('http://localhost:5000/api/messages/markAsRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: selectedConversation.userId, to: myId })
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
  }, [selectedConversation, setUnreadCounts]);

  return (
    <div>
      <HeaderBar  profilePicture={ localStorage.getItem('userProfileImage')} />
      <div className="messages-outer-container">
        <div className="messages-page">
          <ConversationsList onSelectConversation={setSelectedConversation} />
          <ChatWindow selectedConversation={selectedConversation} />
        </div>
      </div>
    </div>
  );
}
