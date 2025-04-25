import { saveAs } from 'file-saver';

/**
 * Download a text file with the given content
 * @param {string} content - The content to save in the file
 * @param {string} filename - The name of the file to save
 * @param {string} type - The MIME type of the file (default: 'text/plain;charset=utf-8')
 */
export const downloadTextFile = (content, filename, type = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type });
  saveAs(blob, filename);
};

/**
 * Download an APE file for the gene sequence
 * @param {string} geneName - The name of the gene
 * @param {string} sequence - The gene sequence
 * @param {Object} highlights - The highlights object containing locations and lengths
 * @param {Object} targets - The targets object
 * @param {string} currentPam - The current PAM sequence
 * @param {string} isoFormStrand - The strand of the isoform
 */
export const downloadApeFile = async (geneName, sequence, highlights, targets, currentPam, isoFormStrand) => {
  try {
    const emptyApeResponse = await fetch(window.location.origin + '/build/fly_templates/empty_ape.txt');
    const emptyApeData = await emptyApeResponse.text();
    
    const featureResponse = await fetch(window.location.origin + '/build/fly_templates/feature.txt');
    const featureTemplate = await featureResponse.text();
    
    const newFeature = (loc, name, color) => {
      return featureTemplate
        .split('*featureLoc*').join(loc)
        .split('*featureName*').join(name)
        .split('*featureColor*').join(color);
    };
    
    let gene = sequence;
    const target = targets[0].distal.toString() + targets[0].proximal.toString();
    const targetMatch = gene.toLowerCase().match(target.toLowerCase());
    const revTargetMatch = gene.toLowerCase().match(reverseComplement(target.toLowerCase()));
    
    let targetI;
    if (targetMatch) {
      targetI = targetMatch.index + 1;
    } else if (revTargetMatch) {
      targetI = revTargetMatch.index;
    }
    
    let pamStart = revTargetMatch ? targetI - 2 : targetI + 20;
    if (isoFormStrand === '-' && targetMatch) {
      pamStart = targetI;
    }
    
    const start = 1 + parseInt(highlights.start.location);
    const stop = 1 + parseInt(highlights.stop.location);
    
    gene = !currentPam ? gene : gene.substr(0, pamStart - 1) + currentPam + gene.substr(pamStart + 2, gene.length);
    
    const featureArr = [
      newFeature(start + '..' + (start + 2), 'Start Codon', '#35df29'),
      newFeature(stop + '..' + (stop + 2), 'Stop Codon', '#df2935'),
      newFeature((parseInt(1 + highlights['hom5']['location'])) + '..' + (parseInt(1 + highlights['hom5']['location']) + highlights['hom5']['length']), "5' Homology Arm Primer", '#fdca40'),
      newFeature((parseInt(1 + highlights['hom3']['location'])) + '..' + (parseInt(1 + highlights['hom3']['location']) + highlights['hom3']['length']), "3' Homology Arm Primer", '#fdca40'),
      newFeature((parseInt(1 + highlights['seq5']['location'])) + '..' + (parseInt(1 + highlights['seq5']['location']) + highlights['seq5']['length']), "5' Sequence Primer", '#fdca40'),
      newFeature((parseInt(1 + highlights['seq3']['location'])) + '..' + (parseInt(1 + highlights['seq3']['location']) + highlights['seq3']['length']), "3' Sequence Primer", '#fdca40'),
      newFeature(targetI + '..' + (parseInt(targetI) + 20), "Target", '#77d1e1'),
      newFeature(pamStart + '..' + (parseInt(pamStart) + 2), "Pam", '#0000FF'),
    ];
    
    const makeGeneArr = () => {
      let geneArr = [];
      const spaces = (str) => {
        let spaceArr = [];
        for (let i = 0; i < 9 - str.length; i++) {
          spaceArr.push('');
        }
        return spaceArr;
      }
      
      for (let i = 0; i < gene.length;) {
        if (i % 50 === 0) {
          geneArr.push('\n');
        }
        if (i === 0 || i % 50 === 0) {
          const currentNum = (i + 1).toString();
          geneArr.push(spaces(i + 1).join(' ') + (i + 1) + ' ');
        }
        if (i + 10 > gene.length) {
          geneArr.push(gene.slice(i, gene.length));
        } else {
          geneArr.push(gene.slice(i, i + 10));
        }
        geneArr.push('');
        i = i + 10;
      }
      return geneArr.join(' ');
    }
    
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const date = new Date();
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    const newData = emptyApeData
      .split('*FEATURES*').join(featureArr.join(''))
      .split('*name*').join(geneName)
      .split('*length*').join(sequence.length)
      .split('*date*').join(day + '-' + month + '-' + year)
      .split('*GENE*').join(makeGeneArr());
    
    downloadTextFile(newData, `${geneName}.ape`);
  } catch (error) {
    console.error('Error downloading APE file:', error);
  }
};

/**
 * Download a delete APE file for the gene sequence
 * @param {string} geneName - The name of the gene
 * @param {string} sequence - The gene sequence
 * @param {Object} highlights - The highlights object containing locations and lengths
 * @param {Object} selectedNTarget - The selected N-terminal target
 * @param {Object} selectedCTarget - The selected C-terminal target
 * @param {string} currentPam - The current PAM sequence
 */
export const downloadDeleteApeFile = async (geneName, sequence, highlights, selectedNTarget, selectedCTarget, currentPam) => {
  try {
    const emptyApeResponse = await fetch(window.location.origin + '/build/fly_templates/empty_ape.txt');
    const emptyApeData = await emptyApeResponse.text();
    
    const featureResponse = await fetch(window.location.origin + '/build/fly_templates/feature.txt');
    const featureTemplate = await featureResponse.text();
    
    const newFeature = (loc, name, color) => {
      return featureTemplate
        .split('*featureLoc*').join(loc)
        .split('*featureName*').join(name)
        .split('*featureColor*').join(color);
    };
    
    let gene = sequence;
    const nTargetSequence = selectedNTarget.distal + selectedNTarget.proximal;
    const cTargetSequence = selectedCTarget.distal + selectedCTarget.proximal;

    // Match targets for N-Terminal
    const targetMatchN = gene.toLowerCase().match(nTargetSequence.toLowerCase());
    const revTargetMatchN = gene.toLowerCase().match(reverseComplement(nTargetSequence.toLowerCase()));
    
    // Check if either match was found for N-Terminal
    if (!targetMatchN && !revTargetMatchN) {
      console.error("Could not find N-Terminal target in sequence");
      throw new Error("Could not find N-Terminal target in sequence");
    }
    let targetIN = targetMatchN ? targetMatchN.index + 1 : revTargetMatchN.index + 1;

    // Match targets for C-Terminal
    const targetMatchC = gene.toLowerCase().match(cTargetSequence.toLowerCase());
    const revTargetMatchC = gene.toLowerCase().match(reverseComplement(cTargetSequence.toLowerCase()));
    
    // Check if either match was found for C-Terminal
    if (!targetMatchC && !revTargetMatchC) {
      console.error("Could not find C-Terminal target in sequence");
      throw new Error("Could not find C-Terminal target in sequence");
    }
    let targetIC = targetMatchC ? targetMatchC.index + 1 : revTargetMatchC.index + 1;

    // Define PAM positions for N and C
    const pamStartN = (revTargetMatchN && !targetMatchN) ? targetIN - 2 : targetIN + 20;
    const pamStartC = (revTargetMatchC && !targetMatchC) ? targetIC - 2 : targetIC + 20;

    const start = parseInt(highlights.start.location) + 1;
    const stop = parseInt(highlights.stop.location) + 1;

    // Insert PAM sequence if needed
    gene = currentPam
      ? gene.substr(0, pamStartN - 1) + currentPam + gene.substr(pamStartN + 2)
      : gene;
    
    const featureArr = [
      newFeature(`${start}..${start + 2}`, 'Start Codon', '#35df29'),
      newFeature(`${stop}..${stop + 2}`, 'Stop Codon', '#df2935'),
      newFeature((parseInt(1 + highlights['hom5_N']['location'])) + '..' + (parseInt(1 + highlights['hom5_N']['location']) + highlights['hom5_N']['length']), "5' N Homology Arm Primer", '#fdca40'),
      newFeature((parseInt(1 + highlights['hom3_N']['location'])) + '..' + (parseInt(1 + highlights['hom3_N']['location']) + highlights['hom3_N']['length']), "3' N Homology Arm Primer", '#fdca40'),
      newFeature((parseInt(1 + highlights['seq5_N']['location'])) + '..' + (parseInt(1 + highlights['seq5_N']['location']) + highlights['seq5_N']['length']), "5' N Sequence Primer", '#fdca40'),
      newFeature((parseInt(1 + highlights['seq3_N']['location'])) + '..' + (parseInt(1 + highlights['seq3_N']['location']) + highlights['seq3_N']['length']), "3' N Sequence Primer", '#fdca40'),
      newFeature((parseInt(1 + highlights['hom5_C']['location'])) + '..' + (parseInt(1 + highlights['hom5_C']['location']) + highlights['hom5_C']['length']), "5' C Homology Arm Primer", '#d440fd'),
      newFeature((parseInt(1 + highlights['hom3_C']['location'])) + '..' + (parseInt(1 + highlights['hom3_C']['location']) + highlights['hom3_C']['length']), "3' C Homology Arm Primer", '#d440fd'),
      newFeature((parseInt(1 + highlights['seq5_C']['location'])) + '..' + (parseInt(1 + highlights['seq5_C']['location']) + highlights['seq5_C']['length']), "5' C Sequence Primer", '#d440fd'),
      newFeature((parseInt(1 + highlights['seq3_C']['location'])) + '..' + (parseInt(1 + highlights['seq3_C']['location']) + highlights['seq3_C']['length']), "3' C Sequence Primer", '#d440fd'),
      newFeature(`${targetIN}..${targetIN + 20}`, 'Target N-Terminal', '#77d1e1'),
      newFeature(`${targetIC}..${targetIC + 20}`, 'Target C-Terminal', '#77d1e1'),
      newFeature(`${pamStartN}..${pamStartN + 2}`, 'PAM N-Terminal', '#0000FF'),
      newFeature(`${pamStartC}..${pamStartC + 2}`, 'PAM C-Terminal', '#0000FF')
    ];
    
    const makeGeneArr = () => {
      let geneArr = [];
      for (let i = 0; i < gene.length; i += 10) {
        if (i % 50 === 0) geneArr.push('\n' + (i + 1).toString().padStart(9, ' ') + ' ');
        geneArr.push(gene.slice(i, i + 10) + ' ');
      }
      return geneArr.join('');
    };
    
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const date = new Date();
    const formattedDate = `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
    
    const newData = emptyApeData
      .split('*FEATURES*').join(featureArr.join(''))
      .split('*name*').join(geneName)
      .split('*length*').join(sequence.length)
      .split('*date*').join(formattedDate)
      .split('*GENE*').join(makeGeneArr());
    
    downloadTextFile(newData, `${geneName}_delete.ape`);
  } catch (error) {
    console.error('Error downloading delete APE file:', error);
  }
};

/**
 * Download a plasmid template file
 * @param {string} plasmidTemplate - The name of the plasmid template
 * @param {string} geneName - The name of the gene
 * @param {string} sequence - The gene sequence
 * @param {Object} targets - The targets object
 * @param {Object} highlights - The highlights object containing locations and lengths
 * @param {string} terminal - The terminal type ('n' or 'c')
 * @param {string} currentPam - The current PAM sequence
 */
export const downloadPlasmidTemplate = async (plasmidTemplate, geneName, sequence, targets, highlights, terminal, currentPam) => {
  if (!plasmidTemplate) return;
  
  try {
    const url = `${window.location.origin}/build/plasmid_folder/${plasmidTemplate.split(' ').join('%20')}.txt`;
    const response = await fetch(url);
    const data = await response.text();
    
    const preArm1 = data.split('**arm_1_start**')[0];
    const searchSequence = targets[0].distal + targets[0].proximal + targets[0].pam;
    const cutsite = terminal === 'n' ? (highlights.start.location + 3) : highlights.stop.location;
    let arm1 = sequence.slice(cutsite - 1000, cutsite);
    const postArm1 = data.split('**arm_1_end**')[1].split('**arm_2_start**')[0];
    let arm2 = sequence.slice(cutsite, cutsite + 1000);
    const postArm2 = data.split('**arm_2_end**')[1];
    
    if (currentPam) {
      const strand = targets[0].strand;
      const target = strand === '-' ? reverseComplement(searchSequence) : searchSequence;
      let arms = arm1 + arm2;
      const targetI = arms.toLowerCase().match(target.toLowerCase());
      
      if (strand === '-') {
        arms = arms.substr(0, targetI.index) + currentPam + arms.substr(targetI.index + 3, arms.length);
      } else {
        arms = arms.substr(0, targetI.index + target.length - 3) + currentPam + arms.substr(targetI.index + target.length, arms.length);
      }
      
      arm1 = arms.slice(0, Math.floor(arms.length / 2) + 1);
      arm2 = arms.slice(Math.floor(arms.length / 2), arms.length);
    }
    
    let replaceArm1 = data.split('**arm_1_start**')[1].split('**arm_1_end**')[0].split('');
    let arm1I = 0;
    let replaceArm2 = data.split('**arm_2_start**')[1].split('**arm_2_end**')[0].split('');
    let arm2I = 0;
    
    for (let y = 0; y < replaceArm1.length; y++) {
      if (replaceArm1[y] === ' ' || replaceArm1[y] === '\n' || !isNaN(replaceArm1[y])) {
        // Skip spaces, newlines, and numbers
      } else {
        replaceArm1[y] = arm1[arm1I];
        arm1I++;
      }
    }
    
    for (let y = 0; y < replaceArm2.length; y++) {
      if (replaceArm2[y] === ' ' || replaceArm2[y] === '\n' || !isNaN(replaceArm2[y])) {
        // Skip spaces, newlines, and numbers
      } else {
        replaceArm2[y] = arm2[arm2I];
        arm2I++;
      }
    }
    
    const newData = preArm1 + replaceArm1.join('') + postArm1 + replaceArm2.join('') + postArm2;
    downloadTextFile(newData, `${plasmidTemplate} for ${geneName}.ape`);
  } catch (error) {
    console.error('Error downloading plasmid template:', error);
  }
};

/**
 * Download a delete plasmid template file
 * @param {string} plasmidTemplate - The name of the plasmid template
 * @param {string} geneName - The name of the gene
 * @param {string} sequence - The gene sequence
 * @param {Object} highlights - The highlights object containing locations and lengths
 */
export const downloadDeletePlasmidTemplate = async (plasmidTemplate, geneName, sequence, highlights) => {
  if (!plasmidTemplate) return;
  
  try {
    const url = `${window.location.origin}/build/plasmid_folder/${plasmidTemplate.split(' ').join('%20')}.txt`;
    const response = await fetch(url);
    const data = await response.text();
    
    const preArm1 = data.split('**arm_1_start**')[0];
    const Ncutsite = highlights.start.location + 3;
    const Ccutsite = highlights.stop.location;
    let arm1 = sequence.slice(Ncutsite - 1000, Ncutsite);
    const postArm1 = data.split('**arm_1_end**')[1].split('**arm_2_start**')[0];
    let arm2 = sequence.slice(Ccutsite, Ccutsite + 1000);
    const postArm2 = data.split('**arm_2_end**')[1];
    
    let replaceArm1 = data.split('**arm_1_start**')[1].split('**arm_1_end**')[0].split('');
    let arm1I = 0;
    let replaceArm2 = data.split('**arm_2_start**')[1].split('**arm_2_end**')[0].split('');
    let arm2I = 0;
    
    for (let y = 0; y < replaceArm1.length; y++) {
      if (replaceArm1[y] === ' ' || replaceArm1[y] === '\n' || !isNaN(replaceArm1[y])) {
        continue;
      } else {
        replaceArm1[y] = arm1[arm1I];
        arm1I++;
      }
    }
    
    for (let y = 0; y < replaceArm2.length; y++) {
      if (replaceArm2[y] === ' ' || replaceArm2[y] === '\n' || !isNaN(replaceArm2[y])) {
        continue;
      } else {
        replaceArm2[y] = arm2[arm2I];
        arm2I++;
      }
    }
    
    const newData = preArm1 + replaceArm1.join('') + postArm1 + replaceArm2.join('') + postArm2;
    downloadTextFile(newData, `${plasmidTemplate} for ${geneName}.ape`);
  } catch (error) {
    console.error('Error downloading delete plasmid template:', error);
  }
};

/**
 * Download a guide RNA file
 * @param {string} geneName - The name of the gene
 * @param {Object} oligos - The oligos object
 */
export const downloadGuideRna = async (geneName, oligos) => {
  try {
    const url = window.location.origin + '/build/templates/pU6.txt';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.text();
    
    const newFeature = (start, end, locusTag, label, color) => {
      return `     misc_feature    ${start}..${end}\n` +
             `                     /locus_tag="${locusTag}"\n` +
             `                     /label="${label}"\n` +
             `                     /ApEinfo_label="${label}"\n` +
             `                     /ApEinfo_fwdcolor="${color}"\n` +
             `                     /ApEinfo_revcolor="green"\n` +
             `                     /ApEinfo_graphicformat="arrow_data {{0 1 2 0 0 -1} {} 0}\n` +
             `                     width 5 offset 0\n`;
    };
    
    let preSplit = data.split('**injection_start**')[0];
    let postSplit = data.split('**injection_end**')[1];
    let sense = oligos.sense;
    
    const u6EndMatch = preSplit.match(/misc_feature\s+(\d+)\.\.(\d+)\n\s+\/locus_tag="u6 promoter"/);
    const u6EndPosition = u6EndMatch ? parseInt(u6EndMatch[2]) : null;
    
    // Get the start and end for the sense feature
    const senseLength = sense.length;
    const senseStart = u6EndPosition + 1; // Adjust this if necessary
    const senseEnd = senseStart + senseLength - 1;
    
    // Create the new feature string for the sense oligo
    const featureString = newFeature(senseStart, senseEnd, 'sense', 'Sense', '#35df29');
    
    // Locate the index of the *FEATURES placeholder
    const featuresIndex = preSplit.indexOf('FEATURES');
    if (featuresIndex !== -1) {
      // Find the end of the FEATURES section
      const endFeaturesIndex = preSplit.indexOf('ORIGIN', featuresIndex);
      if (endFeaturesIndex !== -1) {
        // Append the new feature string before the ORIGIN line
        preSplit = preSplit.substring(0, endFeaturesIndex) + featureString + preSplit.substring(endFeaturesIndex);
      }
    }
    
    // Combine preSplit and postSplit
    const design = preSplit + sense + postSplit;
    downloadTextFile(design, `rna-${geneName}.ape`);
  } catch (error) {
    console.error('Error downloading guide RNA:', error);
  }
};

/**
 * Download a delete guide RNA file
 * @param {string} geneName - The name of the gene
 * @param {Object} oligos - The oligos object with N and C properties
 */
export const downloadDeleteGuideRna = async (geneName, oligos) => {
  try {
    // Log the oligos object to help with debugging
    console.log("downloadDeleteGuideRna oligos:", oligos);
    
    // Validate input parameters
    if (!geneName) {
      console.error("Missing geneName for downloadDeleteGuideRna");
      throw new Error("Missing geneName for downloadDeleteGuideRna");
    }
    
    if (!oligos || !oligos.N || !oligos.C) {
      console.error("Missing oligos data for downloadDeleteGuideRna");
      throw new Error("Missing oligos data for downloadDeleteGuideRna");
    }
    
    // Ensure oligos.N and oligos.C have the expected structure
    if (!oligos.N.sense || !oligos.C.sense) {
      console.error("Oligos missing sense property:", oligos);
      throw new Error("Oligos missing sense property");
    }
    
    const url = window.location.origin + '/build/templates/pU6.txt';
    console.log("Fetching template from:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.text();
    
    const newFeature = (start, end, locusTag, label, color) => {
      return `     misc_feature    ${start}..${end}\n` +
             `                     /locus_tag="${locusTag}"\n` +
             `                     /label="${label}"\n` +
             `                     /ApEinfo_label="${label}"\n` +
             `                     /ApEinfo_fwdcolor="${color}"\n` +
             `                     /ApEinfo_revcolor="green"\n` +
             `                     /ApEinfo_graphicformat="arrow_data {{0 1 2 0 0 -1} {} 0}\n` +
             `                     width 5 offset 0\n`;
    };
    
    const u6EndMatch = data.match(/misc_feature\s+(\d+)\.\.(\d+)\n\s+\/locus_tag="u6 promoter"/);
    const u6EndPosition = u6EndMatch ? parseInt(u6EndMatch[2]) : null;
    
    if (!u6EndPosition) {
      throw new Error("Could not determine the u6 promoter end position.");
    }
    
    const generateFile = (oligo, label, fileName) => {
      // Split data for each oligo to avoid overwriting
      const preSplit = data.split('**injection_start**')[0];
      const postSplit = data.split('**injection_end**')[1];
      
      const oligoLength = oligo.sense.length;
      const oligoStart = u6EndPosition + 1;
      const oligoEnd = oligoStart + oligoLength - 1;
      
      const featureString = newFeature(oligoStart, oligoEnd, label, label, '#35df29');
      
      // Insert the new feature into the FEATURES section
      let modifiedPreSplit = preSplit;
      const featuresIndex = preSplit.indexOf('FEATURES');
      if (featuresIndex !== -1) {
        const endFeaturesIndex = preSplit.indexOf('ORIGIN', featuresIndex);
        if (endFeaturesIndex !== -1) {
          modifiedPreSplit = preSplit.substring(0, endFeaturesIndex) + featureString + preSplit.substring(endFeaturesIndex);
        }
      }
      
      // Combine parts to form the final design
      const design = modifiedPreSplit + oligo.sense + postSplit;
      downloadTextFile(design, `${fileName}.ape`);
    };
    
    // Generate files for N and C
    console.log("Generating N-terminal guide RNA file");
    generateFile(oligos.N, "delete-N", `rna-delete-N-${geneName}`);
    
    console.log("Generating C-terminal guide RNA file");
    generateFile(oligos.C, "delete-C", `rna-delete-C-${geneName}`);
    
    console.log("Guide RNA files generated successfully");
  } catch (error) {
    console.error('Error downloading delete guide RNA:', error);
    throw error; // Re-throw to allow caller to handle the error
  }
};

// Helper function for reverseComplement
const reverseComplement = (dna) => {
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
