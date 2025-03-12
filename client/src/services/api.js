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
    const primerSections = { targetLocation, sequence };
    const encodedData = Buffer.from(JSON.stringify(primerSections)).toString('base64');
    const response = await fetch(`/api?type=primers&primerSections=${encodedData}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
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
    const primerSections = { startLocation, stopLocation, sequence };
    const encodedData = Buffer.from(JSON.stringify(primerSections)).toString('base64');
    const response = await fetch(`/api?type=primers&primerSections=${encodedData}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
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
