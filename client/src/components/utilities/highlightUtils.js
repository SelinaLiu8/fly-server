export function computeIsoformHighlights(fullSequence, isoformSequence) {
    if (!fullSequence || !isoformSequence) {
      console.error("Missing sequence or isoform sequence for highlighting");
      return [];
    }
  
    const startSequence = isoformSequence.substr(0, 9);  // First 9 bp
    const stopSequence = isoformSequence.substr(isoformSequence.length - 10); // Last 10 bp
  
    const startIndex = fullSequence.indexOf(startSequence);
    const stopIndex = fullSequence.indexOf(stopSequence) + 7;
  
    if (startIndex === -1 || stopIndex === -1) {
      console.error("Start or Stop sequence not found in the full sequence!");
      return [];
    }
  
    return [
      { key: 'start', location: startIndex, length: 3, color: '#93E593' },
      { key: 'stop', location: stopIndex, length: 3, color: '#FF668E' },
    ];
}
  