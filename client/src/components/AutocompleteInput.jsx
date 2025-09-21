import React, { useState, useEffect } from 'react';
import './AutocompleteInput.css';

export default function AutocompleteInput({ options, value, onChange, placeholder, onNew }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const selectedOption = options.find((option) => option.value === inputValue);
    if (!selectedOption) {
      setInputValue('');
      onChange(null);
    }
  }, [options, inputValue]);

  const handleOptionClick = (option) => {
    onChange(option);
    setInputValue(option.value);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const selectedOption = options.find((option) => option.value === inputValue);
    if (!selectedOption && inputValue.trim() !== '') {
      onNew(inputValue);
    }
  };

  const handleFocus = (e) => {
    e.target.select();
    setIsFocused(true);
  };

  const filteredOptions = options.filter((option) =>
    option.value.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={`autocomplete-container ${isFocused ? 'focused' : ''}`}>
      <label className="autocomplete-label">{placeholder}</label>
      <div className="autocomplete-input-wrapper" onClick={toggleDropdown}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="autocomplete-input"
        />
        <span className="dropdown-icon">{isDropdownOpen ? '▲' : '▼'}</span>
      </div>
      {isDropdownOpen && (
        <ul className="autocomplete-dropdown">
          {filteredOptions.map((option, index) => (
            <li
              key={option.key}
              className={`autocomplete-option ${index !== filteredOptions.length - 1 ? 'bordered' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {option.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
