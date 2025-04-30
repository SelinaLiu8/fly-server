import React, { useRef, useEffect } from 'react';
import '../styles/Sequence.css';
import { getHighlightClass } from '../utilities/highlightUtils';

const GeneSequence = ({
  sequence,
  highlights = {},
  currentHighlight = null,
  fontSize = 16,
  onSelectStartCodon,
  onSelectStopCodon
}) => {
  const sequenceRef = useRef(null);

  useEffect(() => {
    if (currentHighlight && sequenceRef.current) {
      const { location } = currentHighlight;
      const element = sequenceRef.current;
      const charWidth = fontSize * 0.6;
      const charsPerLine = Math.floor(element.clientWidth / charWidth);
      const lineHeight = fontSize * 1.5;
      const scrollTop = Math.floor(location / charsPerLine) * lineHeight;
      element.scrollTop = scrollTop - element.clientHeight / 2;
    }
  }, [currentHighlight, fontSize]);

  if (!sequence) return <div className="gene-sequence-empty">No sequence available</div>;

  const highlightDict = {};

  const all = { ...highlights };
  if (currentHighlight) all._current = currentHighlight;

  for (const [key, { location, length }] of Object.entries(all)) {
    for (let i = location; i < location + length; i++) {
      if (!highlightDict[i]) highlightDict[i] = [];
      highlightDict[i].push({ key });
    }
  }

  const result = [];

  for (let i = 0; i < sequence.length; i++) {
    const char = sequence[i];
    const highlightsAtI = highlightDict[i];

    if (highlightsAtI?.length) {
      const { key } = highlightsAtI[0];
      const className = `sequence-highlight ${getHighlightClass(key)}`;
      const onClick = key.includes('potentialStart')
        ? onSelectStartCodon
        : key.includes('potentialStop')
        ? onSelectStopCodon
        : undefined;

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
      ref={sequenceRef}
      style={{ fontSize: `${fontSize}px` }}
    >
      {result}
    </div>
  );
};

export default React.memo(GeneSequence);

