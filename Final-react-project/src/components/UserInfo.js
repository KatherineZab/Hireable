export default function UserInfo(props){


    return (

         <div className="user-info">
                    <p><strong>Birth Date:</strong> {props.userInfo.birthDate ? new Date(props.userInfo.birthDate).toLocaleDateString() : 'Not set'}</p>
                    <p><strong>Profile Picture:</strong> {props.userInfo.profilePicture ? <img src={props.userInfo.profilePicture} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%' }} /> : 'Not set'}</p>
                    <p><strong>Following Users:</strong> {props.userInfo.followingUsers.length}</p>
                    <p><strong>Following Pages:</strong> {props.userInfo.followingPages.length}</p>
                </div>
    )
}