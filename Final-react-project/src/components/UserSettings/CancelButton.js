import React from 'react';
import './CancelButton.css';

export default function CancelButton({ onClick }) {
  return (
    <button className="cancel-button" onClick={onClick}>
      <span className="icon">&#10005;</span> Cancel
    </button>
  );
}
