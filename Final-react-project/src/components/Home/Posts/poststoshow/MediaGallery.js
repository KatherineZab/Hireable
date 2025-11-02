import React, { useState, useEffect } from 'react';
import styles from './MediaGallery.module.css';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const MediaGallery = ({ media, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const currentMedia = media[currentIndex];

  return (
    <div className={styles.mediaGallery}>
      <div className={styles.galleryHeader}>
        <span className={styles.mediaCounter}>
          {currentIndex + 1} / {media.length}
        </span>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.galleryContent}>
        {media.length > 1 && (
          <button 
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={goToPrevious}
            aria-label="Previous media"
          >
            ←
          </button>
        )}

        <div className={styles.mediaContainer}>
          {currentMedia.type === 'image' ? (
            <Zoom>
              <img 
                src={currentMedia.url} 
                alt={`Media ${currentIndex + 1}`}
                className={styles.galleryMedia}
                style={{ cursor: 'zoom-in' }}
              />
            </Zoom>
          ) : (
            <video 
              src={currentMedia.url}
              className={styles.galleryMedia}
              controls
              autoPlay
            />
          )}
        </div>

        {media.length > 1 && (
          <button 
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={goToNext}
            aria-label="Next media"
          >
            →
          </button>
        )}
      </div>

      {media.length > 1 && (
        <div className={styles.galleryThumbnails}>
          {media.map((item, index) => (
            <div 
              key={index}
              className={
                `${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`
              }
              onClick={() => setCurrentIndex(index)}
            >
              {item.type === 'image' ? (
                <img src={item.url} alt={`Thumbnail ${index + 1}`} />
              ) : (
                <video src={item.url} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
