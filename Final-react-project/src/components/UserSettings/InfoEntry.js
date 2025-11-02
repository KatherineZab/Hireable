import React from "react";
import "./InfoEntry.css";

export default function InfoEntry({
  name,
  startYear,
  endYear,
  nameLabel,
  startLabel,
  endLabel,
  nameField,
  onChange,
  onDelete,
  filterOptions 
}) {
  return (
    <div className="info-entry">
      {(nameField === "university" || nameField === "company") ? (
        <>
          <input
            list={nameField === "university" ? "universities" : "companies"}
            placeholder={nameLabel}
            value={name}
            onChange={(e) => onChange(nameField, e.target.value)}
          />
          <datalist id={nameField === "university" ? "universities" : "companies"}>
            {(nameField === "university"
              ? filterOptions?.University || [] 
              : filterOptions?.Company || []
            ).map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </>
      ) : (
        <input
          type="text"
          placeholder={nameLabel}
          value={name}
          onChange={(e) => onChange(nameField, e.target.value)}
        />
      )}

      <input
        type="number"
        placeholder={startLabel}
        value={startYear || ""}
        onChange={(e) => onChange("startYear", e.target.value)}
      />
      <input
        type="number"
        placeholder={endLabel}
        value={endYear || ""}
        onChange={(e) => onChange("endYear", e.target.value)}
      />
      <button className="infoentry-delete-button" onClick={onDelete}>✖️</button>
    </div>
  );
}
