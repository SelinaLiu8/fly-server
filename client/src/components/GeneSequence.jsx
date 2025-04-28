import React, { useRef, useEffect } from 'react';
import '../styles/Sequence.css'

const BATCH_SIZE = 50; // Group size for plain text batching

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
      const sequenceElement = sequenceRef.current;

      const charWidth = fontSize * 0.6; // Estimate width per character
      const charsPerLine = Math.floor(sequenceElement.clientWidth / charWidth);
      const lineHeight = fontSize * 1.5;

      const line = Math.floor(location / charsPerLine);
      const scrollPosition = line * lineHeight;

      sequenceElement.scrollTop = scrollPosition - sequenceElement.clientHeight / 2;
    }
  }, [currentHighlight, fontSize]);

  if (!sequence) {
    return <div className="gene-sequence-empty">No sequence available</div>;
  }

  const renderSequence = () => {
    const highlightMap = new Map();

    // Merge highlights and current highlight
    const allHighlights = { ...highlights };
    if (currentHighlight) {
      allHighlights._current = currentHighlight;
    }

    // Build a map of highlighted locations
    Object.entries(allHighlights).forEach(([key, highlight]) => {
      const { location, length, color } = highlight;
      const end = location + length;

      for (let i = location; i < end; i++) {
        if (!highlightMap.has(i)) {
          highlightMap.set(i, []);
        }
        highlightMap.get(i).push({ key, color });
      }
    });

    const result = [];
    let batchText = '';
    let batchStart = null;

    const flushBatch = () => {
      if (batchText && batchStart !== null) {
        result.push(
          <span
            key={`plain-${batchStart}`}
            className="sequence-text"
          >
            {batchText}
          </span>
        );
        batchText = '';
        batchStart = null;
      }
    };

    for (let i = 0; i < sequence.length; i++) {
      const char = sequence[i];
      const highlightsAtI = highlightMap.get(i);

      if (highlightsAtI) {
        flushBatch(); // Close any ongoing plain text batch

        const primary = highlightsAtI[0];
        const { key, color } = primary;

        // Set up potential onClick for special codons
        let onClickHandler = null;
        if (key.includes('potentialStart') && onSelectStartCodon) {
          onClickHandler = onSelectStartCodon;
        } else if (key.includes('potentialStop') && onSelectStopCodon) {
          onClickHandler = onSelectStopCodon;
        }

        result.push(
          <span
            key={`highlight-${i}`}
            className={`sequence-highlight ${key}`}
            style={{ backgroundColor: color }}
            onClick={onClickHandler}
            data-highlight-location={i}
          >
            {char}
          </span>
        );
      } else {
        // Normal text — batch together
        if (batchStart === null) {
          batchStart = i;
        }
        batchText += char;

        if (batchText.length >= BATCH_SIZE) {
          flushBatch();
        }
      }
    }

    flushBatch(); // Flush last batch
    return result;
  };

  return (
    <div
      className="gene-sequence"
      ref={sequenceRef}
      style={{ fontSize: `${fontSize}px` }}
    >
      {renderSequence()}
    </div>
  );
};

export default React.memo(GeneSequence);
