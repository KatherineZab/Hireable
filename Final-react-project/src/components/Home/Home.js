import React, { useEffect,useState } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import axios from 'axios';
import './Home.css';
import Post from './Posts/posting/Post';
import PostDummy from './Posts/posting/PostDummy';
import Modal from './Posts/poststoshow/Modal';
import './Posts/poststoshow/Modal.css';
import FriendsListing from './FriendsListing';
import SelectFeedButtons from './SelectFeedButtons';
import DailyQuestion from './DailyQuestion';
import AllPosts from './Posts/poststoshow/AllPosts';

export default function Home() {
    const [userInfo, setUserInfo] = useState(null);
    const [following,setFollowing] = useState([]);
    const [followers,setFollowers] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [postDummyClicked, setPostDummyClicked] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [filterBy,setFilterBy] = useState('none');
    const [questionModalOpen, setQuestionModalOpen] = useState(false);

   useEffect(() => {
    const fetchUserInfo = async () => {
    try 
    {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(`http://localhost:5000/api/userinfo/${userId}`);
      console.log("🔍 userInfo from server:", response.data); 
      if(localStorage.getItem('userProfileImage')!==null) {
        localStorage.setItem('userProfileImage', response.data.profilePicture);
      }

      setUserInfo(response.data);
      setFollowing(response.data.followingUsers);
      setFollowers(response.data.followers);

  
    } 
    catch (err) {
      console.error("Failed to load user info:", err);   
    }
    };

  fetchUserInfo();
}, []);


let friends = following.filter(user =>
    followers.map(f => f.toString()).includes(user.toString())
  );
    return (
        <div>
            <header className="header-bar-fixed flex justify-between items-center mb-4">
                <HeaderBar 
                    profilePicture = {localStorage.getItem('userProfileImage')}
                    />
            </header>
            
            <div className='home-main-layout'>
                <div className="sidebar">
                <button className="daily-question-button"onClick={() => setQuestionModalOpen(true)}>
                        📚 Daily Question
                    </button>  
                    <FriendsListing userFriends={ friends } />                
                </div>
                
                <div className='main-content'>
                    <PostDummy setPostDummyClicked={setPostDummyClicked} profilePicture = {userInfo?.profilePicture}/>
                    <SelectFeedButtons setFilterBy = {setFilterBy} onSelect ={()=>setRefreshTrigger(prev => !prev)} />
                    { postDummyClicked &&(
                        <Modal onClose={()=> setPostDummyClicked(false)} isLocked={isLocked}>
                            <Post setIsLocked={setIsLocked} onPostSuccess={()=>setRefreshTrigger(prev => !prev)} onClose={()=> setPostDummyClicked(false)}  />
                        </Modal>
                    )}
                    {questionModalOpen && (
                        <Modal onClose={() => setQuestionModalOpen(false)} isLocked={false}>
                            <DailyQuestion userInfo={userInfo} />
                        </Modal>
                    )}
                    <AllPosts refreshTrigger={refreshTrigger} filterBy={filterBy} canViewPosts={true} />
                </div>

            </div>
        </div>
    );
}
