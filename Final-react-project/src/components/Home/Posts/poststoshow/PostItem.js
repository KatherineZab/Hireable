import React, { useRef, useEffect, useState } from 'react';
import styles from './PostItem.module.css';
import ProfilePicture from '../ProfilePicture';
import PostContent from './PostContent';
import MediaThumbnailsRow from './MediaThumbnailsRow';
import CommentsPanel from './CommentsPanel';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Modal from './Modal';

const PostItem = ({
  item,
  currentUserId,
  onDelete,
  onEdit,
  onMediaThumbClick,
  selectedIndex,
  setSelectedIndex,
  commentsRef,
  admin,
  ingroup = false,
  className = '',
}) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentsRef.current && !commentsRef.current.contains(event.target)) {
        setSelectedIndex(null);
      }
    };
    if (selectedIndex === item._id) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedIndex, item._id, setSelectedIndex, commentsRef]);





  // Check if current user has liked the post
  const hasLiked = (item.likedBy || []).some(user => user.toString() === currentUserId);
  const [liked, setLiked] = useState(hasLiked);
  const [likeCount, setLikeCount] = useState((item.likedBy || []).length);
  const [likeInProgress,setLikeInProgress] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikers, setShowLikers] = useState({ open: false, users: [] });

  const handleShowLikers = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/${item._id}/likers`);
      setShowLikers({ open: true, users: res.data });
    } catch (err) {
      alert('Failed to fetch likers');
    }
  };

  const like = async () => {
    setLikeInProgress(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/like`, {
        userId: currentUserId,
        postID: item._id
      });
      if (response.status === 200 && response.data) {
        setLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like the post.');
    } finally {
      setLikeInProgress(false);
    }
  };
  

  
  return (
    <div
      className={`${styles.listItem} ${className}`}
      onClick={() => setSelectedIndex(item._id)}
      style={{ position: 'relative' }}
    >
     
    
      <ProfilePicture
        imageStyle={styles.profilePicture}
        src={item.profilePicture}
        alt="Profile"
      />
      <div className={styles.itemContent}>
        <div className={styles.userName}>
          {item.first_name || ''} {item.last_name || ''}
        </div>
        {item.createdAt && (
          <div className={styles.postDate}>
            {item.groupname&& !ingroup && (
              <div>
              <Link to={`/groups/${item.groupId}`}  className={styles.linkstyle} key={item.groupId}>  
                    {item.groupImage&& !ingroup&&(
                      < ProfilePicture imageStyle={styles.groupPicture} src={item.groupImage}  alt = "group image"  />
                    )}
                    <span className={styles.groupNameLink}>group: {item.groupname}</span>
                    
                    </Link >
              </div>
            )}
              
            
            {new Date(item.createdAt).toLocaleString()}
          </div>
        )}
        <PostContent content={item.content} />
        {Array.isArray(item.mediaUrls) && (
          <MediaThumbnailsRow
            mediaArray={item.mediaUrls}
            onThumbClick={idx => onMediaThumbClick(item.mediaUrls, idx)}
          />
        )}
        {/* Action Row */}
        <div className={styles.actionRow}>
          <button
            className={`${styles.actionButton} ${liked ? styles.liked : ''}`}
            onClick={e => { e.stopPropagation(); like(); }}
            disabled={likeInProgress}
          >
            {liked ? '👍' : '👍'} {likeCount}
          </button>
          <span
            className={styles.likersCount}
            onClick={handleShowLikers}
            style={{ cursor: 'pointer', marginLeft: 8 }}
          >
            {likeCount > 0 ? `${likeCount} liked` : ''}
          </span>
          <button
            className={styles.actionButton}
            onClick={e => { e.stopPropagation(); setShowComments(v => !v); }}
          >
            💬 Comment
          </button>
          {item.userId === currentUserId && (
            <button className={styles.actionButtonEdit} onClick={e => { e.stopPropagation(); onEdit(item._id); }}>
              Edit 
            </button>     
          )}
        </div>
        {/* Delete Button in bottom right */}
        {(admin||item.userId === currentUserId) && (
          <div className={styles.deleteButtonContainer}>
            <button className={styles.actionButtonDelete} onClick={e => { e.stopPropagation(); onDelete(item._id,item.mediaUrls); }}>
              <img style={{ width: '20px', border:'none' }} src="https://img.icons8.com/?size=100&id=11705&format=png&color=FA5252" alt="Trash" />
            </button>
          </div>
        )}
        {/* Comments Section */}
        {showComments && (
          <CommentsPanel postId={item._id} currentUserId={currentUserId} />
        )}
      </div>
      {/* Likers Modal */}
      {showLikers.open && (
        <Modal onClose={() => setShowLikers({ open: false, users: [] })}>
          <div className={styles.likersModalContent}>
            <h4>Liked by</h4>
            <ul>
              {showLikers.users.map(user => (
                <li key={user.userId} className={styles.likerItem}>
                  <img src={user.profilePicture} alt="Profile" className={styles.likerAvatar} />
                  <Link to={`/profile/${user.userId}`} className={styles.likerNameLink}>
                    {user.first_name} {user.last_name}
                  </Link>
                </li>
              ))}
            </ul>
            <button className={styles.closeModalButton} onClick={() => setShowLikers({ open: false, users: [] })}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PostItem; 