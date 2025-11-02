import React from 'react';
import './ProfileBox.css';
import FollowButton from './FollowButton';
import { useChat } from '../messages/ChatContext';

export default function ProfileBox({ user, currentUserId, onRefresh }) {
  const isOwnProfile = user.userId?.toString() === currentUserId;
  const { openChat } = useChat();

  return (
    <div className="profile-box-container">
      <div className="profile-header">
        <div className="profile-photo-wrapper">
          <img
            src={user.profilePicture || 'https://via.placeholder.com/96'}
            alt="Profile"
            className="profile-img"
          />
        </div>
        <div className="user-info">
          <h2>{user.first_name} {user.last_name}</h2>
          <p className="headline">{user.headline || ''}</p>
        </div>
      </div>
       {!isOwnProfile && (
        <div className="profile-actions">
            <FollowButton currentUserId={currentUserId} viewedUserId={user.userId}  onRefresh={onRefresh}/>
            <button className="profile-btn" onClick={() => openChat(user)}>Message</button>
        </div>
         )}
      <div className="profile-stats">
        <div className="stat">
          <span className="number">{user.posts?.length || 0}</span>
          <span className="label">Posts</span>
        </div>
        <div className="stat">
          <span className="number">{user.followers?.length || 0}</span>
          <span className="label">Followers</span>
        </div>
        <div className="stat">
          <span className="number">{user.followingUsers?.length || 0}</span>
          <span className="label">Following</span>
        </div>
      </div>
    </div>
    
  );
}
