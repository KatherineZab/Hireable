import axios from "axios"
import { useEffect, useState } from "react";
import styles from './FriendsListing.module.css'
import ProfilePicture from './Posts/ProfilePicture';
import { Link } from 'react-router-dom';
export default function FriendsListing( {userFriends} ) {
    const [friendsInfo, setFriendsInfo] = useState([]);

    useEffect(() => {
        const fetchFriendsList = async () => {
            try {
                const res = await axios.post('http://localhost:5000/api/getFriendsInfo', {
                    allFriendsId: userFriends
                });
                setFriendsInfo(res.data);
            } catch (err) {
                console.error("Failed to fetch friends info", err);
            }
        };

        if (userFriends && userFriends.length > 0) {
            fetchFriendsList();
        }
    }, [userFriends]); 

    return (
        <div>
            <span>Friends:</span>
            <div className={styles.friendsListRTL}>
                {friendsInfo.map(friend => (
                    <Link to={`/profile/${friend.userId}`}className={styles.item} key={friend.userId}>
                        < ProfilePicture imageStyle={styles.imageStyle} src={friend.profilePicture} alt="Profile"  />
                        <span>{friend.firstName} {friend.lastName}</span>
                    </Link >
                ))}
            </div>
        </div>
    );
}