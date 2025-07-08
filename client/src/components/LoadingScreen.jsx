import React from 'react'
import { useSelector } from 'react-redux';
import Loading from '../assets/loading.png'

const LoadingScreen = () => {
    const loadingMessage = useSelector((state) => state.appState.loadingMessage);
  
    return (
      <div className="loading-container">
        <div className='loading-box'>
          <img className='loading-img' src={Loading} alt="loading image" />
          <h4 className='loading-message'>{loadingMessage || 'Loading...'}</h4>
        </div>
      </div>
    );
  };

export default LoadingScreen;