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
      const targetSequence = r.distal + r.proximal + r.distal;
      // Use ON DUPLICATE KEY UPDATE to update existing rows
      await db.query(
          `INSERT INTO GuideTargetInfo 
              (GuideTargetID, FBppID, TerminalTypeID, TargetSequence, Offtarget, Distal, Proximal, Pam, Strand, Label)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
              TargetSequence = VALUES(TargetSequence),
              Offtarget = VALUES(Offtarget),
              Distal = VALUES(Distal),
              Proximal = VALUES(Proximal),
              Pam = VALUES(Pam),
              Strand = VALUES(Strand),
              Label = VALUES(Label)`,
          [r.guideTargetID, isoformId, terminalID, targetSequence, r.offtarget, r.distal, r.proximal, r.pam, r.strand, r.label]
      );
      console.log(`${targetSequence} inserted/updated successfully!`);
  }
}

async function targetForSingleIsoform(isoform) {
    const fullSequence =
      isoform.UpStreamSequence + isoform.GeneSequence + isoform.DownStreamSequence;
    const isoformSequence = isoform.GeneSequence;
  
    const CodonLocations = computeStartStopCodons(fullSequence, isoformSequence);
    if (!CodonLocations) {
      console.error(`Highlights not found for isoform ${isoform.FBppID}`);
      return;
    }
  
    // --- N terminal (start)
    const nTargetArea = fullSequence.slice(
      CodonLocations.startIndex - 50,
      CodonLocations.startIndex + 50
    );
    const nResults = await searchForTargets(nTargetArea);
    if (nResults) {
      await saveTargets(isoform.FBppID, 'n', nResults);
    }
  
    // --- C terminal (stop)
    const cTargetArea = fullSequence.slice(
      CodonLocations.stopIndex - 50,
      CodonLocations.stopIndex + 50
    );
    const cResults = await searchForTargets(cTargetArea);
    if (cResults) {
      await saveTargets(isoform.FBppID, 'c', cResults);
    }
}

async function loadGuideTargetInfo() {
    const isoforms = await getAllIsoforms();
    let counter =  0;
    const total = isoforms.length;
    debugger;
    for (const isoform of isoforms) {
        try {
            await targetForSingleIsoform(isoform)
            counter++;
        } catch (err) {
            console.error(`Error processing isoform ${isoform.FBppID}:`, err.message);
            counter++;
        }
        console.log(`Proceeded ${counter} out of ${total} isoforms`);
    }
    console.log("All targets processed");
    return;
}

loadGuideTargetInfo();

module.exports = {
  getAllIsoforms,
  saveTargets,
  targetForSingleIsoform,
  loadGuideTargetInfo
}