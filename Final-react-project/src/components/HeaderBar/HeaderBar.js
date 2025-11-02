import React from "react";
import SearchBar from "./SearchBar";
import ProfileMenu from "./ProfileMenu";
import HomeButton from "./HomeButton";
import MessagesButton from "./MessagesButton";
import LogoutButton from './LogoutButton';
import GroupsButton from "./GroupsButton";
import { useChat } from '../messages/ChatContext';
import "./Header.css";



function HeaderBar({ profilePicture}) {
  const { unreadCounts } = useChat();
  const totalUnread = Object.values(unreadCounts || {}).reduce((a, b) => a + b, 0);
  return (
    <div className="header-bar">

      <SearchBar/>
      
      <div className="header-buttons">
        <ProfileMenu profilePicture={profilePicture}/>
        <HomeButton />
        <MessagesButton count={totalUnread} />
        <GroupsButton />
        <LogoutButton />
      </div>
    </div>
  );
}

export default HeaderBar;
