import React from "react";
import { useNavigate } from "react-router-dom";
import './HomeButton.css';

function HomeButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/home");
  };

  return (
    <button 
      className="home-button pill-button"
      onClick={handleClick}>
      <div className="button-text">Home</div>
    </button>
  );
}
export default HomeButton;