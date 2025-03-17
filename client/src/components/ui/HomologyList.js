import React from 'react';

const HomologyList = ({
  primers,
  terminal,
  selectedArms,
  onSelectHomologyArm,
  onSelectDeleteHomologyArm,
  onHighlightString,
  onClearHighlight,
  operation,
  targets
}) => {
  console.log('HomologyList - primers:', primers, 'terminal:', terminal, 'operation:', operation);
  console.log('HomologyList - primers keys:', primers ? Object.keys(primers) : 'no primers');
  
  if (!primers || Object.keys(primers).length === 0) {
    return <div className="homology-list-empty">No primers available</div>;
  }

  const handleMouseEnter = (primer) => {
    onHighlightString(primer[7]);
  };

  const handleMouseLeave = () => {
    onClearHighlight();
  };

  const handleClick = (primer, arm, terminalType = null) => {
    if (operation === 'delete') {
      onSelectDeleteHomologyArm(primer, arm, terminalType);
    } else {
      // The saveCurrentHighlight parameter is handled inside the onSelectHomologyArm function in App.js
      onSelectHomologyArm(primer, arm);
    }
  };

  const renderPrimerSection = (title, primers, arm, terminalType = null) => {
    console.log(`renderPrimerSection - title: ${title}, arm: ${arm}, terminalType: ${terminalType}, primers:`, primers);
    
    // Check if primers is undefined or not an array
    if (!primers || !Array.isArray(primers)) {
      console.error(`Invalid primers for ${title}: ${primers}`);
      return (
        <div className="primer-section">
          <h4>{title}</h4>
          <div className="primer-error">No valid primers available for this section</div>
        </div>
      );
    }
    
    return (
      <div className="primer-section">
        <h4>{title}</h4>
        <div className="primer-list">
          {primers.map((primer, index) => {
            console.log(`Primer ${index}:`, primer);
            const isSelected = operation === 'delete'
              ? selectedArms[`${arm}_${terminalType}`] === primer
              : selectedArms[arm] === primer;
            
            // Check if primer has the expected structure
            if (!primer || !Array.isArray(primer) || primer.length < 8) {
              console.error(`Invalid primer structure at index ${index}:`, primer);
              return (
                <div key={index} className="primer-error">
                  Invalid primer data
                </div>
              );
            }
            
            return (
              <div
                key={index}
                className={`primer-item ${isSelected ? 'selected' : ''}`}
                onMouseEnter={() => handleMouseEnter(primer)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(primer, arm, terminalType)}
              >
                <div className="primer-sequence">{primer[7]}</div>
                <div className="primer-details">
                  <div>Tm: {primer[3]}</div>
                  <div>GC%: {primer[4]}</div>
                  <div>Any (Self Complementarity): {primer[5]}</div>
                  <div>3' (Self Complementarity): {primer[6]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (operation === 'delete') {
    // For delete operation, we have N and C terminal primers
    return (
      <div className="homology-list">
        <h3>Homology Arms</h3>
        
        <div className="terminal-section">
          <h3>N-Terminal</h3>
          {renderPrimerSection("5' Homology Arm Primers", primers.hom5_N, 'hom5', 'N')}
          {renderPrimerSection("3' Homology Arm Primers", primers.hom3_N, 'hom3', 'N')}
          {renderPrimerSection("5' Sequencing Primers", primers.seq5_N, 'seq5', 'N')}
          {renderPrimerSection("3' Sequencing Primers", primers.seq3_N, 'seq3', 'N')}
        </div>
        
        <div className="terminal-section">
          <h3>C-Terminal</h3>
          {renderPrimerSection("5' Homology Arm Primers", primers.hom5_C, 'hom5', 'C')}
          {renderPrimerSection("3' Homology Arm Primers", primers.hom3_C, 'hom3', 'C')}
          {renderPrimerSection("5' Sequencing Primers", primers.seq5_C, 'seq5', 'C')}
          {renderPrimerSection("3' Sequencing Primers", primers.seq3_C, 'seq3', 'C')}
        </div>
      </div>
    );
  }

  // For tag operation, we have a single terminal's primers
  return (
    <div className="homology-list">
      <h3>Homology Arms for {terminal === 'n' ? 'N' : 'C'}-Terminal</h3>
      {renderPrimerSection("5' Homology Arm Primers", primers.hom5, 'hom5')}
      {renderPrimerSection("3' Homology Arm Primers", primers.hom3, 'hom3')}
      {renderPrimerSection("5' Sequencing Primers", primers.seq5, 'seq5')}
      {renderPrimerSection("3' Sequencing Primers", primers.seq3, 'seq3')}
    </div>
  );
};

export default HomologyList;
