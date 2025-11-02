// ItemList.js
import React, { useState, useRef } from 'react';
import './ItemList.css';
import axios from 'axios';

import MediaGallery from './MediaGallery';
import PostItem from './PostItem';
import Post from '../posting/Post';

const ItemList = ({ items, refreshPosts, admin=false ,ingroup= false, postItemClass='' }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const commentsRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleDelete = async (postId,urls) => {
    if (!window.confirm('you sure you want to delete this post?')) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        data: { userId: currentUserId,mediaUrls:urls },
        
      });
      if (response.status === 200) {
        refreshPosts();
      } else {
        alert(response.data.message || 'faild to delete the post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again later.');
    }
  };
 
  const handleEdit = (postId) => {
    const postToEdit = items.find(item => item._id === postId);
    if (postToEdit) {
      setEditingPost(postToEdit);
    }
  };

  const handleEditSuccess = () => {
    setEditingPost(null);
    refreshPosts();
  };

  const handleEditClose = () => {
    setEditingPost(null);
  };

  const handleMediaThumbClick = (mediaArray, idx) => {
    setGalleryMedia(
      mediaArray.map((m) => {
        const mUrl = typeof m === 'string' ? m : m.url;
        return {
          url: mUrl,
          type:
            typeof m === 'object' && m.type
              ? m.type
              : typeof mUrl === 'string' && mUrl.match(/\.(mp4|webm|ogg)$/i)
              ? 'video'
              : 'image',
        };
      })
    );
    setGalleryIndex(idx);
    setGalleryOpen(true);
  };

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="list-container">No posts available.</div>;
  }

  return (
    <>
      <div className="list-container">
        {items.map((item) => (
          <PostItem
            key={item._id}
            item={item}
            currentUserId={currentUserId}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onMediaThumbClick={handleMediaThumbClick}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            commentsRef={commentsRef}
            admin = {admin}
            ingroup={ingroup}
            className={postItemClass}
          />
        ))}
      </div>
      {galleryOpen && (
        <MediaGallery
          media={galleryMedia}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
      {editingPost && (
        <Post
          editMode={true}
          postToEdit={editingPost}
          onPostSuccess={handleEditSuccess}
          onClose={handleEditClose}
          setIsLocked={setIsLocked}
          isLocked={isLocked}
        />
      )}
    </>
  );
};

export default ItemList;
