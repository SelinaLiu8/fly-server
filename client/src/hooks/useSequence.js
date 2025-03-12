import { useState, useCallback } from 'react';
import { reverseComplement, findStringLocation } from '../utils/sequenceUtils';

/**
 * Custom hook for managing sequence data and operations
 */
const useSequence = () => {
  const [sequence, setSequence] = useState('');
  const [highlights, setHighlights] = useState({});
  const [currentHighlight, setCurrentHighlight] = useState(null);

  /**
   * Find the location of a string in the sequence
   */
  const stringLocation = useCallback((string, type) => {
    if (!string) return -1;
    
    let location = sequence.indexOf(string);
    
    if (location === -1) {
      const revString = reverseComplement(string);
      location = sequence.indexOf(revString);
    }
    
    return location;
  }, [sequence]);

  /**
   * Highlight a string in the sequence
   */
  const highlightString = useCallback((string, color = null, type = null) => {
    if (!string) return;
    
    let location = stringLocation(string);
    
    if (location === -1) {
      location = stringLocation(reverseComplement(string));
    }
    
    if (location === -1) {
      location = 0;
    }
    
    const length = string.length;
    const highlightColor = color || 'rgb(255, 255, 97)';
    
    setCurrentHighlight({
      location,
      length,
      color: highlightColor,
      name: type || string
    });
  }, [stringLocation]);

  /**
   * Clear the current highlight
   */
  const clearHighlight = useCallback(() => {
    setCurrentHighlight(null);
  }, []);

  /**
   * Save the current highlight to the highlights object
   */
  const saveCurrentHighlight = useCallback((color, name) => {
    if (!currentHighlight) {
      console.error("No current highlight to save.");
      return;
    }

    const newHighlight = {
      ...currentHighlight,
      color: color || currentHighlight.color,
      name: name || currentHighlight.name
    };

    setHighlights(prevHighlights => ({
      ...prevHighlights,
      [name || currentHighlight.name]: newHighlight,
    }));
  }, [currentHighlight]);

  /**
   * Change the location of the current highlight
   */
  const changeCurrentHighlight = useCallback((location) => {
    if (!currentHighlight) return;
    
    setCurrentHighlight(prev => ({
      ...prev,
      location
    }));
  }, [currentHighlight]);

  return {
    sequence,
    setSequence,
    highlights,
    setHighlights,
    currentHighlight,
    setCurrentHighlight,
    stringLocation,
    highlightString,
    clearHighlight,
    saveCurrentHighlight,
    changeCurrentHighlight
  };
};

export default useSequence;
