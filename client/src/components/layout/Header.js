import React from 'react';

const Header = ({ themeColor, onThemeChange, onScreenChange, onOpenDesign, onSaveDesign, onFontMenuToggle }) => {
  return (
    <header className={`header ${themeColor ? 'dark' : 'light'}`}>
      <div className="logo">
        <img src={require('../../assets/head_logo.png')} alt="Logo" />
      </div>
      <div className="header-buttons">
        <button 
          className="header-button" 
          data-screen="1" 
          onClick={onScreenChange}
        >
          Home
        </button>
        <button 
          className="header-button" 
          onClick={onFontMenuToggle}
        >
          Font Size
        </button>
        <button 
          className="header-button" 
          onClick={onThemeChange}
        >
          {themeColor ? 'Light Mode' : 'Dark Mode'}
        </button>
        <label className="header-button file-input">
          Open Design
          <input 
            type="file" 
            onChange={onOpenDesign} 
            accept=".txt"
          />
        </label>
        <button 
          className="header-button" 
          onClick={onSaveDesign}
        >
          Save Design
        </button>
      </div>
    </header>
  );
};

export default Header;
