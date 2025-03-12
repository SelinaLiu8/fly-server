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
  if (!targets || targets.length === 0) {
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

  return (
    <div className="target-list">
      <h3>Available Targets</h3>
      <div className="target-list-header">
        <span className="target-score">Score</span>
        <span className="target-sequence">Target Sequence</span>
        <span className="target-pam">PAM</span>
        {operation === 'delete' && (
          <span className="target-terminal">Terminal</span>
        )}
      </div>
      <div className="target-list-items">
        {targets.map((target, index) => (
          <div
            key={index}
            className={`target-item ${currentHighlightLocation === target.location ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(target)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(target)}
          >
            <span className="target-score">{target.score || 'N/A'}</span>
            <span className="target-sequence">{target.distal}{target.proximal}</span>
            <span className="target-pam">{target.pam}</span>
            {operation === 'delete' && (
              <span className="target-terminal">{target.terminalType}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetList;
