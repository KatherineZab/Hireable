// Create this new file: src/components/GroupsPage/GroupDetail/MembersDropdown/MembersDropdown.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MembersDropdown.css';
import axios from 'axios';

function MembersDropdown({ groupId, isAdmin, currentUserId, onMemberRemoved }) {
    const [isOpen, setIsOpen] = useState(false);// האם התיבה פתוחה
    const [members, setMembers] = useState([]); // מערך חברים
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');// חיפוש 
    const [loading, setLoading] = useState(false);// טעינה של החברים
    const [removingMember, setRemovingMember] = useState(null);// מחיקת חבר 
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) { // פנייה לדום אם התיבה פתוחה שיאזין לעכבר ויסגור
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);//סוגר את התיבה לאחר האזנה לעכבר
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch members when dropdown opens
    useEffect(() => {
        if (isOpen && members.length === 0) {
            fetchMembers();
        }
    }, [isOpen, groupId]);

    // Filter members based on search term
    useEffect(() => { 
        if (searchTerm.trim() === '') { //אם החיפוש ריק אז תחזיר את כל הרשימה
            setFilteredMembers(members);
        } else {
            const filtered = members.filter(member =>
                member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||// לחפש גם לפי אותיות קטנות וגדולות 
                member.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMembers(filtered);//תחזיר את הרשימה המפולטרת
        }
    }, [searchTerm, members]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token'); //הטוקן שהוא המזהה של היוזר הנוכחי לצרכי אותנטיקציה
            const response = await axios.get(
                `http://localhost:5000/api/groups/${groupId}/members?userId=${currentUserId}`,//בקשה לשרת לבדוק האם היוזר הוא האדמין 
                { 
                    headers: token ? { 
                        'Authorization': `Bearer ${token}` 
                    } : {} 
                }
            );
            setMembers(response.data.members || []);//המערך יכיל את החברים או מערך ריק
        } catch (error) {
            console.error('Error fetching members:', error);
            if (error.response?.status === 403) {
                // Private group - user not a member
                setMembers([]);
            }
        } finally {
            setLoading(false);//מאפס את מצב הטעינה
        }
    };

    const handleUserClick = (userId) => {//אם לוחצים על שם משתמש תעביר אותנו לשם 
        navigate(`/profile/${userId}`);
        setIsOpen(false);// מאפס את מצב התיקייה הפתוחה
    };

    const handleRemoveMember = async (memberToRemove) => {//הסרה של משתמש
        if (window.confirm(`Are you sure you want to remove ${memberToRemove.displayName} from this group?`)) {//פופ אפ של ווינדווס שמוודא שרוצים להעיף
            try {
                setRemovingMember(memberToRemove._id); //המזהה של החבר שרוצים לגרש
                const token = localStorage.getItem('token');// היוזר הנוכחי
                
                await axios.delete(
                    `http://localhost:5000/api/groups/${groupId}/members/${memberToRemove._id}`,//בקשה מהשרת להעיף את הנוכחי
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,//גוף הבקשה עם האותנטיקציה של האדמין
                            'Content-Type': 'application/json'
                        },
                        data: { userId: currentUserId } // Send current user ID in request body
                    }
                );

                // Remove member from local state
                const updatedMembers = members.filter(m => m._id !== memberToRemove._id);
                setMembers(updatedMembers);//לעדכן את החברים בלי זה שהסרנו
                
                // Notify parent component
                if (onMemberRemoved) {
                    onMemberRemoved(memberToRemove);
                }

                alert(`${memberToRemove.displayName} has been removed from the group.`);
            } catch (error) {
                console.error('Error removing member:', error);
                alert('Failed to remove member: ' + (error.response?.data?.message || error.message));
            } finally {
                setRemovingMember(null);
            }
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm(''); // Reset search when opening
        }
    };

    return (
        <div className="members-dropdown" ref={dropdownRef}>
            <button 
                className="dropdown-trigger members-trigger"
                onClick={toggleDropdown}
            >
                <span className="icon">👥</span>
                <span>Members</span>
                <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="dropdown-content members-content">
                    <div className="dropdown-header">
                        <h4>Group Members ({members.length})</h4>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="member-search"
                            />
                        </div>
                    </div>
                    
                    <div className="members-list">
                        {loading ? (
                            <div className="loading-members">Loading members...</div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="no-members">
                                {searchTerm ? 'No members found' : 'No members yet'}
                            </div>
                        ) : (
                            filteredMembers.map((member) => {
                                const isRemovingThis = removingMember === member._id;
                                const canRemove = isAdmin && !member.isCreator && member._id !== currentUserId;
                                
                                return (
                                    <div key={member._id} className="member-item">
                                        <div 
                                            className="user-info"
                                            onClick={() => handleUserClick(member._id)}
                                        >
                                            <img 
                                                src={member.profilePicture || '/default-avatar.png'} 
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
                                                    {member.displayName}
                                                    {member.isCreator && (
                                                        <span className="creator-badge">👑 Admin</span>
                                                    )}
                                                </div>
                                                <div className="user-email">
                                                    {member.email}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {canRemove && (
                                            <div className="member-actions">
                                                <button
                                                    className="remove-member-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveMember(member);
                                                    }}
                                                    disabled={isRemovingThis}
                                                    title="Remove member"
                                                >
                                                    {isRemovingThis ? '...' : '🗑️ Remove'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MembersDropdown;