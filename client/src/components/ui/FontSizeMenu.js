import React from 'react';

const FontSizeMenu = ({ isOpen, fontSize, onFontSizeChange, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="font-size-menu">
      <div className="font-size-menu-content">
        <h3>Font Size</h3>
        <div className="font-size-slider">
          <input
            type="range"
            min="10"
            max="40"
            value={fontSize}
            onChange={onFontSizeChange}
          />
          <span>{fontSize}px</span>
        </div>
        <button className="font-size-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default FontSizeMenu;
