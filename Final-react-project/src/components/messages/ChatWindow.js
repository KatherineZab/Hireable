// components/messages/ChatWindow.js
import React from 'react';
import './ChatWindow.css';
import FloatingChat from './FloatingChat';

export default function ChatWindow({ selectedConversation }) {
  return (
    <div className="chat-window">
      {selectedConversation ? (
        <FloatingChat user={selectedConversation} mode="window" hideControls={true} />
      ) : (
        <div className="select-conversation">
          <p>Select a conversation</p>
          <small>Choose a conversation from the list to start messaging</small>
        </div>
      )}
    </div>
  );
}
