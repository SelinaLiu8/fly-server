import React from 'react';
import '../styles/Sequence.css';
import { getHighlightClass } from '../utilities/highlightUtils';

const GeneSequence = ({
  sequence,
  highlights = {},
  currentHighlight = null,
  fontSize = 16,
  onSelectStartCodon,
  onSelectStopCodon,
}) => {
  if (!sequence) return <div className="gene-sequence-empty">No sequence available</div>;

  // Merge currentHighlight into the static highlights
  const combinedHighlights = { ...highlights };
  if (currentHighlight) combinedHighlights.hover = currentHighlight;

  // Build a map of character positions to highlight keys
  const highlightMap = {};
  for (const [key, { location, length }] of Object.entries(combinedHighlights)) {
    for (let i = location; i < location + length; i++) {
      if (!highlightMap[i]) highlightMap[i] = [];
      highlightMap[i].push({ key });
    }
  }

  const result = [];
  for (let i = 0; i < sequence.length; i++) {
    const char = sequence[i];
    const highlightsAtI = highlightMap[i];

    if (highlightsAtI?.length) {
      const { key } = highlightsAtI[0]; // Only using the first highlight at that position
      const className = `sequence-highlight ${getHighlightClass(key)}`;
      const onClick =
        key.includes('potentialStart') ? onSelectStartCodon :
        key.includes('potentialStop') ? onSelectStopCodon :
        undefined;

      result.push(
        <span
          key={`hl-${i}`}
          className={className}
          onClick={onClick}
          data-highlight-location={i}
        >
          {char}
        </span>
      );
    } else {
      result.push(
        <span key={`plain-${i}`} className="sequence-text">
          {char}
        </span>
      );
    }
  }

  return (
    <div
      className="gene-sequence"
      style={{ fontSize: `${fontSize}px` }}
    >
      {result}
    </div>
  );
};

export default React.memo(GeneSequence);

