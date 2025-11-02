import React, { useState, useEffect } from 'react';
import './GroupsPage.css';
import HeaderBar from '../HeaderBar/HeaderBar';
import CreateGroupButton from './CreateGroupButton'; 
import AllGroupsButton from './AllGroupsButton';
import CreatedGroupsButton from './CreatedGroupsButton';
import JoinedGroupsButton from './JoinedGroupsButton';
import DiscoverGroupSearch from './DiscoverGroupSearch';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function GroupsPage() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [userGroups, setUserGroups] = useState({
        all: [], 
        created: [],
        joined: []
    });    
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchUserGroups();
    }, []);

    // Check if we need to refresh after group creation
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('refresh') === 'true') {
            // Remove the refresh parameter from URL
            navigate('/GroupsPage', { replace: true });
            // Refresh the groups list
            fetchUserGroups();
        }
    }, [location.search, navigate]);

    const fetchUserGroups = async () => {
        try {
            setIsLoading(true);
            // Fetch all groups and filter on frontend for now
            // In a real app, you'd have specific endpoints like:
            // - /api/users/{userId}/groups/created
            // - /api/users/{userId}/groups/joined
            const response = await axios.get('http://localhost:5000/api/groups');
            const allGroups = response.data;
            
            console.log('All groups:', allGroups);
            console.log('Current user ID:', userId);
            
            // Filter groups based on user's relationship
            const userCreatedGroups = allGroups.filter(group => {
                const creatorId = group.creator?._id || group.creator;
                const isCreator = creatorId === userId;
                console.log(`Group "${group.name}": creator=${creatorId}, userId=${userId}, isCreator=${isCreator}`);
                return isCreator;
            });
            
            const userJoinedGroups = allGroups.filter(group => {
                const creatorId = group.creator?._id || group.creator;
                const isCreator = creatorId === userId;
                const isMember = group.members && group.members.some(member => {
                    const memberId = member._id || member;
                    return memberId === userId;
                });
                return isMember && !isCreator;
            });
            const userGroups = allGroups.filter(group => {
                const creatorId = group.creator?._id || group.creator;
                const isCreator = creatorId === userId;
                const isMember = group.members && group.members.some(member => {
                    const memberId = member._id || member;
                    return memberId === userId;
                });
                return isMember || isCreator;
            });

            console.log('User created groups:', userCreatedGroups);
            console.log('User joined groups:', userJoinedGroups);

            setUserGroups({
                all: userGroups,
                created: userCreatedGroups,
                joined: userJoinedGroups
            });
        } catch (error) {
            console.error('Error fetching user groups:', error);
            setUserGroups({ all: [], created: [], joined: [] });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        console.log(`Filter changed to: ${filter}`);
    };

    const handleGroupClick = (groupId) => {
        navigate(`/groups/${groupId}`);
    };

    const getFilteredGroups = () => {
        return userGroups[selectedFilter] || [];
    };

    const renderGroupItem = (group) => ( 
        <div 
            key={group._id} 
            className="group-item"
            onClick={() => handleGroupClick(group._id)}
        >
            <div className="group-avatar">
                {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="group-name">
                {group.name}
            </div>
        </div>
    );

    return (
        <div>
          {/*ההדר בראש העמוד */}
            <HeaderBar   profilePicture ={localStorage.getItem('userProfileImage')}/>
            <div className="groups-page-container">
                {/* Left Sidebar */}
                <div className="groups-sidebar">
                    <CreateGroupButton />
                    
                    <div className="user-groups-section">
                        <h3>Your Groups</h3>

                        <div className="filter-buttons"> 
                            <AllGroupsButton 
                                isActive={selectedFilter === 'all'}
                                onClick={() => handleFilterChange('all')}
                            />
                            <CreatedGroupsButton 
                                isActive={selectedFilter === 'created'}
                                onClick={() => handleFilterChange('created')}
                            />
                            <JoinedGroupsButton 
                                isActive={selectedFilter === 'joined'}
                                onClick={() => handleFilterChange('joined')}
                            />
                        </div>
                        
                        <div className="groups-list">
                            {isLoading ? (
                                <div className="loading-state">
                                    <p>Loading your groups...</p>
                                </div>
                            ) : getFilteredGroups().length > 0 ? (
                                getFilteredGroups().map(renderGroupItem)
                            ) : (
                                <div className="no-groups-message">
                                    <p>
                                        {selectedFilter === 'all' && 'No groups available'}
                                        {selectedFilter === 'created' && 'You haven\'t created any groups yet'}
                                        {selectedFilter === 'joined' && 'You haven\'t joined any groups yet'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="groups-search-area">
                    <DiscoverGroupSearch />
                </div>
            </div>
        </div>
    );
}

export default GroupsPage;