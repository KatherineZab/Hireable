import React from 'react';
import styles from './MediaThumbnailsRow.module.css';

const MediaThumbnailsRow = ({ mediaArray, onThumbClick }) => {
  if (!Array.isArray(mediaArray) || mediaArray.length === 0) return null;
  return (
    <div className={styles.mediaThumbnailsRow}>
      {mediaArray.map((media, idx) => {
        const mediaUrl = typeof media === 'string' ? media : media.url;
        const isImage = typeof mediaUrl === 'string' && mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
        return (
          <div
            key={idx}
            className={styles.mediaThumb}
            onClick={e => {
              e.stopPropagation();
              onThumbClick(idx);
            }}
          >
            {isImage ? (
              <img src={mediaUrl} alt="media" />
            ) : (
              <video src={mediaUrl} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MediaThumbnailsRow; 