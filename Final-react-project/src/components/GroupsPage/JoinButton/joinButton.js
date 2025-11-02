import React from 'react';
import './JoinButton.css';

function JoinButton({ 
    onClick, 
    disabled = false, // הכפתור נעול ברירת מחדל
    isLoading = false,
    text = "Join Group",
    className = ""
}) {
    return (
        <button 
            className={`join-group-btn ${className}`}
            onClick={onClick}
            disabled={disabled || isLoading}
        >
            {isLoading ? '⏳' : text}
        </button>
    );
}

export default JoinButton;