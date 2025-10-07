import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleHamburger,
  toggleThemeColor,
  setScreen,
  setPopup
} from '../features/appState/appStateSlicer.js';

import headLogo from '../assets/head_logo.png';
import hamburgerIcon from '../assets/hamburger-menu.png';
import manualPDF from '../assets/CrisprBuildr1.0_manual.pdf';
import '../App.css'

const Header = ({ onOpenDesign, onSaveDesign, onFontMenuToggle }) => {
  const dispatch = useDispatch();
  const themeColor = useSelector((state) => state.appState.themeColor);
  const hamburger = useSelector((state) => state.appState.hamburger);

  const citationText = `Flybase: https://flybase.org/
  flyCRISPR: https://flycrispr.org/
  FlyCRISPR TargetFinder: http://targetfinder.flycrispr.neuro.brown.edu/
  FlyRNAi Evaluate CRISPR Tool: https://www.flyrnai.org/evaluateCrispr/
  Primer3: https://primer3.ut.ee/
  
  How to cite CrisprBuildr:
  ...TBD...`;

  // const [showBugReport, setShowBugReport] = useState(false);

  // useEffect(() => {
  //   if (showBugReport) {
  //     const script = document.createElement('script');
  //     script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
  //     script.async = true;
  //     document.body.appendChild(script);

  //     script.onload = () => {
  //       if (window.jotformEmbedHandler) {
  //         window.jotformEmbedHandler(
  //           "iframe[id='JotFormIFrame-250567387390163']",
  //           "https://form.jotform.com/"
  //         );
  //       }
  //     };

  //     return () => {
  //       if (document.body.contains(script)) {
  //         document.body.removeChild(script);
  //       }
  //     };
  //   }
  // }, [showBugReport]);

  // const toggleBugReport = (e) => {
  //   e.preventDefault();
  //   setShowBugReport((prev) => !prev);
  // };

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
            <div className='hamburger-title'>Home</div>
          </div>
          <div className="hamburger-item" onClick={onFontMenuToggle}>
            <div className="font-size">
              <div className="small">A</div>
              <div className="large">A</div>
            </div>
            <div className='hamburger-title'>Font Size</div>
          </div>
          <div className="hamburger-item" onClick={() => dispatch(toggleThemeColor())}>
            <div className={`theme-color ${themeColor ? 'dark' : ''}`}></div>
            <div>{themeColor ? 'Light Mode' : 'Dark Mode'}</div>
          </div>
          <div className="hamburger-item">
            <a
              href={manualPDF}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className='hamburger-title'>User Manual</div>
            </a>
          </div>
          <div className="hamburger-item">
            <a
              href="https://www.biorxiv.org/content/10.1101/2025.02.28.640916v1"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className='hamburger-title'>Manual Script</div>
            </a>
          </div>
          <div className="hamburger-item"
          onClick={() => dispatch(setPopup({
            type: 'helper',
            question: citationText,
            stayOpen: true
            }))}>
            <div className='hamburger-title'>Citation</div>
          </div>
          <div className="hamburger-item" 
          onClick={() => dispatch(setPopup({
            type: 'bug',
            stayOpen: true
          }))}
          >
            <div className='hamburger-title'>Bug Report</div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
