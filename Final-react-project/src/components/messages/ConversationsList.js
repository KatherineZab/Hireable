import React, { useEffect, useState } from 'react';
import './ConversationsList.css';
import ConversationUserCard from './ConversationUserCard';
import { useChat } from './ChatContext';

export default function ConversationsList() {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const myId = localStorage.getItem('userId');
  const { unreadCounts, setSelectedConversation } = useChat();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/conversations/${myId}`);
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        setConversations([]);
      }
    };
    fetchConversations();
  }, [myId]);


  const filteredConversations = conversations.filter(user => {
    const search = searchTerm.trim().toLowerCase();
    return (
      user.first_name.toLowerCase().startsWith(search) ||
      user.last_name.toLowerCase().startsWith(search)
    );
  });

  return (
    <div className="conversations-list">
      <h2>Messages</h2>
      <input
        type="text"
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {filteredConversations.length === 0 ? (
        <div className="no-conversations">
          <p>No conversations yet</p>
          <small>Start a conversation from someone's profile</small>
        </div>
      ) : (
        <div className="conversations-users-list">
          {filteredConversations.map(user => (
            <ConversationUserCard key={user.userId} user={user} unreadCount={unreadCounts[user.userId] || 0} onClick={() => setSelectedConversation(user)} />
          ))}
        </div>
      )}
    </div>
  );
}
