import React from 'react';

const TargetList = ({
  targets,
  currentHighlightLocation,
  onPickCutSite,
  onPickDeleteCutSite,
  onHighlightString,
  onClearHighlight,
  operation
}) => {
  // Debug logs
  console.log('TargetList rendered with:', {
    targetsCount: targets ? targets.length : 0,
    targets,
    currentHighlightLocation,
    operation
  });
  
  if (!targets || targets.length === 0) {
    console.log('TargetList: No targets available');
    return <div className="target-list-empty">No targets available</div>;
  }

  const handleMouseEnter = (target) => {
    const targetSequence = target.distal + target.proximal;
    onHighlightString(targetSequence);
  };

  const handleMouseLeave = () => {
    onClearHighlight();
  };

  const handleClick = (target) => {
    if (operation === 'delete') {
      onPickDeleteCutSite(target);
    } else {
      onPickCutSite(target);
    }
  };

  // Add a ref to the target list element
  const targetListRef = React.useRef(null);
  
  // Log the computed style of the target list element after it's rendered
  React.useEffect(() => {
    if (targetListRef.current) {
      const computedStyle = window.getComputedStyle(targetListRef.current);
      console.log('Final TargetList computed style:', computedStyle.display);
    }
  }, [targets]);
  
  return (
    <div className="target-list" ref={targetListRef}>
      <h3>Available Targets</h3>
      <div className="target-list-items">
        {targets.map((target, index) => (
          <div
            key={index}
            className={`target-item ${currentHighlightLocation === target.location ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(target)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(target)}
          >
            <div className="target-sequence">
              {target.distal && target.proximal ? (
                <>
                  <span className="target-distal">{target.distal}</span>
                  <span className="target-proximal">{target.proximal}</span>
                </>
              ) : (
                <span>{target.sequence || 'N/A'}</span>
              )}
            </div>
            <div className="target-details">
              <div className="target-efficiency">Efficiency: {target.score || 'N/A'}</div>
              <div className="target-strand">Strand: {target.strand || 'N/A'}</div>
              <div className="target-offset">Offset: {target.offset || 'N/A'}</div>
              {operation === 'delete' && (
                <div className="target-terminal">Terminal: {target.terminalType}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetList;
