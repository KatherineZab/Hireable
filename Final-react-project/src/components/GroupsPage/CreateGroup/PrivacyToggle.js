import React from 'react';
import './PrivacyToggle.css';
// האם הקבוצה פרטית או ציבורית 
function PrivacyToggle({ isPrivate, onPrivacyChange }) { 
    return (
        <div className="form-section">
            <label className="form-label">Privacy</label>
            <div className="privacy-toggle">
                <label className="toggle-option">
                    <input
                        type="radio"
                        name="privacy"
                        value={false}
                        checked={!isPrivate}
                        onChange={() => onPrivacyChange(false)} // מעדכן את הפרטיות ברמת ההורה- createGroupPage 
                    />
                    <span className="toggle-text">
                        <strong>Public</strong>
                        <small>Anyone can see and join this group</small>
                    </span>
                </label>
                <label className="toggle-option"> 
                    <input
                        type="radio"
                        name="privacy"
                        value={true}
                        checked={isPrivate}
                        onChange={() => onPrivacyChange(true)}
                    />
                    <span className="toggle-text">
                        <strong>Private</strong>
                        <small>Only invited members can join</small>
                    </span>
                </label>
            </div>
        </div>
    );
}

export default PrivacyToggle;