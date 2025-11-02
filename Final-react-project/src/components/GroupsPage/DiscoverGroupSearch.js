import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar/SearchBar';
import { useNavigate } from 'react-router-dom'; 
import GroupCard from './GroupCard/GroupCard';
import './DiscoverGroupSearch.css';
import axios from 'axios';

function DiscoverGroupSearch() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(''); // מה שהמשתמש מקליד
    const [searchResults, setSearchResults] = useState([]); // התוצאת חיפוש
    const [isSearching, setIsSearching] = useState(false);// האם בחיפוש כעת- למנוע לחיצה כפולה על חיפוש,להציג אייקונס
    const [hasSearched, setHasSearched] = useState(false);//האם חיפש בעבר - לא להציג סתם אין תוצאות או תוצאות 
    const [allGroups, setAllGroups] = useState([]);// כל הקבוצות מהשרת
    const [displayedGroups, setDisplayedGroups] = useState([]);// מה שמוצג כרגע 
    const [isLoading, setIsLoading] = useState(true); // 
    //const [joiningGroups, setJoiningGroups] = useState(new Set());

    useEffect(() => {// טעינה ראשונית של כל הקבוצות כשלוחצים על הקומפוננטה 
        fetchAllGroups();
    }, []);

    const fetchAllGroups = async () => { // הגדרה של פונקציה אסינכרונית שיכולה להמתין בזמן לקריאות מהאייפיאיי
        try {
            setIsLoading(true);// מראה טעינה על המסך
            const response = await axios.get('http://localhost:5000/api/groups');// שולחים בקשה לשרת להביא את כל הקבוצות
            setAllGroups(response.data);
            setDisplayedGroups(response.data); //מציג את כל הקבוצות 
        } catch (error) {
            console.error('Error fetching groups:', error);//אם יש שגיאה מאפסים את הרשימות שלא ייצא דאטה שגוי 
            setAllGroups([]);
            setDisplayedGroups([]);
        } finally {
            setIsLoading(false); // לא טוען כי נגמרה הפעולה 
        }
    };

    const handleSearch = async () => { // פעולה אסינכרונית לבקשות מהשרת
        if (!searchQuery.trim()) { //אם החיפוש ריק אז
            setHasSearched(false); //לא חיפש וגם תוצאות החיפוש יהיו ריקות 
            setSearchResults([]);
            setDisplayedGroups(allGroups);//מציגים שוב את כל הקבוצות כי אין סינון 
            return;
        }
        
        setIsSearching(true);//אחרת כי יש חיפוש נוכחי וכן חיפש 
        setHasSearched(true);
        
        try {
            const response = await axios.get(`http://localhost:5000/api/groups/search?q=${encodeURIComponent(searchQuery)}`);// קיראה לשרת קידוד טקסט שיתאים לurl 
            setSearchResults(response.data); 
            // Update displayedGroups to show search results
            setDisplayedGroups(response.data);
        } catch (error) {
            console.error('Search error:', error);//אם יש שגיאה מאפסים את הרשימות שלא ייצא דאטה שגוי
            setSearchResults([]);
            setDisplayedGroups([]);
        } finally {
            setIsSearching(false);// לא טוען כי נגמרה הפעולה 
        }
    };

    const handleInputChange = (e) => { // מבצעים חיפוש שונה
        setSearchQuery(e.target.value);// מעדכן את ערך השאילתה 
        if (e.target.value === '') {// אם הטקסט ריק תציג הכל 
            setHasSearched(false);
            setSearchResults([]);
            setDisplayedGroups(allGroups);
        }
    };

    const handleKeyPress = (e) => { //בלחיצה על אנטר בצע חיפוש 
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // const handleJoinGroup = async (groupId) => {
    //     try {
    //         setJoiningGroups(prev => new Set([...prev, groupId]));
            
    //         // Add your join group API call here
    //         const response = await axios.post(`http://localhost:5000/api/groups/${groupId}/join`);
            
    //         console.log('Joining group:', groupId);
            
    //         // Simulate API delay
    //         await new Promise(resolve => setTimeout(resolve, 1000));
            
    //     } catch (error) {
    //         console.error('Error joining group:', error);
    //     } finally {
    //         setJoiningGroups(prev => {
    //             const newSet = new Set(prev);
    //             newSet.delete(groupId);
    //             return newSet;
    //         });
    //     }
    // };

    const handleGroupClick = (groupId) => {// בלחיצה על קלף קבוצה מעבר לשם 
        console.log('Navigating to group:', groupId);
        navigate(`/groups/${groupId}`);
    };

    return (
        <div className="group-discover-search">
            <h2>Discover Groups</h2>
            
            <div className="search-section">
                <SearchBar 
                    searchQuery={searchQuery}
                    onSearchChange={handleInputChange}
                    onSearch={handleSearch}
                    onKeyPress={handleKeyPress}
                    isSearching={isSearching}
                    placeholder="Search for groups"
                />
            </div>

            <div className="search-results">
                {isLoading && (
                    <div className="loading-state">
                        <p>Loading groups...</p>
                    </div>
                )}

                {isSearching && (
                    <div className="loading-state">
                        <p>Searching for groups...</p>
                    </div>
                )}
                                    {/*חיפש אך כלום לא נמצא */}

                {hasSearched && !isSearching && displayedGroups.length === 0 && (
                    <div className="no-results">
                        <p>No groups found for "{searchQuery}"</p>
                        <p>Try different keywords or create a new group!</p>
                    </div>
                )}

                {!isLoading && !isSearching && displayedGroups.length > 0 && (
                    <div className={hasSearched ? "results-list" : "groups-grid"}>
                        {displayedGroups.map(group => (
                            <GroupCard
                                key={group._id}
                                group={group}
                                variant={hasSearched ? "list" : "grid"}
                              //  onJoinClick={handleJoinGroup}
                                onCardClick={handleGroupClick}
                               // isJoining={joiningGroups.has(group._id)}
                            />
                        ))}
                    </div>
                )}
                                    {/*המצב הראשוני */}
                {!isLoading && !hasSearched && displayedGroups.length === 0 && (
                    <div className="no-results">
                        <p>No groups available yet</p>
                        <p>Be the first to create a group!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DiscoverGroupSearch;