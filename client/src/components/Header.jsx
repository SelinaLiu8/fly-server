import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleHamburger,
  toggleThemeColor,
  setScreen,
} from '../features/appState/appStateSlicer.js';

import headLogo from '../assets/head_logo.png';
import hamburgerIcon from '../assets/hamburger-menu.png';
import manualPDF from '../assets/CrisprBuildr1.0_manual.pdf';
import '../App.css'

const Header = ({ onOpenDesign, onSaveDesign, onFontMenuToggle }) => {
  const dispatch = useDispatch();
  const themeColor = useSelector((state) => state.appState.themeColor);
  const hamburger = useSelector((state) => state.appState.hamburger);

  const [showBugReport, setShowBugReport] = useState(false);

  useEffect(() => {
    if (showBugReport) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.jotformEmbedHandler) {
          window.jotformEmbedHandler(
            "iframe[id='JotFormIFrame-250567387390163']",
            "https://form.jotform.com/"
          );
        }
      };

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showBugReport]);

  const toggleBugReport = (e) => {
    e.preventDefault();
    setShowBugReport((prev) => !prev);
  };

  return (
    <header className={`header ${themeColor ? 'dark' : 'light'}`}>
      <div className="main-logo">
        <img src={headLogo} alt="Logo" />
      </div>

      <div className="menu" onClick={() => dispatch(toggleHamburger())}>
        <img src={hamburgerIcon} alt="Menu" />
      </div>

      {hamburger && (
        <div className="hamburger-menu">
          <div className="hamburger-item" onClick={() => dispatch(setScreen(1))}>
            <div>Home</div>
          </div>
          <div className="hamburger-item" onClick={onFontMenuToggle}>
            <div className="font-size">
              <div className="small">A</div>
              <div className="large">A</div>
            </div>
            <div>Font Size</div>
          </div>
          <div className="hamburger-item" onClick={() => dispatch(toggleThemeColor())}>
            <div className={`theme-color ${themeColor ? 'dark' : ''}`}></div>
            <div>{themeColor ? 'Light Mode' : 'Dark Mode'}</div>
          </div>
          <div className="hamburger-item">
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
          <div className="hamburger-item" onClick={onSaveDesign}>
            <div>Save Design</div>
          </div>
          <div className="hamburger-item">
            <a
              href={manualPDF}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div>User Manual</div>
            </a>
          </div>
          <div className="hamburger-item" onClick={toggleBugReport}>
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
                  background: '#fff',
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
