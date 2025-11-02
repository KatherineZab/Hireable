import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import MessagesPage from './components/messages/MessagesPage';
import GroupsPage from './components/GroupsPage/GroupsPage';
import GroupDetail from './components/GroupsPage/GroupDetail/GroupDetail';
import CreateGroupPage from './components/GroupsPage/CreateGroup/CreateGroupPage';
import Register from './components/Register';
import Home from './components/Home/Home';
import UserProfile from './components/profile/UserProfile';
import UserSettings from './components/UserSettings/UserSettings';
import socket from './socketConnection';
import { ChatProvider, useChat } from './components/messages/ChatContext';
import FloatingChat from './components/messages/FloatingChat';

function GlobalFloatingChats() {
  const { openChats, closeChat, minimizeChat, restoreChat } = useChat();
  return (
    <>
      {openChats.map((c, idx) => (
        <FloatingChat
          key={c.user.userId}
          user={c.user}
          isMinimized={c.minimized}
          onClose={() => closeChat(c.user.userId)}
          minimizeChat={() => minimizeChat(c.user.userId)}
          restoreChat={() => restoreChat(c.user.userId)}
          positionIndex={idx}
        />
      ))}
    </>
  );
}

function App() {
  useEffect(() => {
    socket.on("connect", () => {
    });
    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
    };
  }, []);

  return (
    <ChatProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/MessagesPage" element={<MessagesPage />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/groups/create" element={<CreateGroupPage />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/GroupsPage" element={<GroupsPage />} />
          </Routes>
          <GlobalFloatingChats />
        </div>
      </Router>
    </ChatProvider>
  );
}

export default App;
