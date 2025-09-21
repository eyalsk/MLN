import React, { useState } from 'react';
import './CustomInput.css';

export default function CustomInput({ className = '', placeholder, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    e.target.select();
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`custom-input-container ${isFocused ? 'focused' : ''}`}>
      {placeholder && <label className="custom-input-legend">{placeholder}</label>}
      <input
        {...props} // Spread all props to inherit regular input attributes
        className={`custom-input ${className}`}
        onFocus={(e) => {
          handleFocus(e);
          props.onFocus?.(e); // Call parent onFocus if provided
        }}
        onBlur={(e) => {
          handleBlur(e);
          props.onBlur?.(e); // Call parent onBlur if provided
        }}
      />
    </div>
  );
}