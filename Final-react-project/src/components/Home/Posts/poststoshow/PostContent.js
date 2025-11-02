import React from 'react';
import styles from './PostContent.module.css';

const PostContent = ({ content }) => {
  if (!content) return null;
  return (
    <div className={styles.postContent}>
      {content.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
};

export default PostContent; 