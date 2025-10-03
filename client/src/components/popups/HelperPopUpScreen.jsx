import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { clearPopup } from '../../features/appState/appStateSlicer';

const HelperPopUpScreen = () => {
    const question = useSelector((state) => state.appState.popup.question);
    const dispatch = useDispatch();
    return (
        <div className="popup-wrapper">
            <div className="popup upload-popup">
                <button className='close-btn' onClick={() => dispatch(clearPopup())}>X</button>
                <p className="popup-text helper-text">{question}</p>
              </div>
        </div>
    )
}

export default HelperPopUpScreen