import React, { useState, useEffect } from 'react';

const Header = ({ 
  themeColor, 
  onThemeChange, 
  onScreenChange, 
  onOpenDesign, 
  onSaveDesign, 
  onFontMenuToggle,
  hamburger,
  toggleHamburgerMenu
}) => {
  const [showBugReport, setShowBugReport] = useState(false);

  useEffect(() => {
    if (showBugReport) {
      // Load the JotForm script
      const script = document.createElement('script');
      script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
      script.async = true;
      document.body.appendChild(script);

      // Initialize the form handler after the script is loaded
      script.onload = () => {
        if (window.jotformEmbedHandler) {
          window.jotformEmbedHandler("iframe[id='JotFormIFrame-250567387390163']", "https://form.jotform.com/");
        }
      };

      return () => {
        // Clean up the script when component unmounts or form is hidden
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showBugReport]);

  const toggleBugReport = (e) => {
    e.preventDefault();
    setShowBugReport(prev => !prev);
  };
  return (
    <header className={`header ${themeColor ? 'dark' : 'light'}`}>
      <div className="main-logo">
        <img src={require('../../assets/head_logo.png')} alt="Logo" />
      </div>
      
      <div className="menu" onClick={toggleHamburgerMenu}>
        <img src={require('../../assets/hamburger-menu.png')} alt="Menu" />
      </div>
      
      {hamburger && (
        <div className="main-menu">
          <div className="menu-item" data-screen="1" onClick={onScreenChange}>
            <div>Home</div>
          </div>
          <div className="menu-item" onClick={onFontMenuToggle}>
            <div className="font-size">
              <div className="small">A</div>
              <div className="large">A</div>
            </div>
            <div>Font Size</div>
          </div>
          <div className="menu-item" onClick={onThemeChange}>
            <div className={`theme-color ${themeColor ? 'dark' : ''}`}></div>
            <div>{themeColor ? 'Light Mode' : 'Dark Mode'}</div>
          </div>
          <div className="menu-item">
            <label className="file-input">
              <div>Open Design</div>
              <input 
                type="file" 
                onChange={onOpenDesign} 
                accept=".txt"
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div className="menu-item" onClick={onSaveDesign}>
            <div>Save Design</div>
          </div>
          <div className="menu-item">
            <a 
              href={require('../../assets/CrisprBuildr1.0_manual.pdf')} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div>User Manual</div>
            </a>
          </div>
          <div className="menu-item" onClick={toggleBugReport}>
            <div>Bug Report</div>
          </div>
          {showBugReport && (
            <div className="bug-report-container">
              <iframe
                id="JotFormIFrame-250567387390163"
                title="Bug Tracker"
                onLoad={() => window.parent.scrollTo(0, 0)}
                allowTransparency="true"
                allow="geolocation; microphone; camera; fullscreen"
                src="https://form.jotform.com/250567387390163"
                frameBorder="0"
                style={{ 
                  width: '100%', 
                  height: '539px', 
                  border: 'none',
                  background: '#fff'
                }}
                scrolling="no"
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
