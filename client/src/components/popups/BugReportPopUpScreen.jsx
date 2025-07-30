import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { clearPopup } from '../../features/appState/appStateSlicer';

const BugReportPopUpScreen = () => {

    const dispatch = useDispatch()

    // useEffect(() => {
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
    //       document.body.removeChild(script);
    //     };
    // }, []);
    
    return (
        <div className="popup-wrapper">
          <div className="popup bug-popup">
            <button className="close-btn" onClick={() => dispatch(clearPopup())}>X</button>
            <iframe
              id="JotFormIFrame-250567387390163"
              title="Bug Tracker"
              allowTransparency="true"
              allow="geolocation; microphone; camera; fullscreen"
              src="https://form.jotform.com/250567387390163"
              scrolling="yes"
              frameBorder="0"
              style={{
                width: '100%',
                height: '539px',
                border: 'none',
                background: '#fff',
              }}
            />
          </div>
        </div>
    );
}

export default BugReportPopUpScreen