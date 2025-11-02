import React from 'react';
import './JoinedGroupsButton.css';

function JoinedGroupsButton({ isActive, onClick }) { // הפילטר הנבחר כרגע והפונק המפעילה אותו 
    return (
        <button 
            className={`filter-btn joined-groups-btn ${isActive ? 'active' : ''}`} // לעיצוב אם זה אמת ייפתח גם קלאס אקטיב
            onClick={onClick}
        >
            Joined Groups
        </button>
    );
}

export default JoinedGroupsButton;