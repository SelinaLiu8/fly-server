import { saveAs } from 'file-saver';

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
  
    return {
      start: {
        location: startIndex,
        length: 3,
        color: '#93E593'
      },
      stop: {
        location: stopIndex,
        length: 3,
        color: '#FF668E'
      }
    };
}

export function getHighlightClass(key) {
    if (key === 'start') return 'highlight-start';
    if (key === 'stop') return 'highlight-stop';
    if (key === 'current') return 'highlight-current';
    if (key.includes('hover')) return 'highlight-hover';
    if (key.includes('potentialStart')) return 'highlight-potential-start';
    if (key.includes('potentialStop')) return 'highlight-potential-stop';
    if (key.includes('cutsite')) return 'highlight-cutsite';
    if (key.includes('homology')) return 'highlight-homology';
    return 'highlight-generic';
}

export function computeTargetAreaLocations(sequence, terminal, highlights) {
    let location = '';
    if (terminal === 'n') {
        location = highlights.start.location;
    } else if (terminal === 'c') {
        location = highlights.stop.location;
    }
    return sequence.substring(location - 50, location + 50);
}

export function getReverseComplement(targetSequence) {
  const complementMap = { A: 'T', T: 'A', C: 'G', G: 'C' };
  return targetSequence
    .split('')
    .reverse()
    .map(base => complementMap[base.toUpperCase()] || base)
    .join('');
}

export function calculatePrimerSections(sequence, terminal, highlights) {
  const targetLocation =
  terminal === 'n'
    ? highlights.start.location
    : highlights.stop.location;
  return {
    "5' Homology": sequence.slice(targetLocation - 1200, targetLocation - 1000),
    "5' Sequence": sequence.slice(targetLocation - 600, targetLocation - 400),
    "3' Sequence": sequence.slice(targetLocation + 400, targetLocation + 600),
    "3' Homology": sequence.slice(targetLocation + 1000, targetLocation + 1200),
  };
}

export function handlePrint() {
  const printContents = document.getElementById("printableArea")?.innerHTML;
  if (!printContents) {
    console.error("No printable content found.");
    return;
  }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body {
            font-family: sans-serif;
            margin: 20px;
          }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
}

// File Utilities
export const formatGene = (gene) => {
  return gene.match(/.{1,10}/g)
    .map((chunk, i) => (i % 5 === 0 ? `\n${String(i * 10 + 1).padStart(9)} ` : '') + chunk + ' ')
    .join('');
};

export const generateFeatureBlock = async (highlights) => {
  const featureTemplate = await fetch(`${window.location.origin}/fly_templates/feature.txt`).then(res => res.text());

  const makeFeature = (loc, name, color) =>
    featureTemplate
      .replace('*featureLoc*', loc)
      .replace('*featureName*', name)
      .replace('*featureColor*', color);

  const features = [];

  // Start & Stop codons
  if (highlights.start?.location !== undefined)
    features.push(makeFeature(`${highlights.start.location + 1}..${highlights.start.location + 3}`, 'Start Codon', '#35df29'));

  if (highlights.stop?.location !== undefined)
    features.push(makeFeature(`${highlights.stop.location + 1}..${highlights.stop.location + 3}`, 'Stop Codon', '#df2935'));

  // Homology arms & primers (5' and 3') — use primerColor
  const primerColor = '#fdca40';
  const primerTypes = ['hom5', 'seq5', 'seq3', 'hom3'];
  const labelMap = {
    hom5: "Homology Arm Primer",
    seq5: "Sequence Primer",
    seq3: "Sequence Primer",
    hom3: "Homology Arm Primer"
  };

  primerTypes.forEach((key) => {
    const nKey = `n-${key}-homology`;
    const cKey = `c-${key}-homology`;

    [nKey, cKey].forEach((k) => {
      if (highlights[k]) {
        const { location, length } = highlights[k];
        const isN = k.startsWith('n');
        const label = `${isN ? "5'" : "3'"} ${labelMap[key]}`;
        features.push(makeFeature(`${location + 1}..${location + length}`, label, primerColor));
      }
    });
  });

  // Target + PAM — use targetColor + pamColor
  const targetColor = '#77d1e1';
  const pamColor = '#0000FF';

  ['n', 'c'].forEach((terminal) => {
    const key = `${terminal}-cutsite`;
    if (highlights[key]) {
      const { location, length } = highlights[key];
      const labelPrefix = terminal === 'n' ? "5'" : "3'";

      features.push(makeFeature(`${location + 1}..${location + length}`, `${labelPrefix} Target`, targetColor));
      features.push(makeFeature(`${location + length - 2}..${location + length}`, `${labelPrefix} PAM`, pamColor));
    }
  });

  return features.join('');
};

export const generateGuideFile = async(sense, label, fileName) => {
  const url = `${window.location.origin}/templates/pU6.txt`;

  const templateText = await fetch(url).then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.text();
  });

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

  const u6EndMatch = templateText.match(/misc_feature\s+(\d+)\.\.(\d+)\n\s+\/locus_tag="u6 promoter"/);
  const u6EndPosition = u6EndMatch ? parseInt(u6EndMatch[2]) : null;

  if (!u6EndPosition) {
    console.error("Could not determine the u6 promoter end position.");
    return;
  }

  const preSplit = templateText.split('**injection_start**')[0];
  const postSplit = templateText.split('**injection_end**')[1];

  const senseLength = sense.length;
  const senseStart = u6EndPosition + 1;
  const senseEnd = senseStart + senseLength - 1;

  const featureString = newFeature(senseStart, senseEnd, label, label, '#35df29');

  const featuresIndex = preSplit.indexOf('FEATURES');
  let modifiedPreSplit = preSplit;
  if (featuresIndex !== -1) {
    const endFeaturesIndex = preSplit.indexOf('ORIGIN', featuresIndex);
    if (endFeaturesIndex !== -1) {
      modifiedPreSplit = preSplit.substring(0, endFeaturesIndex) + featureString + preSplit.substring(endFeaturesIndex);
    } else {
      console.error("Warning: ORIGIN section not found after FEATURES.");
    }
  } else {
    console.error("Warning: FEATURES section not found.");
  }

  const design = modifiedPreSplit + sense + postSplit;
  const blob = new Blob([design], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${fileName}.ape`);
};

export const generatePlasmidFile = async ({
  templateName,
  fileName,
  geneName,
  sequence,
  highlights,
  terminal,
  pam,
  target,
  isDelete = false,
  strand
}) => {
  let templateText;
  // 1. Use FileReader if fileName is a File object
  if (fileName instanceof File) {
    templateText = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(fileName);
    });
  }
  // 2. Use fetch if templateName was provided
  else if (templateName) {
    const url = `${window.location.origin}/plasmid_folder/${encodeURIComponent(templateName)}.txt`;
    templateText = await fetch(url).then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    });
  } else {
    throw new Error("No valid template source provided.");
  }

  const [preArm1, rest1] = templateText.split('**arm_1_start**');
  const [arm1Template, rest2] = rest1.split('**arm_1_end**');
  const [betweenArms, rest3] = rest2.split('**arm_2_start**');
  const [arm2Template, postArm2] = rest3.split('**arm_2_end**');

  const Ncut = highlights.start.location + 3;
  const Ccut = highlights.stop.location;
  const cutSite = terminal === 'n' ? Ncut : Ccut;

  let arm1, arm2;

  if (isDelete) {
    arm1 = sequence.slice(Ncut - 1000, Ncut);
    arm2 = sequence.slice(Ccut, Ccut + 1000);
  } else {
    arm1 = sequence.slice(cutSite - 1000, cutSite);
    arm2 = sequence.slice(cutSite, cutSite + 1000);

    const canonicalTarget = strand === '-' ? getReverseComplement(target) : target;
    const combined = arm1 + arm2;
    const idx = combined.toLowerCase().indexOf(canonicalTarget.toLowerCase());

    if (idx !== -1) {
      const mutated = strand === '-'
        ? combined.slice(0, idx) + pam + combined.slice(idx + 3)
        : combined.slice(0, idx + canonicalTarget.length - 3) + pam + combined.slice(idx + canonicalTarget.length);

      arm1 = mutated.slice(0, Math.ceil(mutated.length / 2));
      arm2 = mutated.slice(Math.ceil(mutated.length / 2));
    }
  }

  const fill = (tmpl, armSeq) => {
    let i = 0;
    return tmpl.replace(/[ATCG]/gi, () => armSeq[i++] ?? '');
  };

  const filledArm1 = fill(arm1Template, arm1);
  const filledArm2 = fill(arm2Template, arm2);

  const design = preArm1 + filledArm1 + betweenArms + filledArm2 + postArm2;
  const blob = new Blob([design], { type: 'text/plain;charset=utf-8' });
  const baseName = fileName ? fileName.name.replace(/\.txt$/i, '') : templateName;
  let fileOutputName 
  if (fileName.endsWith(".txt")) {
    fileOutputName = `${baseName} for ${geneName}.ape`;
  } else if (fileName.endsWith(".gb")) {
    fileOutputName = `${baseName} for ${geneName}.gb`;
  }

  return { blob, fileOutputName };
};

  