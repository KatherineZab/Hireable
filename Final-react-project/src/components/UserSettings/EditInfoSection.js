import React, { useState, useEffect } from "react";
import "./EditInfoSection.css";
import CancelButton from './CancelButton';
import SaveButton from './SaveButton';
import InfoEntry from './InfoEntry';

function isValidDate(year, month, day) {
  const y = parseInt(year);
  const m = parseInt(month) - 1; 
  const d = parseInt(day);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  if (y < 1925) return false;
  const date = new Date(y, m, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m &&
    date.getDate() === d
  );
}

export default function EditInfoSection({ onSave, userInfo, onCancel }) {
  const [educationEntries, setEducationEntries] = useState([]);
  const [experienceEntries, setExperienceEntries] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState("");
  const [gender, setGender] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  let birthDate = null;
  const hasBirthDateInput = birthYear || birthMonth || birthDay;
  const [filterOptions, setFilterOptions] = useState({ City: [], Company: [], University: [], experienceLevel: [] });

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/filter-options');
      const data = await res.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const sendNewFilterValue = async (category, value) => {
    if (
      value &&
      value.trim() &&
      filterOptions[category] &&
      !filterOptions[category].includes(value)
    ) {
      try {
        await fetch('http://localhost:5000/api/filter-options/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, value })
        });
      } catch (err) {
        console.error(`Failed to add new ${category}:`, err);
      }
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.first_name || "");
      setLastName(userInfo.last_name || "");
      setExperienceLevel(userInfo.experienceLevel || "");
      setHeadline(userInfo.headline || "");
      setAbout(userInfo.about || "");
      setGender(userInfo.gender || "");
      setEducationEntries(userInfo.education || []);
      setExperienceEntries(userInfo.experience || []);

      if (userInfo.location) {
        setCity(userInfo.location.city || '');
        setCountry(userInfo.location.country || '');
      }
      if (userInfo.birthDate) {
        const date = new Date(userInfo.birthDate);
        setBirthDay(String(date.getDate()).padStart(2, '0'));
        setBirthMonth(String(date.getMonth() + 1).padStart(2, '0'));
        setBirthYear(String(date.getFullYear()));
      }
    }
  }, [userInfo]);

  return (
    <div className="edit-info-box">
      <h2>Edit Your Information</h2>
      <div className="form-grid">
        <div className="form-field">
          <label>First Name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="your first name" />
        </div>
        <div className="form-field">
          <label>Last Name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="your last name" />
        </div>
        <div className="form-field">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="form-field full-width">
          <input type="text" placeholder="e.g., Software Engineer at TechCorp" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={120} />
          <small>{headline.length}/120 characters</small>
        </div>
        <div className="form-field full-width">
          <label>About</label>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Write a brief summary about your professional background and interests..." maxLength={500} />
          <small>{about.length}/500 characters</small>
        </div>

        <div className="form-field">
          <label>Date of Birth</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="number" placeholder="Day" min="1" max="31" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} />
            <input type="number" placeholder="Month" min="1" max="12" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} />
            <input type="number" placeholder="Year" min="1900" max={new Date().getFullYear()} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
          </div>
        </div>

        <div className="form-field">
          <label>Experience Level</label>
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
            <option value="">Select Level</option>
            {filterOptions.experienceLevel.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Location</label>
          <input list="cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          <datalist id="cities">
            {filterOptions.City.map((cityOption) => (
              <option key={cityOption} value={cityOption} />
            ))}
          </datalist>
          <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>

        <div className="form-field full-width">
          <label>Education</label>
          {educationEntries.map((entry, index) => (
            <InfoEntry key={index} name={entry.university} startYear={entry.startYear} endYear={entry.endYear} nameLabel="University" startLabel="Start Year" endLabel="End Year" nameField="university" filterOptions={filterOptions} onChange={(field, value) => {
              const updated = [...educationEntries];
              updated[index] = { ...updated[index], [field]: value };
              setEducationEntries(updated);
            }} onDelete={() => {
              const updated = [...educationEntries];
              updated.splice(index, 1);
              setEducationEntries(updated);
            }} />
          ))}
          <button onClick={() => setEducationEntries([...educationEntries, { university: "", startYear: "", endYear: "" }])} className="add-entry-btn">+ Add Education</button>
        </div>

        <div className="form-field full-width">
          <label>Experience</label>
          {experienceEntries.map((entry, index) => (
            <InfoEntry key={index} name={entry.company} startYear={entry.startYear} endYear={entry.endYear} nameLabel="Company Name" startLabel="Start Year" endLabel="End Year" nameField="company" filterOptions={filterOptions} onChange={(field, value) => {
              const updated = [...experienceEntries];
              updated[index] = { ...updated[index], [field]: value };
              setExperienceEntries(updated);
            }} onDelete={() => {
              const updated = [...experienceEntries];
              updated.splice(index, 1);
              setExperienceEntries(updated);
            }} />
          ))}
          <button onClick={() => setExperienceEntries([...experienceEntries, { company: "", startYear: "", endYear: "" }])} className="add-entry-btn">+ Add Experience</button>
        </div>
      </div>

      <hr className="divider" />
      <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <CancelButton onClick={onCancel} />
        <SaveButton onClick={async () => {
          if (hasBirthDateInput) {
            if (!isValidDate(birthYear, birthMonth, birthDay)) {
              alert("Please enter a valid birth date");
              return;
            }
            birthDate = new Date(`${birthYear.padStart(4, '0')}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`);
          }

          if (city && !filterOptions.City.includes(city) && city.trim()) {
            await sendNewFilterValue("City", city);
          }

          for (const entry of educationEntries) {
            const university = entry.university?.trim();
            if (university && !filterOptions.University.includes(university)) {
              await sendNewFilterValue("University", university);
            }
          }

          for (const entry of experienceEntries) {
            const company = entry.company?.trim();
            if (company && !filterOptions.Company.includes(company)) {
              await sendNewFilterValue("Company", company);
            }
          }

          if (experienceLevel && !filterOptions.experienceLevel.includes(experienceLevel) && experienceLevel.trim()) {
            await sendNewFilterValue("experienceLevel", experienceLevel);
          }

          await fetchFilterOptions();

          onSave({
            first_name: firstName,
            last_name: lastName,
            experienceLevel,
            headline,
            gender,
            about,
            birthDate,
            location: {
              city: city ? city.trim() : "",
              country
            },
            experience: experienceEntries.map(entry => ({
              ...entry,
              company: entry.company ? entry.company.trim() : ""
            })),
            education: educationEntries.map(entry => ({
              ...entry,
              university: entry.university ? entry.university.trim() : ""
            }))
          });
        }} />
      </div>
    </div>
  );
}
