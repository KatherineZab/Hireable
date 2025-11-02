import styles from './PostDummy.module.css';


export default function PostDummy({ setPostDummyClicked, profilePicture }) {
    
    const handleClick = () => {
        setPostDummyClicked(true);
    };

    return (
        <div className={styles.postFrame}>
           
            <img
                className={styles.profileIcon}
                src= {profilePicture || "https://www.w3schools.com/howto/img_avatar.png"}
                alt="Profile"
            />
                <input
                    className={styles.searchBarDummy}
                    placeholder="What's on your mind?"
                    readOnly = {true}
                    onClick={handleClick}
                />
    
            
        </div>
    );
}