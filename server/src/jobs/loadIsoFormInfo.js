const fs = require('fs');
const db = require('../db/db')
const pLimit = require("p-limit");

const limit = pLimit(5);
const url = 'https://api.flybase.org/api/1.0/sequence';

async function getAllGenes() {
    const [rows] = await db.query("SELECT FBgnID FROM GeneInfo");
    return rows;
}

async function getAllIsoforms() {
    const [rows] = await db.query("SELECT * FROM IsoformInfo");
    return rows;
}

async function fetchIsoformResponse(geneId) {
    const response = await fetch(`${url}/id/${geneId}/CDS`);
    if (!response.ok) {
      console.warn(`API failed for ${geneId}: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.resultset.result || [];
}

function parseIsoform(result, geneId) {
    const fbppId = result.id;
    const description = result.description || "";

    let isoformName = null;
    const match = description.match(/name=([^;]+)/);
    if (match) {
        isoformName = match[1];
    }
  
    let locStrand = description.includes("complement") ? "-" : "+";
  
    let locInfo = description.includes("loc=")
      ? description.split("loc=")[1].split(";")[0]
      : null;
  
    let locDesc = null;
    let locStart = null;
    let locEnd = null;
  
    if (locInfo) {
      // Example: "3L:complement(14094810..14097803)"
      locDesc = locInfo.split(":")[0];
  
      let coordsPart = locInfo.split(":")[1];
      coordsPart = coordsPart.replace(/complement\(|join\(|\)/g, "");
  
      if (coordsPart.includes("..")) {
        const segments = coordsPart.split(",");
      
        const coords = segments.map(seg => {
          const [start, end] = seg.split("..").map(Number);
          return { start, end };
        });
      
        locStart = Math.min(...coords.map(c => c.start));
        locEnd = Math.max(...coords.map(c => c.end));
      }
    }
  
    return {
      fbppId,
      geneId,
      isoformName,
      sequence: "",
      strand: locStrand,
      locStart,
      locEnd,
      locDesc,
      upStreamSequence: "",
      downStreamSequence: "",
      region: "CDS",
    };
  }

async function insertIsoform(isoform) {
    const isoformQuery = `
        INSERT INTO IsoformInfo
        (FBppID, FBgnID, IsoformName, GeneSequence, Strand, LocStart, LocEnd, LocDesc,
            UpStreamSequence, DownStreamSequence, Region)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        IsoformName=VALUES(IsoformName),
        GeneSequence=VALUES(GeneSequence),
        Strand=VALUES(Strand),
        LocStart=VALUES(LocStart),
        LocEnd=VALUES(LocEnd),
        LocDesc=VALUES(LocDesc),
        UpStreamSequence=VALUES(UpStreamSequence),
        DownStreamSequence=VALUES(DownStreamSequence),
        Region=VALUES(Region)
    `;
    
    await db.execute(isoformQuery, [
        isoform.fbppId,
        isoform.geneId,
        isoform.isoformName,
        isoform.sequence,
        isoform.strand,
        isoform.locStart,
        isoform.locEnd,
        isoform.locDesc,
        isoform.upStreamSequence,
        isoform.downStreamSequence,
        isoform.region,
    ]);
    
    console.log(`Inserted isoform ${isoform.fbppId} for gene ${isoform.geneId}`);
}

async function loadCDS(startFrom = null) {
  const genes = await getAllGenes();
  let startIndex = 0;

  // If a starting gene is provided, find its index
  if (startFrom) {
    startIndex = genes.findIndex(g => g.FBgnID === startFrom);
    if (startIndex === -1) {
      console.error(`Gene ${startFrom} not found in list.`);
      return;
    }
  }

  const total = genes.length;
  console.log(`Starting from index ${startIndex + 1} of ${total} total genes.`);

  for (let i = startIndex; i < genes.length; i++) {
    const { FBgnID: geneId } = genes[i];
    try {
      const results = await fetchIsoformResponse(geneId);
      for (const result of results) {
        const isoform = parseIsoform(result, geneId);
        await insertIsoform(isoform);
      }
      console.log(`[${i + 1}/${total}] Processed gene ${geneId}`);
    } catch (err) {
      console.error(`[${i + 1}/${total}] Error processing gene ${geneId}: ${err.message}`);
    }
  }
}


async function updateUpAndDownstream() {
  const isoforms = await getAllIsoforms();
  const total = isoforms.length;
  let counter = 0;

  console.log(`Found ${total} isoforms, updating...`);

  for (const isoform of isoforms) {
    try {
      await updateSingleIsoform(isoform);
    } catch (err) {
      console.error(`Error processing isoform ${isoform.FBppID}: ${err.message}`);
    }

    counter++;
    if (counter % 10 === 0 || counter === total) {
      console.log(`Processed ${counter}/${total} isoforms`);
    }
  }

  console.log("All isoforms processed");
}

async function updateMissingSequences() {
  // Fetch only isoforms with empty upstream or downstream sequence
  const [isoforms] = await db.execute(`
    SELECT * FROM IsoformInfo
    WHERE UpStreamSequence IS NULL
       OR UpStreamSequence = ''
       OR DownStreamSequence IS NULL
       OR DownStreamSequence = ''
  `);

  const total = isoforms.length;
  if (total === 0) {
    console.log("No isoforms with missing sequences found.");
    return;
  }

  console.log(`Found ${total} isoforms with missing sequences, updating...`);
  let counter = 0;

  for (const isoform of isoforms) {
    try {
      await updateSingleIsoform(isoform); // reuse your existing function
    } catch (err) {
      console.error(`Failed to update ${isoform.FBppID}: ${err.message}`);
    }
    counter++;
    if (counter % 10 === 0 || counter === total) {
      console.log(`Processed ${counter}/${total} isoforms`);
    }
    // optional small delay to avoid overwhelming FlyBase
    await new Promise(r => setTimeout(r, 100));
  }

  console.log("All missing sequences updated.");
  return;
}

async function updateSingleIsoform(isoform) {
    const location = `${isoform.LocDesc}:${isoform.LocStart}..${isoform.LocEnd}`;
    const strand = isoform.strand === "-" ? "minus" : "plus";
    const sequenceUrl = `${url}/region/dmel/${location}?strand=${strand}&padding=2000`;

    const response = await fetch(sequenceUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MyScript/1.0)',
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    debugger;

    const data = await response.json();
    const sequence = data.resultset.result[0].sequence;

    const upstream = sequence.substring(0, 2000);
    const downstream = sequence.substring(sequence.length - 2000);
    const trimmed = sequence.substring(2000, sequence.length - 2000);

    console.log("Gene Sequence: ", trimmed);


    await db.execute(
      `UPDATE IsoformInfo
      SET UpStreamSequence=?, GeneSequence=?, DownStreamSequence=?
      WHERE FBppID=?`,
      [upstream, trimmed, downstream, isoform.FBppID]
    );

    console.log(`Updated isoform ${isoform.FBppID}`);

    return;
}

loadCDS("FBgn0261238");
// updateUpAndDownstream();
// updateMissingSequences();

module.exports = {
    loadCDS,
    getAllGenes,
    fetchIsoformResponse,
    parseIsoform,
    insertIsoform,
    updateSingleIsoform
};