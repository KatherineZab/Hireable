// JoinRequestsDropdown.js - Create this new component
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRequestsDropdown.css';
// דרופדאון של כל בקשות הצטרפות לקבוצה
function JoinRequestsDropdown({  
    pendingRequests, // מערך בקשות שעדיין לא טופלו
    onApprove, // פונקציה חיצונית שמאשרת מועמדים בגרופ דיטייל
    onReject, // פונקציה חיצונית שדוחה מועמדים בגרופ דיטייל
    processingRequests // סט של מזהים בתהליך כדי שיהיה ניתן לנעול
}) {
    const [isOpen, setIsOpen] = useState(false);// האם התיבה פתוחה-ברירת מחדל לא 
    const dropdownRef = useRef(null); //נשתמש בו לבדוק אם המשתמש לחץ מחוץ לתיבה כדי לסגור אותה 
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {// מריץ קוד צדדי אחרי שהקומפוננטה רונדרה למסך - side effect 
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { //האם המשתמש לחץ במיקום שהוא מחוץ לתיבה 
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);// מאזין שבודק האם העכבר נלחת מחוץ למסך 
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);// הסרה של המאזין כדי למנוע זליגת זיכרון ברגע שהדף מתרענן לדוג
        };
    }, []);

    const handleUserClick = (userId) => {// מעבר לפרופיל של היוזר שנמצא בבקשות 
        navigate(`/profile/${userId}`);
        setIsOpen(false);// סוגר את התיבה
    };

    if (!pendingRequests || pendingRequests.length === 0) {
        return null; //כאשר איו בקשות לא להציג
    }

    return (// תחילת הרנדור למעשה
        <div className="join-requests-dropdown" ref={dropdownRef}> {/*מחברים רף שנוכל לראות אם המשתמש מקליק מחוץ לתיבה */}
            <button 
                className="dropdown-trigger"
                
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="icon">👥</span>
                <span>Join Requests</span>
                <span className="badge">{pendingRequests.length}</span>
                <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="dropdown-content">
                    <div className="dropdown-header">
                        <h4>Pending Join Requests</h4>
                    </div>
                    
                    <div className="requests-list">
                        {pendingRequests.map((req, idx) => {
                            const user = req.userId && typeof req.userId === 'object' ? req.userId : null;
                            const userId = req.userId && typeof req.userId === 'string' ? req.userId : req.userId?._id;
                            
                            if (!user && !userId) return null;

                            const isProcessing = processingRequests.has(user?._id || userId);
                            const displayName = user?.displayName || user?.email || 'Unknown User';
                            const email = user?.email || '';
                            const profilePicture = user?.profilePicture || '/default-avatar.png';
                            
                            return (
                                <div key={user?._id || userId || idx} className="request-item">
                                    <div 
                                        className="user-info"
                                        onClick={() => handleUserClick(user?._id || userId)}
                                    >
                                        <img 
                                            src={profilePicture} 
                                            alt="Profile" 
                                            className="user-avatar"
                                            onError={e => {
                                                if (!e.target.src.endsWith('/default-avatar.png')) {
                                                    e.target.src = '/default-avatar.png';
                                                }
                                            }}
                                        />
                                        <div className="user-details">
                                            <div className="user-name">
                                                {displayName}
                                            </div>
                                            <div className="user-email">
                                                {email}
                                            </div>
                                            <div className="request-time">
                                                {req.requestedAt ? 
                                                    new Date(req.requestedAt).toLocaleDateString() : 
                                                    'Unknown date'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="action-buttons">
                                        <button
                                            className="accept-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onApprove(user?._id || userId);
                                            }}
                                            disabled={isProcessing}
                                            title="Accept request"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReject(user?._id || userId);
                                            }}
                                            disabled={isProcessing}
                                            title="Reject request"
                                        >
                                            ✗
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default JoinRequestsDropdown;