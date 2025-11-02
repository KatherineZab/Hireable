import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FollowButton.css';

export default function FollowButton({ currentUserId, viewedUserId , onRefresh}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/userinfo/${currentUserId}`);
        const following = res.data.followingUsers || [];
        setIsFollowing(following.includes(viewedUserId));
      } catch (err) {
        console.error(" Error checking follow status:", err);
      }
    };

    if (currentUserId && viewedUserId) {
      checkFollowingStatus();
    }
  }, [currentUserId, viewedUserId]);

  const handleClick = async () => {
    if (isFollowing) {
      setShowConfirm(true);
    } else {
      try {
        await axios.post('http://localhost:5000/api/userinfo/follow', {
          followerId: currentUserId,
          followedId: viewedUserId
        });
        setIsFollowing(true);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error(" Error following user:", err);
      }
    }
  };

  const confirmUnfollow = async () => {
    try {
      await axios.post('http://localhost:5000/api/userinfo/unfollow', {
        followerId: currentUserId,
        followedId: viewedUserId
      });
      setIsFollowing(false);
      setShowConfirm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(" Error unfollowing user:", err);
    }
  };

  const cancelUnfollow = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <button
        className={`follow-btn ${isFollowing ? 'unfollow' : ''}`}
        onClick={handleClick}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to unfollow?</p>
            <div className="modal-actions">
              <button onClick={confirmUnfollow}>Yes</button>
              <button onClick={cancelUnfollow}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
