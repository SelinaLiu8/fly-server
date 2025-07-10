import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearPopup } from '../features/appState/appStateSlicer';
import '../styles/PopUp.css'

const QuestionPopup = () => {
    const dispatch = useDispatch();
    const { question, choices, onSelect } = useSelector((state) => state.appState.popup);
  
    const [fadeClass, setFadeClass] = useState('fade-in');
    const [selectedChoice, setSelectedChoice] = useState(null);
  
    const handleSubmit = () => {
      if (selectedChoice && onSelect) {
        setFadeClass('fade-out');
        setTimeout(() => {
            onSelect(selectedChoice); // Run the real selection AFTER fade out
        }, 300);
        onSelect(selectedChoice);
      }
    };

    useEffect(() => {
        console.log("useeffect used");
        setSelectedChoice(null);
        setFadeClass('fade-in'); // When popup first opens
    }, [question]);

    const handleSelect = (choice) => {
        setSelectedChoice(choice);
        popup.onSelect && popup.onSelect(choice);
    };
  
    return (
      <div className="popup-wrapper">
        <div className="popup">
          <h4 className='popup-title'>{question}</h4>
          <div className="popup-choices">
            <select
              className="popup-select"
              value={selectedChoice ? selectedChoice.label : ''}
              onChange={(e) => {
                const selected = choices.find(choice => choice.label === e.target.value);
                setSelectedChoice(selected || null);
              }}
            >
              <option value="">Select an option...</option>
              {choices.map((choice, index) => (
                <option key={index} value={choice.label}>
                  {choice.label}
                </option>
              ))}
            </select>

            <button
              className="popup-btn"
              onClick={handleSubmit}
              disabled={!selectedChoice}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
};

export default QuestionPopup;
