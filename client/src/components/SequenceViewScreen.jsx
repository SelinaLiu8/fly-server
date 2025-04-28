import React from 'react';
import { useSelector } from 'react-redux';
import GeneSequence from './GeneSequence';
import '../styles/Sequence.css'

const SequenceViewScreen = () => {
  const screen = useSelector((state) => state.appState.screen);
  const sequenceData = useSelector((state) => state.appState.sequenceData);
  const highlights = useSelector((state) => state.appState.highlights);
  const currentHighlight = useSelector((state) => state.appState.currentHighlight);
  const fontSize = useSelector((state) => state.appState.fontSize);

  if (!sequenceData) {
    return <div>Loading sequence...</div>;
  }

  const { isoform, downstream, upstream ,sequence, strand } = sequenceData;

  console.log("Current Screen:", screen);

  return (
    <div className={`screen screen-${screen}`}>
      <div className="sequence-header">
        <h2>{isoform}</h2>
        {strand && <p>Strand: {strand}</p>}
      </div>

      <div className="sequence-container">
        <GeneSequence
          sequence={upstream + sequence + downstream}
          highlights={highlights}
          currentHighlight={currentHighlight}
          fontSize={fontSize}
        />
      </div>
    </div>
  );
};

export default SequenceViewScreen;
