import React from 'react';

const LandingScreen = ({ onScreenChange }) => {
  return (
    <div className="screen screen-0">
      <div className="landing-content">
        <h1>Welcome to CrisprBuilder</h1>
        <p>A tool for designing CRISPR experiments for Drosophila genes</p>
        
        <div className="landing-buttons">
          <button 
            className="landing-button"
            data-screen="1"
            onClick={onScreenChange}
          >
            Search for a Gene
          </button>
          
          <button 
            className="landing-button"
            data-screen="custom"
            onClick={onScreenChange}
          >
            Enter Custom Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
