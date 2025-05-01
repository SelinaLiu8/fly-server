import React, { useEffect, useRef } from 'react';
import '../styles/Sequence.css';
import { getHighlightClass } from '../utilities/highlightUtils';

const GeneSequence = ({
  sequence,
  highlights = {},
  currentHighlights = {},
  fontSize = 16,
  onSelectStartCodon,
  onSelectStopCodon,
}) => {
  const containerRef = useRef(null);

  // Scroll to first highlight out of view
  useEffect(() => {
    if (!highlights || !containerRef.current) return;
  
    const timeout = setTimeout(() => {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
  
      for (const [key, value] of Object.entries(highlights)) {
        if (!value || typeof value.location !== 'number') continue;
      
        if (key === 'start' || key === 'stop') continue;
      
        const targetEl = container.querySelector(`[data-highlight-location="${value.location}"]`);
        if (!targetEl) continue;
      
        const targetRect = targetEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
      
        const isVisible =
          targetRect.top >= containerRect.top &&
          targetRect.bottom <= containerRect.bottom;
      
        if (!isVisible) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }, 0);
  
    return () => clearTimeout(timeout);
  }, [highlights]);  

  if (!sequence) return <div className="gene-sequence-empty">No sequence available</div>;

  // Merge all highlights
  const combinedHighlights = { ...highlights, ...currentHighlights };

  // Build a map of character indices to highlight info
  const highlightMap = {};
  for (const [key, { location, length }] of Object.entries(combinedHighlights)) {
    for (let i = location; i < location + length; i++) {
      if (!highlightMap[i]) highlightMap[i] = [];
      highlightMap[i].push({ key });
    }
  }

  // Render each character with its appropriate highlight (if any)
  const result = [];
  for (let i = 0; i < sequence.length; i++) {
    const char = sequence[i];
    const highlightsAtI = highlightMap[i];

    if (highlightsAtI?.length) {
      const { key } = highlightsAtI[0]; // Use the first highlight type
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
      ref={containerRef}
      className="gene-sequence"
      style={{ fontSize: `${fontSize}px` }}
    >
      {result}
    </div>
  );
};

export default React.memo(GeneSequence);
