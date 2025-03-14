import React from 'react';
import GeneSequence from '../ui/GeneSequence';
import './SequenceViewScreen.css';

const SequenceViewScreen = ({
  screen,
  geneName,
  isoForm,
  isoFormStrand,
  sequence,
  highlights,
  currentHighlight,
  fontSize,
  onSelectStartCodon,
  onSelectStopCodon
}) => {
  // Only render if screen is 2, 3, 4, or 'custom-2'
  if (![2, 3, 4, 'custom-2'].includes(screen)) {
    return null;
  }

  return (
    <div className={`screen screen-${screen}`}>
      <div className="sequence-header">
        <h2>{geneName} - {isoForm}</h2>
        {isoFormStrand && (
          <p>Strand: {isoFormStrand}</p>
        )}
      </div>
      
      <div className="sequence-container">
        <GeneSequence
          sequence={sequence}
          highlights={highlights}
          currentHighlight={currentHighlight}
          fontSize={fontSize}
          onSelectStartCodon={onSelectStartCodon}
          onSelectStopCodon={onSelectStopCodon}
        />
      </div>
    </div>
  );
};

export default SequenceViewScreen;
