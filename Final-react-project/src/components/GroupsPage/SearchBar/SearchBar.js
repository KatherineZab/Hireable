import React from 'react';
import './SearchBar.css';

function SearchBar({ // מציגה רק יו איי של חיפוש כאשר כל הלוגיקה בdiscoverGroupSearch
    searchQuery, // הטקסט שבתוך תיבת החיפוש
    onSearchChange, // הפונקציה שמתבצעת 
    onSearch, 
    onKeyPress, // מחפש אירועים מהמקלדת 
    isSearching = false,// האם מחפש כעת 
    placeholder = "Search for groups"
}) {// הכל נשלט מבחוץ 
    return (
        <div className="search-input-container">
            <input
                type="text"
                className="group-search-input"
                placeholder={placeholder}
                value={searchQuery}
                onChange={onSearchChange}
                onKeyPress={onKeyPress}
            />
            <button 
                className="search-button"
                onClick={onSearch}
                disabled={isSearching}
            >
                {isSearching ? '🔄' : '🔍'}
            </button>
        </div>
    );
}

export default SearchBar;