import React from "react";
import "./EditInfoSection.css"; 

export default function PrivacyToggle({isChecked,onToggle,label = "Private Mode"}) {
  return (
    <div className="form-field">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <label className="switch">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggle}
          />
          <span className="slider"></span>
        </label>
        <span>{label}</span>
      </div>
    </div>
  );
}
