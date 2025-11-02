// components/profile/AboutSection.js
import React from "react";
import "./AboutSection.css";

export default function AboutSection({ userInfo }) {
  if (!userInfo) return null;

  const {
    about,
    gender,
    experienceLevel,
    location,
    birthDate,
    education,
    experience
  } = userInfo;

  return (
    <div className="about-container">
      <h2>INFORMATION</h2>

      <div className="about-grid">
        <div>
          <h4>Professional Info</h4>
            <p>
            <strong>ExperienceLevel:</strong>{" "}
            <span className="about-text">{experienceLevel || "—"}</span>
            </p>
            <p>
            <strong>About:</strong>{" "}
            <span className="about-text">{about || "—"}</span>
            </p>
        </div>

        <div>
          <h4>Personal Info</h4>
          <p><strong>Gender:</strong> {gender || "—"}</p>
          <p><strong>Birth Date:</strong> {birthDate ? new Date(birthDate).toLocaleDateString() : "—"}</p>
          <p><strong>Location:</strong> {location?.city}, {location?.country}</p>
        </div>
      </div>

      <div className="about-lists">
        <div>
          <h4>Education</h4>
          {education && education.length > 0 ? (
            <ul>
              {education.map((edu, idx) => (
                <li key={idx}>
                  {edu.university} ({edu.startYear} - {edu.endYear})
                </li>
              ))}
            </ul>
          ) : <p>—</p>}
        </div>

        <div>
          <h4>Experience</h4>
          {experience && experience.length > 0 ? (
            <ul>
              {experience.map((exp, idx) => (
                <li key={idx}>
                  {exp.company} ({exp.startYear} - {exp.endYear})
                </li>
              ))}
            </ul>
          ) : <p>—</p>}
        </div>
      </div>
    </div>
  );
}
