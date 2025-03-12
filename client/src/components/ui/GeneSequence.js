import React, { useRef, useEffect } from 'react';

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
    let result = [];
    let currentIndex = 0;
    
    // Sort highlights by location
    const sortedHighlights = Object.entries(highlights || {})
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.location - b.location);
    
    // Add current highlight to the sorted highlights if it exists
    if (currentHighlight) {
      sortedHighlights.push({
        key: 'current',
        ...currentHighlight
      });
      
      // Re-sort with the current highlight
      sortedHighlights.sort((a, b) => a.location - b.location);
    }
    
    // Process each highlight
    for (const highlight of sortedHighlights) {
      // Add text before the highlight
      if (highlight.location > currentIndex) {
        result.push(
          <span key={`text-${currentIndex}`} className="sequence-text">
            {sequence.substring(currentIndex, highlight.location)}
          </span>
        );
      }
      
      // Add the highlighted text
      const highlightEnd = highlight.location + highlight.length;
      const highlightedText = sequence.substring(highlight.location, highlightEnd);
      
      // Determine if this is a potential start or stop codon
      const isPotentialStart = highlight.key.includes('potentialStart');
      const isPotentialStop = highlight.key.includes('potentialStop');
      
      result.push(
        <span
          key={`highlight-${highlight.key}`}
          className={`sequence-highlight ${highlight.key}`}
          style={{ backgroundColor: highlight.color }}
          data-highlight-location={highlight.location}
          onClick={isPotentialStart ? onSelectStartCodon : isPotentialStop ? onSelectStopCodon : undefined}
        >
          {highlightedText}
        </span>
      );
      
      currentIndex = highlightEnd;
    }
    
    // Add any remaining text
    if (currentIndex < sequence.length) {
      result.push(
        <span key={`text-${currentIndex}`} className="sequence-text">
          {sequence.substring(currentIndex)}
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
