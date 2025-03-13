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
    <div className="popup-wrapper">
      <div className="popup">
        {popup.image && (
          <div className="popup-image">
            <img src={popup.image} alt="Popup" />
          </div>
        )}
        <div>
          {popup.message}
        </div>
        {!popup.stayOpen && (
          <div className="popup-close" onClick={onClose}>
            Close
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
