import React from 'react';
import './CreateGroupButton.css';
import { Navigate, useNavigate } from 'react-router-dom';



function CreateGroupButton() {
    const navigate = useNavigate();
    const handleCreateGroup = () => {
        navigate('/groups/create');// עובר לדף יצירת קבוצה 
    };

    return (
        <button 
            className="create-group-btn"
            onClick={handleCreateGroup}
        >
            <span className="btn-icon">+</span> 
            Create Group
        </button>
    );
}

export default CreateGroupButton;