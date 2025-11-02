import React, { useEffect, useState } from 'react';
import FollowButton from './FollowButton';
import './UserCard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserCard({ user, currentUserId, onRefresh }) {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (typeof user === 'string') {
          const res = await axios.get(`http://localhost:5000/api/userinfo/${user}`);
          setUserData(res.data);
        } else {
          setUserData(user);
        }
      } catch (err) {
        console.error('Error fetching user data in UserCard:', err);
      }
    };

    fetchUserData();
  }, [user]);

  if (!userData) return null;


  return (
    <div className="user-card">
      <img
        src={userData.profilePicture || 'https://via.placeholder.com/80'}
        alt="Profile"
        className="user-card-image"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/profile/${user.userId}`)}
      />
      <div className="user-card-info">
        <p>{userData.first_name} {userData.last_name}</p>
        {userData.userId !== currentUserId && (
            <FollowButton
                currentUserId={currentUserId}
                viewedUserId={userData.userId}
                onRefresh={onRefresh}
            />
        )}
      </div>
    </div>
  );
}

