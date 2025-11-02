import React from 'react';
import './SaveButton.css';

export default function SaveButton({ onClick }) {
  return (
    <button className="save-button" onClick={onClick}>
      <span className="icon">&#128190;</span> Save Changes
    </button>
  );
}
