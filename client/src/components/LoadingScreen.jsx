import React from 'react'
import { useSelector } from 'react-redux';

const LoadingScreen = () => {
    const loadingMessage = useSelector((state) => state.appState.loadingMessage);
  
    return (
      <div className="popup-wrapper">
        <div className="popup">
          <div className="popup-message">
            {loadingMessage || 'Loading...'}
          </div>
        </div>
      </div>
    );
  };

export default LoadingScreen;