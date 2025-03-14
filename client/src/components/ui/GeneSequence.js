import React, { useRef, useEffect } from 'react';
import './GeneSequence.css';

const GeneSequence = ({
  sequence,
  highlights,
  currentHighlight,
  fontSize,
  onSelectStartCodon,
  onSelectStopCodon
}) => {
  const sequenceRef = useRef(null);

  useEffect(() => {
    if (currentHighlight && sequenceRef.current) {
      const { location } = currentHighlight;
      const sequenceElement = sequenceRef.current;
      
      // Calculate the position to scroll to
      const charWidth = fontSize * 0.6; // Approximate width of a character
      const charsPerLine = Math.floor(sequenceElement.clientWidth / charWidth);
      const lineHeight = fontSize * 1.5; // Approximate height of a line
      
      const line = Math.floor(location / charsPerLine);
      const scrollPosition = line * lineHeight;
      
      sequenceElement.scrollTop = scrollPosition - sequenceElement.clientHeight / 2;
    }
  }, [currentHighlight, fontSize]);

  if (!sequence) {
    return <div className="gene-sequence-empty">No sequence available</div>;
  }

  const renderSequence = () => {
    // Create a map of all highlighted positions
    const highlightMap = new Map();
    
    // Process all highlights including the current highlight
    const allHighlights = { ...highlights };
    if (currentHighlight) {
      allHighlights.current = currentHighlight;
    }
    
    // Map each position in the sequence to its highlight info
    Object.entries(allHighlights).forEach(([key, highlight]) => {
      const { location, length, color } = highlight;
      const end = location + length;
      
      // Determine if this is a potential start or stop codon
      const isPotentialStart = key.includes('potentialStart');
      const isPotentialStop = key.includes('potentialStop');
      const isStart = key === 'start';
      const isStop = key === 'stop';
      const isCurrent = key === 'current';
      
      // For each position in this highlight, add the highlight info
      for (let i = location; i < end; i++) {
        if (!highlightMap.has(i)) {
          highlightMap.set(i, []);
        }
        
        highlightMap.get(i).push({
          key,
          color,
          isPotentialStart,
          isPotentialStop,
          isStart,
          isStop,
          isCurrent,
          location,
          length
        });
      }
    });
    
    // Render the sequence character by character
    const result = [];
    let currentSpanClass = null;
    let currentSpanStyle = null;
    let currentSpanStart = 0;
    let currentSpanText = '';
    let currentSpanOnClick = null;
    let currentSpanDataLocation = null;
    
    for (let i = 0; i < sequence.length; i++) {
      const char = sequence[i];
      const highlights = highlightMap.get(i) || [];
      
      // Determine the class and style for this character
      let spanClass = 'sequence-text';
      let spanStyle = {};
      let spanOnClick = null;
      let spanDataLocation = null;
      
      if (highlights.length > 0) {
        // Sort highlights by priority: start/stop > current > others
        highlights.sort((a, b) => {
          if (a.isStart || a.isStop) return -1;  // Start/stop codons have highest priority
          if (b.isStart || b.isStop) return 1;
          if (a.isCurrent) return -1;  // Current highlight has second priority
          if (b.isCurrent) return 1;
          return 0;  // Other highlights have lowest priority
        });
        
        // Get the primary highlight (highest priority)
        const primaryHighlight = highlights[0];
        spanClass = `sequence-highlight ${primaryHighlight.key}`;
        spanStyle = { backgroundColor: primaryHighlight.color };
        
        // If there are multiple highlights, add a special class
        if (highlights.length > 1) {
          spanClass += ' sequence-highlight-overlap';
        }
        
        // Set onClick handler for potential start/stop codons
        if (primaryHighlight.isPotentialStart) {
          spanOnClick = onSelectStartCodon;
        } else if (primaryHighlight.isPotentialStop) {
          spanOnClick = onSelectStopCodon;
        }
        
        // Set data-highlight-location
        spanDataLocation = primaryHighlight.location;
      }
      
      // If this character has a different class/style than the current span,
      // or if it has a different onClick handler, end the current span and start a new one
      if (spanClass !== currentSpanClass || 
          JSON.stringify(spanStyle) !== JSON.stringify(currentSpanStyle) ||
          spanOnClick !== currentSpanOnClick ||
          spanDataLocation !== currentSpanDataLocation) {
        
        // End the current span if there is one
        if (currentSpanText) {
          result.push(
            <span
              key={`span-${currentSpanStart}`}
              className={currentSpanClass}
              style={currentSpanStyle}
              onClick={currentSpanOnClick}
              data-highlight-location={currentSpanDataLocation}
            >
              {currentSpanText}
            </span>
          );
        }
        
        // Start a new span
        currentSpanClass = spanClass;
        currentSpanStyle = spanStyle;
        currentSpanStart = i;
        currentSpanText = char;
        currentSpanOnClick = spanOnClick;
        currentSpanDataLocation = spanDataLocation;
      } else {
        // Continue the current span
        currentSpanText += char;
      }
    }
    
    // End the last span
    if (currentSpanText) {
      result.push(
        <span
          key={`span-${currentSpanStart}`}
          className={currentSpanClass}
          style={currentSpanStyle}
          onClick={currentSpanOnClick}
          data-highlight-location={currentSpanDataLocation}
        >
          {currentSpanText}
        </span>
      );
    }
    
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

export default GeneSequence;
