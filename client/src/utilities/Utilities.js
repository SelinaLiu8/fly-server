

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
    ? highlights.start?.location
    : highlights?.location;
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

  const makeFeature = (loc, name, color) => {
    return featureTemplate
      .replace('*featureLoc*', loc)
      .replace('*featureName*', name)
      .replace('*featureColor*', color);
  };

  const start = parseInt(highlights?.start?.location || 0) + 1;
  const stop = parseInt(highlights?.stop?.location || 0) + 1;

  return [
    makeFeature(`${start}..${start + 2}`, 'Start Codon', '#35df29'),
    makeFeature(`${stop}..${stop + 2}`, 'Stop Codon', '#df2935')
  ].join('');
};


  