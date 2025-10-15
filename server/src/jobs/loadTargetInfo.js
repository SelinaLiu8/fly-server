const fs = require('fs');
const pLimit = require('p-limit');
const db = require('../db/db')
const { computeStartStopCodons, searchForTargets } = require('../utils/targetHandler')
const { getAllIsoforms } = require('../utils/utils')

const limit = pLimit(3);
const CHUNK_SIZE = 200;

// ---------- Utility: checkpoint + failed state ----------

function saveCheckpoint(index) {
  fs.writeFileSync('checkpoint.json', JSON.stringify({ index }, null, 2));
}

function loadCheckpoint() {
  if (fs.existsSync('checkpoint.json')) {
    return JSON.parse(fs.readFileSync('checkpoint.json')).index;
  }
  return 0;
}

function loadFailed() {
  if (fs.existsSync('failed.json')) {
    return new Set(JSON.parse(fs.readFileSync('failed.json')));
  }
  return new Set();
}

function saveFailed(failedSet) {
  fs.writeFileSync('failed.json', JSON.stringify(Array.from(failedSet), null, 2));
}

// ---------- DB Helpers ----------

async function getProcessedIsoforms() {
  const [rows] = await db.query('SELECT DISTINCT FBppID FROM GuideTargetInfo');
  return new Set(rows.map(r => r.FBppID));
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

// ---------- Processing logic ----------

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
    const processed = await getProcessedIsoforms();
    const failed = loadFailed();
    const concurrent = 10;
    const chunkSize = 500;

    const startFrom = loadCheckpoint();
    let counter = startFrom;
    const total = isoforms.length;

    const failedIsoforms = isoforms.filter(i => failed.has(i.FBppID));
    const remainingIsoforms = isoforms
      .slice(startFrom)
      .filter(i => !processed.has(i.FBppID) && !failed.has(i.FBppID));
    const toProcess = failedIsoforms.length > 0 ? failedIsoforms : remainingIsoforms;

    console.log(
      `Resuming from index ${startFrom}, remaining ${toProcess.length}, failed to retry: ${failedIsoforms.length}`
    );
    
    for (let i = 0; i < toProcess.length; i += CHUNK_SIZE) {
        const chunk = toProcess.slice(i, i + CHUNK_SIZE);

        await Promise.all(
          chunk.map(isoform =>
            limit(async () => {
              try {
                const success = await targetForSingleIsoform(isoform);
                if (success === false) {
                  // searchForTargets returned null
                  console.warn(`No targets found for ${isoform.FBppID}`);
                  failed.add(isoform.FBppID);
                  saveFailed(failed);
                } else {
                  counter++;
                  failed.delete(isoform.FBppID);
                  saveFailed(failed);
                  saveCheckpoint(counter);
                  console.log(`Processed ${counter}/${total} (${isoform.FBppID})`);
                }
              } catch (err) {
                console.error(`Failed ${isoform.FBppID}: ${err.message}`);
                failed.add(isoform.FBppID);
                saveFailed(failed);
              }
            })
          )
        );

        console.log(
          `🔹 Finished chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(toProcess.length / CHUNK_SIZE)}`
        );
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