/**
 * Search for a gene by name
 * @param {string} geneName - The name of the gene to search for
 * @returns {Promise<Object>} The gene information
 */
export const searchForGene = async (geneName) => {
  try {
    const response = await fetch(`/api?type=search&gene=${encodeURIComponent(geneName)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching for gene:', error);
    throw error;
  }
};

/**
 * Get isoform information
 * @param {string} isoForm - The isoform to get information for
 * @returns {Promise<Object>} The isoform information
 */
export const getIsoform = async (isoForm) => {
  try {
    const response = await fetch(`/api?type=isoform&isoform=${encodeURIComponent(isoForm)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting isoform:', error);
    throw error;
  }
};

/**
 * Search for targets in a gene sequence
 * @param {string} geneSequence - The gene sequence to search in
 * @returns {Promise<Object>} The target information
 */
export const searchForTargets = async (geneSequence) => {
  try {
    const response = await fetch(`/api?type=targetSearch&targetArea=${encodeURIComponent(geneSequence)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching for targets:', error);
    throw error;
  }
};

/**
 * Get target efficiency
 * @param {Array<string>} targets - The targets to get efficiency for
 * @returns {Promise<Object>} The target efficiency information
 */
export const getTargetEfficiency = async (targets) => {
  try {
    const response = await fetch(`/api?type=targetEfficiency&targets=${encodeURIComponent(JSON.stringify(targets))}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting target efficiency:', error);
    throw error;
  }
};

/**
 * Get primers for a target location
 * @param {number} targetLocation - The target location
 * @param {string} sequence - The gene sequence
 * @returns {Promise<Object>} The primer information
 */
export const getPrimers = async (targetLocation, sequence) => {
  try {
    console.log('API getPrimers called with targetLocation:', targetLocation, 'sequence length:', sequence?.length);
    
    if (!targetLocation) {
      console.error('Missing targetLocation parameter');
      throw new Error('Target location is required');
    }
    
    if (!sequence) {
      console.error('Missing sequence parameter');
      throw new Error('Sequence is required');
    }
    
    // Instead of encoding the entire sequence, just send the relevant part
    // Extract a smaller portion of the sequence around the target location
    const startPos = Math.max(0, targetLocation - 2000);
    const endPos = Math.min(sequence.length, targetLocation + 2000);
    const relevantSequence = sequence.substring(startPos, endPos);
    
    // Adjust the target location to be relative to the extracted sequence
    const adjustedTargetLocation = targetLocation - startPos;
    
    const primerSections = { 
      targetLocation: adjustedTargetLocation, 
      sequence: relevantSequence,
      originalPosition: targetLocation // Include the original position for reference
    };
    
    console.log('Using sequence segment from', startPos, 'to', endPos, 
                'with adjusted targetLocation:', adjustedTargetLocation);
    
    // Use POST instead of GET to handle larger data
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'primers',
        primerSections: primerSections
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Server error: ${data.error}`);
    }
    
    console.log('API getPrimers response:', data);
    return data;
  } catch (error) {
    console.error('Error getting primers:', error);
    throw error;
  }
};

/**
 * Get delete primers for start and stop locations
 * @param {number} startLocation - The start location
 * @param {number} stopLocation - The stop location
 * @param {string} sequence - The gene sequence
 * @returns {Promise<Object>} The primer information
 */
export const getDeletePrimers = async (startLocation, stopLocation, sequence) => {
  try {
    console.log('API getDeletePrimers called with startLocation:', startLocation, 'stopLocation:', stopLocation, 'sequence length:', sequence?.length);
    
    if (!startLocation || !stopLocation) {
      console.error('Missing location parameters');
      throw new Error('Start and stop locations are required');
    }
    
    if (!sequence) {
      console.error('Missing sequence parameter');
      throw new Error('Sequence is required');
    }
    
    // Extract relevant portions of the sequence around the start and stop locations
    const startPos = Math.max(0, Math.min(startLocation, stopLocation) - 2000);
    const endPos = Math.min(sequence.length, Math.max(startLocation, stopLocation) + 2000);
    const relevantSequence = sequence.substring(startPos, endPos);
    
    // Adjust the locations to be relative to the extracted sequence
    const adjustedStartLocation = startLocation - startPos;
    const adjustedStopLocation = stopLocation - startPos;
    
    const primerSections = { 
      startLocation: adjustedStartLocation, 
      stopLocation: adjustedStopLocation,
      sequence: relevantSequence,
      originalStartPosition: startLocation,
      originalStopPosition: stopLocation
    };
    
    console.log('Using sequence segment from', startPos, 'to', endPos, 
                'with adjusted startLocation:', adjustedStartLocation,
                'and adjusted stopLocation:', adjustedStopLocation);
    
    // Use POST instead of GET to handle larger data
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'primers',
        primerSections: primerSections
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Server error: ${data.error}`);
    }
    
    console.log('API getDeletePrimers response:', data);
    return data;
  } catch (error) {
    console.error('Error getting delete primers:', error);
    throw error;
  }
};

/**
 * Get oligos for a target
 * @param {string} target - The target sequence
 * @returns {Promise<Object>} The oligo information
 */
export const getOligos = async (target) => {
  try {
    const response = await fetch(`/api?type=oligos&target=${encodeURIComponent(target)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting oligos:', error);
    throw error;
  }
};
