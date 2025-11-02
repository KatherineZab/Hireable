import styles from './SelectFeedButtons.module.css'

export default function SelectFeedButtons({setFilterBy,onSelect}){



    return (
        <div className={styles.selectFeedContainer}>
            <button className={styles.selectFeedButton} onClick={()=>{setFilterBy('none');onSelect()}}>All Feed</button>
            <button className={styles.selectFeedButton} onClick={()=>{setFilterBy('onlyGroupsIFollow');onSelect()}}>following groups feed</button>
            <button className={styles.selectFeedButton} onClick={()=>{setFilterBy('followingUsersPosts');onSelect()}}>following users feed</button>
        </div>
    )

} 