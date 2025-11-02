import React from "react";
import { useNavigate } from "react-router-dom";
import './GroupsButton.css';

function GroupsButton(){
     const navigate = useNavigate();
    
      const handleClick = () => {
        navigate("/GroupsPage"); 
      };

 return (
    <button 
      className="groups-button pill-button"
      onClick={handleClick}>
      <div className="button-content">
        <div className="button-text">Groups</div>
      </div>
    </button>
  );
}

export default GroupsButton;