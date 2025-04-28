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
        setFadeClass('fade-in'); // When popup first opens
    }, [question]);
  
    return (
      <div className="popup-wrapper">
        <div className="popup">
          <h2>{question}</h2>
  
          <div className="popup-choices">
            <select onChange={(e) => {
              const selected = choices.find(choice => choice.label === e.target.value);
              setSelectedChoice(selected);
            }}>
              <option value="">Select an option...</option>
              {choices.map((choice, index) => (
                <option key={index} value={choice.label}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
  
          <button onClick={handleSubmit} disabled={!selectedChoice}>
            Confirm
          </button>
        </div>
      </div>
    );
};

export default QuestionPopup;
