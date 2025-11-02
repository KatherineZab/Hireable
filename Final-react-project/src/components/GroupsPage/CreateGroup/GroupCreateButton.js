import React from 'react';
import './GroupCreateButton.css';

function GroupCreateButton({ onSubmit, isDisabled }) {  
    return (
        <button
            type="button"
            onClick={onSubmit}// נשלח לcreateGroupPage
            className="create-button"
            disabled={isDisabled} //לחסום את הכפתור כשיש שם לא מתאים או בתהליך יצירה 
        >
            Create Group
        </button>
    );
}

export default GroupCreateButton;