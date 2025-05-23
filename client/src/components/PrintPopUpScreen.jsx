import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { handlePrint } from '../utilities/Utilities'
import { clearPopup } from '../features/appState/appStateSlicer'
import '../styles/PopUp.css'

const PrintPopUpScreen = () => {
    const operation = useSelector((state) => state.appState.operation);
    const terminal = useSelector((state) => state.appState.terminal);
    const selectedPrimers = useSelector((state) => state.appState.selectedPrimers);
    const selectedTargets = useSelector((state) => state.appState.selectedTargets);
    const oligos = useSelector((state) => state.appState.oligos);

    const primerNameMap = {
        hom5: `forward homology arm primer`,
        hom3: `reverse homology arm primer`,
        seq5: `forward sequencing primer`,
        seq3: `reverse sequencing primer`,
    };

    const renderPrimer = (label, primer) => (
        <div key={label}>
          <div><b>{label}</b></div>
          <div>
            <div>{primer[7]}</div>
            <div>Tm: {primer[3]}</div>
            <div>GC%: {primer[4]}</div>
            <div>Any (Self Complementarity): {primer[5]}</div>
            <div>3′ (Self Complementarity): {primer[6]}</div>
          </div>
          <br />
        </div>
    );

    const generatePrimerHTML = (terminalType, primers = {}) => {
        const upperTerminal = terminalType.toUpperCase();
    
        return Object.entries(primers).map(([key, primer]) => {
            const label = `${upperTerminal} ${primerNameMap[key]}`;
            return renderPrimer(label, primer);
        });
    };

    const renderTargetInfo = (terminalKey) => {
        const target = selectedTargets[terminalKey];
        if (!target) return null;
    
        return (
          <div key={`target-${terminalKey}`}>
            <h5 className="print-subsubtitle">{terminalKey.toUpperCase()} Terminal</h5>
            <div><b>Distal:</b> {target.distal || 'N/A'}</div>
            <div><b>Proximal:</b> {target.proximal || 'N/A'}</div>
            <div><b>PAM:</b> {target.pam || 'N/A'}</div>
            <br />
          </div>
        );
    };
    
    const renderOligoInfo = (terminalKey) => {
        const oligo = oligos?.[terminalKey];
        if (!oligo) return null;
    
        return (
          <div key={`oligo-${terminalKey}`}>
            <h5 className="print-subsubtitle">{terminalKey.toUpperCase()} Terminal</h5>
            <div><b>Sense:</b> {oligo.sense || 'N/A'}</div>
            <div><b>Antisense:</b> {oligo.antisense || 'N/A'}</div>
            <br />
          </div>
        );
    };
    
    const showN = operation === 'delete' || terminal === 'n';
    const showC = operation === 'delete' || terminal === 'c';

    return (
        <div className="print-container popup-wrapper" id="printableArea">
          <h2 className="print-title">Design Info</h2>
    
          {/* Target Info */}
          <div className="print-item">
            <h4 className="print-subtitle">Target Info</h4>
            {showN && renderTargetInfo('n')}
            {showC && renderTargetInfo('c')}
          </div>
    
          {/* Homology Info */}
          <div className="print-item">
            <h4 className="print-subtitle">Homology Info</h4>
            {showN && (
              <>
                <h5 className="print-subsubtitle">N Terminal</h5>
                {generatePrimerHTML('n', selectedPrimers.n)}
              </>
            )}
            {showC && (
              <>
                <h5 className="print-subsubtitle">C Terminal</h5>
                {generatePrimerHTML('c', selectedPrimers.c)}
              </>
            )}
          </div>
    
          {/* Oligo Info */}
          <div className="print-item">
            <h4 className="print-subtitle">Oligo Info</h4>
            {showN && renderOligoInfo('n')}
            {showC && renderOligoInfo('c')}
          </div>
    
          {/* Buttons */}
          <div className="popup-actions">
            <button className="btn" onClick={handlePrint}>Print</button>
            <button className="btn" onClick={() => dispatch(clearPopup())}>Close</button>
          </div>
        </div>
    );
}

export default PrintPopUpScreen