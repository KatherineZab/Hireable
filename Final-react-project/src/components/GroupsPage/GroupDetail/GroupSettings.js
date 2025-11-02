import React, { useState } from 'react';
import './GroupSettings.css';
import axios from 'axios';

function GroupSettings({ group, userId, onGroupUpdated }) {
    const [name, setName] = useState(group.name);//עריכת שם ברירת מחדל זה שם הקבוצה
    const [description, setDescription] = useState(group.description || '');//עריכת אודות-ברירת מחדל אודות או ריק
    const [isPrivate, setIsPrivate] = useState(group.isPrivate);//עריכת פרטיות
    const [saving, setSaving] = useState(false);// בתהליך שמירה כדי שיהיה ניתן לנעול כפתורים
    const [deleting, setDeleting] = useState(false);//בסטייט בוליאני שמסמן אם בקשת מחיקה נשלחת לשרת כרגע

    const isAdmin = group.creator && ( //בדיקה האם המשתמש הוא האדמין 
        group.creator._id === userId || group.creator === userId// בין אם זה אובייקט או סטרינג 
    );

    const handleSave = async () => {// פונקציה אסינכרונית שגורמת לקוד להמתין שתסתיים הפעולה 
        setSaving(true);//בתהליך שמירה
        try {
            await axios.put(`http://localhost:5000/api/groups/${group._id}`, { // פעולה השמה שנעדכן את הפרטים החדשים של הקבוצה ,ממתינים שאכן יישלח 
                name,
                description,
                isPrivate,
                userId
            });
            alert('Group updated successfully');
            onGroupUpdated();//הצגה של הודעה שהעדכון בוצע בהצלחה
        } catch (err) {
            alert('Failed to update group');//הודעת שגיאה 
            console.error(err);
        }
        setSaving(false);//בטל תהליך שמירה 
    };

    const handleDelete = async () => {// הודעת פופ אפ של אישור ביטול מווינדווס לגבי מחיקת קבוצה 
    if (!window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return;

 
    
    setDeleting(true);
    try {        
        const response = await axios.delete(`http://localhost:5000/api/groups/${group._id}`, {// פעולת מחיקה של קבוצה בקשת אקסיוס
            data: { userId }//מי המוחק 
        });
        
        alert('Group deleted');
        window.location.href = '/GroupsPage';//לחזור לעמוד הקודם -למה לא נוויגייט כי זה גורם לרענון מלא 
    } catch (err) {
        
        alert('Failed to delete group');
        console.error(err);
    }
    setDeleting(false);// כך או כך תהליך מחיקה נעצר
};
    if (!isAdmin) return null; //אם המשתמש אינו מנהל הקבוצה – הרכיב לא מוצג כלל. מונע מגישה לא מורשית להגדרותם 

    return (
        <div className="group-settings">
            <h3>Group Settings</h3>
                      {/*  שינוי של שם הקבוצה-מקבל ערך שם ושם שם חדש*/}
            <div className="setting-field">
                <label>Group Name</label>
                <input value={name} onChange={e => setName(e.target.value)} />
            </div>
                      {/*  שינוי של אודות הקבוצה-מקבל ערך תיאור ושם תיאור חדש*/}

            <div className="setting-field">
                <label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="setting-field">
                <label>
                    <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={e => setIsPrivate(e.target.checked)}
                    />
                    {' '}Private Group
                </label>
            </div>

            {/* Inline Flex Fix */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    {deleting ? 'Deleting...' : 'Delete Group'}
                </button>
            </div>
        </div>
    );
}

export default GroupSettings;
