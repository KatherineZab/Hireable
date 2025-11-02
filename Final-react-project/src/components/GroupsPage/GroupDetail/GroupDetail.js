import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeaderBar from '../../HeaderBar/HeaderBar';
import GroupHeader from './GroupHeader/GroupHeader';
import GroupSettings from './GroupSettings';
import AllPosts from '../../Home/Posts/poststoshow/AllPosts';
import JoinRequestsDropdown from './JoinRequestsDropdown/JoinRequestsDropdown';
import MembersDropdown from './MembersDropdown/MembersDropdown'; 
import './GroupDetail.css';
import axios from 'axios';
import PostDummy from '../../Home/Posts/posting/PostDummy'
// import styles from '../../Home/Posts/posting/PostDummy.module.css';
import Modal from '../../Home/Posts/poststoshow/Modal'
import Post from '../../Home/Posts/posting/Post'


// הצגת הקבוצה עצמה 

function GroupDetail() {
    const { groupId } = useParams(); // נשלף מהלינק של הקבוצה 
    const userId = localStorage.getItem('userId');// נשלף מהזיכרון המקומי על מזהה המשתמש כשעה לוג אין 
    const profilePicture = localStorage.getItem('userProfileImage'); // גם מהלוגאין 
    const [group, setGroup] = useState(null); // הקבוצה שהיוזר צופה בה והפונק שמשנה את פרטי הקבוצה- תחילה ריק
    const [loading, setLoading] = useState(true);// טעינה ואם נטען ישלוף נתונים מהשרת 
    const [error, setError] = useState(null);// 
    const [refreshPosts, setRefreshPosts] = useState(0);// רינדור מחדש כאשר עדכון בקבוצה 
    const [showSettings, setShowSettings] = useState(false); // אם אדמין אז שיציג את ההגדות - ברירת מחדל לא 
    const [processingRequests, setProcessingRequests] = useState(new Set());// סט של בקשות כניסה שבטיפול- לחסום כפתור קבלה דחייה
    const [postDummyClicked, setPostDummyClicked] = useState(false); // האם לחץ על הצגת פוסטים 
    const [isLocked, setIsLocked] = useState(false);//האם מודל כתיבת פוסט נעול בשעת שליחת פוסט כדי שלא ישלחו פעמיים 
    useEffect(() => {
        fetchGroupData();
    }, [groupId]); // שליפת פרטי דאטה כשהקומפוננטה נטענת 
        //במערך כי כשאני ניגשת לגרופ אחר זה שקודם הגרופ הראשון ואז לשני גם לעשות טעינה
    
    const fetchGroupData = async () => {//
        try {
            const token = localStorage.getItem('token'); //שליפה של הטוקן של היוזר
            const response = await axios.get(
                `http://localhost:5000/api/groups/${groupId}`, //בקשת גט לקבוצה הספציפית 
                { 
                    headers: token ? { 
                        'Authorization': `Bearer ${token}`  //
                    } : {} 
                }
            );
            setGroup(response.data);//שמים את המידע בגרופ
            setLoading(false);//מאפסים את הטעינה אחרי שהתקבל מהשרת 
        } catch (error) {
            console.error('Error fetching group:', error);
            setError('Group not found');
            setLoading(false);
        }
    };

    const handlePostSuccess = () => {// אם הועלה פוסט לרנדר מחדש 
        setRefreshPosts(prev => prev + 1);
    };

    const handleGroupUpdate = () => {// טוען מחדש את הנתונים של הקבוצה- לדוג פוסט חדש
        fetchGroupData();
    };

    const handleMemberRemoved = (removedMember) => {// מעדכן את פרטי הקבוצה כשחבר הוסר 
        // Refresh group data to update member count and other info
        fetchGroupData();
    };

    const handleApproveRequest = async (requestUserId) => {// לעדכן רשימת חברים 
        setProcessingRequests(prev => new Set([...prev, requestUserId]));// אם הצטרף תכניס לסט של הצטרפות 
        try {
            const token = localStorage.getItem('token');// לקבל טוקן מהלוגין לצרכי אותנטיקציה 
            console.log("FRONT AXIOS IN GROUPDEATAIL") //
            await axios.post(
                `http://localhost:5000/api/groups/${groupId}/approve-request`, // תוכן הבקשת איי פי איי פניה לשרת לאשר את ההצטרפות 
                { userId: requestUserId },// גוף הבקשה -המזהה של המשתמש שאותו רוצים לאשר 
                { 
                    headers: { //ההדרים 
                        'Authorization': `Bearer ${token}`,// האדמין שמאשר
                        'Content-Type': 'application/json'//התוכן בפורמט גייסון 
                    } 
                }
            );
            await fetchGroupData(); //לאחר אישור הבקשה לרענן את פרטי הקבוצה 
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessingRequests(prev => {
                const newSet = new Set(prev);// לא משנה אם אושר או לא כי לא הצליח נסיר את המשתמש מהרשימה של הבקשות שמעובדות 
                newSet.delete(requestUserId);
                return newSet;
            });
        }
    };

    const handleRejectRequest = async (requestUserId) => { //דחייה של מועמד 
        setProcessingRequests(prev => new Set([...prev, requestUserId])); // נעדכן את סט המועמדים שומר את כל מה שהיה ומוסיף את הנוכחי 
        try {
            const token = localStorage.getItem('token');// הטוקן של האדמין 
            await axios.post(
                `http://localhost:5000/api/groups/${groupId}/reject-request`, // שולח בקשה כדי לדחות הצטרפות 
                { userId: requestUserId },// מי צריך לדחות 
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            await fetchGroupData();// ממתין שהבקשה תסתיים ואז מרענן את פרטי הקבוצה 
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessingRequests(prev => {
                const newSet = new Set(prev);// לא משנה אם בוטל או לא כי לא הצליח נסיר את המשתמש מהרשימה של הבקשות שמעובדות
                newSet.delete(requestUserId);
                return newSet;
            });
        }
    };

    const isMember = group && group.members && group.members.some(member => // האם היוזר חבר בקבוצה 
        member._id === userId || member === userId
    );
    const isAdmin = group && group.creator && (
        group.creator._id === userId || group.creator === userId // האם היוזר הוא האדמין 
    );
    const canPost = isMember || isAdmin; // האם יכול להפרסם בקבוצה 

    if (loading) {// אם הקבוצה נטענת אז 
        return (
            <div>
                <HeaderBar profilePicture={profilePicture} />
                <div className="group-detail-container">
                    <div className="loading-state">
                        <p>Loading group...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {// לא הצליחה לטעון 
        return (
            <div>
                <HeaderBar  profilePicture={profilePicture} />
                <div className="group-detail-container">
                    <div className="error-state">
                        <h2>Group Not Found</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }
            console.log("the group ifno is!!!! :", group)

    return (
        <div>
            <HeaderBar  profilePicture={profilePicture} />
            <div className="group-detail-container">
                <GroupHeader 
                    group={group} 
                    onGroupUpdate={handleGroupUpdate} 
                    onToggleSettings={() => setShowSettings(prev => !prev)}
                />

                {/* ✅ Dropdown Section - Both dropdowns side by side */}
                <div className="group-dropdowns" style={{ 
                    margin: '16px 0', 
                    display: 'flex', 
                    gap: '12px', 
                    flexWrap: 'wrap' 
                }}>
                    {/* Members Dropdown - Show only if user is a member OR if group is public */}
                    {(isMember || isAdmin || !group.isPrivate) && (
                        <MembersDropdown
                            groupId={groupId}
                            isAdmin={isAdmin}
                            currentUserId={userId}
                            onMemberRemoved={handleMemberRemoved}
                        />
                    )}

                    {/* Join Requests Dropdown - Only show to admin */}
                    {isAdmin && (
                        <JoinRequestsDropdown
                            pendingRequests={group.pendingRequests || []}
                            onApprove={handleApproveRequest}
                            onReject={handleRejectRequest}
                            processingRequests={processingRequests}
                        />
                    )}
                </div>

                {showSettings && (
                    <GroupSettings 
                        group={group} 
                        userId={userId} 
                        onGroupUpdated={fetchGroupData} 
                    />
                )}

                <div className="group-content">
                    {canPost ? (
                        <div>
                            <PostDummy setPostDummyClicked={setPostDummyClicked} profilePicture = {profilePicture}/>
                            { postDummyClicked &&(  
                                <Modal onClose={()=> setPostDummyClicked(false)} isLocked={isLocked}>
                                    <Post groupId={groupId} setIsLocked={setIsLocked} onPostSuccess={handlePostSuccess} onClose={()=> setPostDummyClicked(false)}  />
                                </Modal>
                            )}
                        </div>
                            ) : (
                                <div className="non-member-message">
                                    <p>Join this group to share posts and participate in discussions!</p>
                                </div>
                            )}
                    
                    <AllPosts 
                        groupId={groupId}
                        refreshTrigger={refreshPosts}
                        canViewPosts={canPost}
                        isAdmin={isAdmin}
                        ingroup = {true}
                        context="group"
                    />
                </div>
            </div>
        </div>
    );
}

export default GroupDetail;