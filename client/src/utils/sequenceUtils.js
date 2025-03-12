/**
 * Reverse complement a DNA sequence
 * @param {string} dna - The DNA sequence to reverse complement
 * @returns {string} The reverse complement of the DNA sequence
 */
export const reverseComplement = (dna) => {
  if (!dna) return '';
  
  let revComp = [];
  for (let i = 0; i < dna.length; i++) {
    const base = dna[i].toLowerCase();
    if (base === 'a') revComp.push('T');
    else if (base === 'c') revComp.push('G');
    else if (base === 'g') revComp.push('C');
    else if (base === 't') revComp.push('A');
    else revComp.push(dna[i].toUpperCase()); // Keep other characters as is
  }
  return revComp.reverse().join('');
};

/**
 * Find the location of a string in a sequence
 * @param {string} sequence - The sequence to search in
 * @param {string} searchString - The string to search for
 * @returns {number} The index of the string in the sequence, or -1 if not found
 */
export const findStringLocation = (sequence, searchString) => {
  if (!sequence || !searchString) return -1;
  
  let location = sequence.indexOf(searchString);
  
  if (location === -1) {
    const revString = reverseComplement(searchString);
    location = sequence.indexOf(revString);
  }
  
  return location;
};
