import React, { useEffect, useState, useRef } from 'react';
import styles from './CommentsPanel.module.css';
import axios from 'axios';
import Modal from './Modal';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 10;

const CommentsPanel = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likeInProgress, setLikeInProgress] = useState({});
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showLikers, setShowLikers] = useState({ open: false, users: [], anchor: null });
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState({});
  const panelRef = useRef(null);
  
  const userId =  localStorage.getItem('userId') ;

  // Fetch comments with pagination
  const fetchComments = async (reset = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/comments?postId=${postId}&limit=${PAGE_SIZE}&skip=${reset ? 0 : page * PAGE_SIZE}`);
      if (reset) {
        setComments(res.data.comments);
        setPage(1);
      } else {
        setComments(prev => [...prev, ...res.data.comments]);
        setPage(prev => prev + 1);
      }
      setTotal(res.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(true);
    // eslint-disable-next-line
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/comments`, {
        postId,
        userId: userId,
        content: newComment.trim(),
      });
      setNewComment('');
      fetchComments(true);
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

const handleLike = async (commentId) => {
  setLikeInProgress(prev => ({ ...prev, [commentId]: true }));
  try {
    const res = await axios.post(`http://localhost:5000/api/comments/${commentId}/like`, {
      userId: userId
    });
    setComments(comments => comments.map(comment =>
      comment._id === commentId
        ? {
            ...comment,
            likes: res.data.liked
              ? [...(comment.likes || []), userId]
              : (comment.likes || []).filter(id => id.toString() !== userId)
          }
        : comment
    ));
  } catch (err) {
    setError('Failed to like comment');
  } finally {
    setLikeInProgress(prev => ({ ...prev, [commentId]: false }));
  }
};


  const hasLiked = (comment) => (comment.likes || []).some(id => id === userId);

  // Show likers modal
  const handleShowLikers = async (commentId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${commentId}/likers`);
      setShowLikers({ open: true, users: res.data, anchor: commentId });
    } catch (err) {
      setError('Failed to fetch likers');
    }
  };

  // Edit comment
  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };
  const handleEdit = async (commentId) => {
    try {
      await axios.put(`http://localhost:5000/api/comments/${commentId}`, {
        userId: userId,
        content: editContent.trim(),
      });
      setEditingId(null);
      setEditContent('');
      fetchComments(true);
    } catch (err) {
      setError('Failed to edit comment');
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    setDeleteInProgress(prev => ({ ...prev, [commentId]: true }));
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        data: { userId: userId }
      });
      fetchComments(true);
    } catch (err) {
      setError('Failed to delete comment');
    } finally {
      setDeleteInProgress(prev => ({ ...prev, [commentId]: false }));
    }
  };

  return (
    <div className={styles.panel} ref={panelRef}>
      <div className={styles.commentsList}>
        {loading && page === 0 ? (
          <div className={styles.loading}>Loading comments...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : comments.length === 0 ? (
          <div className={styles.noComments}>No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div className={styles.commentBox} key={comment._id}>
              <div className={styles.commentHeader}>
                <span className={styles.author}>{comment.userInfo?.first_name} {comment.userInfo?.last_name}</span>
                <span className={styles.date}>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              {editingId === comment._id ? (
                <div className={styles.editArea}>
                  <textarea
                    className={styles.textarea}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                  <button className={styles.editButton} onClick={() => handleEdit(comment._id)} disabled={!editContent.trim()}>Save</button>
                  <button className={styles.deleteButton} onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className={styles.commentText}>{comment.content}</div>
              )}
              <div className={styles.commentActions}>
                <button
                  className={`${styles.commentLikeButton} ${hasLiked(comment) ? styles.liked : ''}`}
                  onClick={() => handleLike(comment._id)}
                  disabled={likeInProgress[comment._id]}
                >
                  👍 {comment.likes ? comment.likes.length : 0}
                </button>
                <span
                  className={styles.likersCount}
                  onClick={() => handleShowLikers(comment._id)}
                  style={{ cursor: 'pointer', marginLeft: 8 }}
                >
                  {comment.likes && comment.likes.length > 0 ? `${comment.likes.length} liked` : ''}
                </span>
              {comment.userInfo && comment.userInfo.userId?.toString() === userId && editingId !== comment._id && (
                <>
                  <button className={styles.editButton} onClick={() => startEdit(comment)}>Edit</button>
                  <button className={styles.deleteButton} onClick={() => handleDelete(comment._id)} disabled={deleteInProgress[comment._id]}>Delete</button>
                </>
              )}
              </div>
            </div>
          ))
        )}
        {/* Pagination: Load more button */}
        {comments.length < total && !loading && (
          <button className={styles.loadMoreButton} onClick={() => fetchComments(false)}>Load more</button>
        )}
      </div>
      {/* Likers Modal */}
      {showLikers.open && (
        <Modal onClose={() => setShowLikers({ open: false, users: [], anchor: null })}>
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
            <button className={styles.closeModalButton} onClick={() => setShowLikers({ open: false, users: [], anchor: null })}>Close</button>
          </div>
        </Modal>
      )}
      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          placeholder="Write a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          rows={2}
          disabled={submitting}
        />
        <button
          className={styles.submitButton}
          type="submit"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CommentsPanel; 