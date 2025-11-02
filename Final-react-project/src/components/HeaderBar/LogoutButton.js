import { useNavigate } from 'react-router-dom';
import './LogoutButton.css';
import { useChat } from '../messages/ChatContext';

export default function LogoutButton({ onLogout }) {
    const navigate = useNavigate();
    const { closeAllChats } = useChat();
    
    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userProfileImage");
        localStorage.removeItem("userId");
        window.dispatchEvent(new Event("storage"));
        closeAllChats();
        onLogout?.();
        navigate("/", { replace: true });
    };

    return (
        <button
            onClick={handleLogout}
            className="logout-button pill-button"
        >
            <div className="button-content">
                <div className="button-text">Logout</div>
            </div>
        </button>
    );
}