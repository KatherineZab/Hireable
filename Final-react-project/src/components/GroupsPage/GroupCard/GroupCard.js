import React from 'react';
import './GroupCard.css';

function GroupCard({ 
    group, // האובייקט שלנו הוא קבוצה 
    onCardClick, // הפונק שלו 
    variant = "grid" // "grid" or "list" עיצוב בצורת מרובע
}) {
    const truncateText = (text, maxLength = 10000) => { // מקצרת תיאורים שמה להם ... אעפ שזה די הרבה כרגע
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const handleCardClick = () => {// ברגע של לחיצה תעביר לקבוצה שהמזהה שלה שייך לקלף 
        if (onCardClick) {
            onCardClick(group._id);
        }
    };

    // Privacy icon component
    const PrivacyIcon = () => ( 
        <div className="privacy-icon">
            {group.isPrivate ? '🔒' : '🌐'}
        </div>
    );

    if (variant === "list") { // עיצובי
        return (
            <div 
                className="group-result-card" 
                onClick={handleCardClick}
                style={{ cursor: onCardClick ? 'pointer' : 'default' }}
            >
                <PrivacyIcon />
                <div className="group-info">
                    <h4>{group.name}</h4>
                    <p>{truncateText(group.description)}</p>
                    <span className="member-count">{group.memberCount || 0} members</span>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="group-card" 
            onClick={handleCardClick}
            style={{ cursor: onCardClick ? 'pointer' : 'default' }}
        >
            <PrivacyIcon />
            <h4>{group.name}</h4>
            <p>{truncateText(group.description)}</p>
            <span>{group.memberCount || 0} members</span>
        </div>
    );
}

export default GroupCard;