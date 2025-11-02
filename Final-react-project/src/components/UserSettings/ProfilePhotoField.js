import React from "react";
import "./ProfilePhotoField.css";
import ImageUploadButton from "./ImageUploadButton";

export default function ProfilePhotoField({ previewImage, setPreviewImage, setSelectedImageFile }) {
  const handlePreviewReady = (file) => {
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setSelectedImageFile(file);
  };

  return (
    <div className="photo-card">
      <div className="profile-photo-container">
        <div className="profile-photo-wrapper">
          <div className="profile-photo-circle">
            {previewImage && (
              <img
                src={previewImage || "/images/default-profile.png"}
                alt="Profile Preview"
                className="preview-image"
              />
            )}
          </div>
          <ImageUploadButton onFileSelect={handlePreviewReady} />
        </div>

        <div className="profile-photo-content">
          <h3>Profile Photo</h3>
          <p>Upload a professional photo that represents you well</p>
        </div>
      </div>
    </div>
  );
}

