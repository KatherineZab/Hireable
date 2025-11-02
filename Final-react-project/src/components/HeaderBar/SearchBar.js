import { useEffect, useState, useRef } from "react";
import axios from "axios";
import './SearchBar.css';
import { Link } from 'react-router-dom';
import FilterDropdown from './FilterDropdown';

function SearchBar() {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setFiltersVisible(false);
        setFilters({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/filter-options');
        setFilterOptions(res.data);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '' && Object.values(filters).every(val => !val || val === 'All')) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      setSearchLoading(true);

      axios.get('http://localhost:5000/api/users/search', {
        params: {
          q: searchText,
          ...filters
        }
      })
        .then(res => {
          setSearchResults(res.data);
        })
        .catch(err => {
          console.error('Search error:', err);
          setSearchResults([]);
        })
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchText, filters]);

  return (
    <div className="searchbar-dropdown" ref={searchRef}>
      <div className="searchbar-wrapper"> 
        <div className="search-bar-input-wrapper">
          <div className="search-bar-icon"></div>
          <input 
            type="text"
            value={searchText}
            onFocus={() => setDropdownOpen(true)}
            onChange={(e) => {
              setSearchText(e.target.value);
              setDropdownOpen(true);
            }}
            placeholder="Search here" 
            className="search-bar-input"
          />
        </div>

        <div className="filter-wrapper"> 
          <button onClick={() => setFiltersVisible(prev => !prev)} className="filter-button">
            <span className="filter-icon">≡</span>
            <span className="filter-text">Filter</span>
          </button>

          {filtersVisible && (
            <div className="filter-dropdown-overlay">
              <FilterDropdown
                filters={filters}
                setFilters={setFilters}
                filterOptions={filterOptions}
              />
            </div>
          )}
        </div>
      </div>

      {dropdownOpen && (searchText || Object.values(filters).some(val => val && val !== 'All')) && (
        <div className="searchbar-dropdown-content">
          {searchLoading ? (
            <div className="searchbar-dropdown-loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map(user => (
              <Link to={`/profile/${user.userId}`} key={user._id} className="searchbar-dropdown-item">
                {user.profilePicture && (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="searchbar-dropdown-avatar"
                  />
                )}
                <div>
                  <div className="searchbar-dropdown-name">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="searchbar-dropdown-email">
                    {user.email}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="searchbar-dropdown-empty">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
