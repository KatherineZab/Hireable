import React from 'react';
import './AllGroupsButton.css';

function AllGroupsButton({ isActive, onClick }) { // הפילטר הנבחר כרגע והפונק המפעילה אותו
    return (
        <button 
            className={`filter-btn all-groups-btn ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            All Groups
        </button>
    );
}

export default AllGroupsButton;