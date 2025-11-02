import { useState, useEffect, useRef } from 'react';

import './AllPosts.css';


export default function PostFilter({ filters, onFilterChange, searchQueries, onSearchChange, isAdmin, onClearFilters }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const activeFiltersCount = Object.values(filters).filter(Boolean).length;
    const hasActiveSearches = Object.values(searchQueries).some(query => query.trim());

    return (
        <div className="post-filter-container">
            <div className="filter-header">
                <h3>Filter Posts</h3>
                <div className="filter-controls">
                    {(activeFiltersCount > 0 || hasActiveSearches) && (
                        <button 
                            onClick={onClearFilters}
                            className="clear-filters-btn"
                        >
                            Clear All
                        </button>
                    )}
                    <div className="filter-dropdown" ref={dropdownRef}>
                        <button 
                            className={`filter-toggle-btn ${isDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="filter-badge">{activeFiltersCount}</span>
                            )}
                            <span className="dropdown-arrow">▼</span>
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="filter-dropdown-content">
                                <div className="filter-section">
                                    <h4>User Information</h4>
                                    <div className="filter-options">
                                        <label className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={filters.byFirstName}
                                                onChange={(e) => onFilterChange('byFirstName', e.target.checked)}
                                            />
                                            <span>First Name</span>
                                        </label>
                                        
                                        <label className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={filters.byLastName}
                                                onChange={(e) => onFilterChange('byLastName', e.target.checked)}
                                            />
                                            <span>Last Name</span>
                                        </label>
                                        
                                        <label className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={filters.byContent}
                                                onChange={(e) => onFilterChange('byContent', e.target.checked)}
                                            />
                                            <span>Post Content</span>
                                        </label>
                                    </div>
                                </div>
                                
                                {isAdmin && (
                                    <div className="filter-section">
                                        <h4>Admin Filters</h4>
                                        <div className="filter-options">
                                            <label className="filter-option">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.byEdited}
                                                    onChange={(e) => onFilterChange('byEdited', e.target.checked)}
                                                />
                                                <span>Edited Posts Only</span>
                                            </label>
                                            
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Search inputs for active filters */}
            {activeFiltersCount > 0 && (
                <div className="search-inputs">
                    {filters.byFirstName && (
                        <div className="search-input-group">
                            <label>First Name:</label>
                            <input
                                type="text"
                                placeholder="Enter first name..."
                                value={searchQueries.byFirstName}
                                onChange={(e) => onSearchChange('byFirstName', e.target.value)}
                                className="filter-search-input"
                            />
                        </div>
                    )}
                    
                    {filters.byLastName && (
                        <div className="search-input-group">
                            <label>Last Name:</label>
                            <input
                                type="text"
                                placeholder="Enter last name..."
                                value={searchQueries.byLastName}
                                onChange={(e) => onSearchChange('byLastName', e.target.value)}
                                className="filter-search-input"
                            />
                        </div>
                    )}
                    
                    {filters.byContent && (
                        <div className="search-input-group">
                            <label>Post Content:</label>
                            <input
                                type="text"
                                placeholder="Enter content to search..."
                                value={searchQueries.byContent}
                                onChange={(e) => onSearchChange('byContent', e.target.value)}
                                className="filter-search-input"
                            />
                        </div>
                    )}
                    
            
                    
                    {filters.byEdited && isAdmin && (
                        <div className="search-input-group">
                            <div className="filter-info">
                                <span>📝 Showing only edited posts</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

