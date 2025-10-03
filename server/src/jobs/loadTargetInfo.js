const fs = require('fs');
const db = require('../db/db')
const { computeStartStopCodons, searchForTargets } = require('../utils/targetHandler')

async function getAllIsoforms() {
    const [rows] = await db.query("SELECT * FROM IsoformInfo");
    return rows;
}

async function saveTargets(isoformId, terminal, results) {
    const terminalID = terminal === 'n' ? 1 : 2;
    for (let r of results) {
        targetSequence = r.distal + r.proximal + r.distal;
        await db.query(
            `INSERT INTO Targets (FBppID, TerminalTypeID, TargetSequence, Offtarget, Distal, Proximal, Pam, Strand, Label) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [isoformId, terminalID, targetSequence, r.offtarget, r.distal, r.proximal, r.pam, r.strand, r.label]
        );
    }
}

async function targetForSingleIsoform(isoform) {
    const fullSequence =
      isoform.UpStreamSequence + isoform.GeneSequence + isoform.DownStreamSequence;
    const isoformSequence = isoform.GeneSequence;
  
    const highlights = computeStartStopCodons(fullSequence, isoformSequence);
    if (!highlights) {
      console.error(`Highlights not found for isoform ${isoform.FBppID}`);
      return;
    }
  
    // --- N terminal (start)
    const nTargetArea = fullSequence.slice(
      highlights.startIndex - 50,
      highlights.startIndex + 50
    );
    const nResults = await searchForTargets(nTargetArea);
    if (nResults?.results) {
      await saveTargets(isoform.FBppID, 'n', nResults.results);
    }
  
    // --- C terminal (stop)
    const cTargetArea = fullSequence.slice(
      highlights.stopIndex - 50,
      highlights.stopIndex + 50
    );
    const cResults = await searchForTargets(cTargetArea);
    if (cResults?.results) {
      await saveTargets(isoform.FBppID, 'c', cResults.results);
    }
}

async function loadGuideTargetInfo() {
    isoforms = await getAllIsoforms();
    let counter =  0;
    const total = isoforms.length;

    for (const isoform of isoforms) {
        try {
            targetForSingleIsoform(isoform)
        } catch (err) {
            console.error(`Error processing isoform ${isoform.FBppID}:`, err.message);
            counter++;
        }
    }
    console.log("All isoforms processed");
    return;
}

loadGuideTargetInfo();