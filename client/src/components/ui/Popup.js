import React, { useEffect } from 'react';

const Popup = ({ popup, onClose }) => {
  useEffect(() => {
    if (!popup.stayOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [popup, onClose]);

  if (!popup.show) {
    return null;
  }

  return (
    <div className="popup-container">
      <div className="popup">
        {popup.image && (
          <div className="popup-image">
            <img src={popup.image} alt="Popup" />
          </div>
        )}
        <div className="popup-message">
          {popup.message}
        </div>
        {!popup.stayOpen && (
          <button className="popup-close" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default Popup;
