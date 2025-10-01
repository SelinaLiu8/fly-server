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
    const [rows] = await db.query("SELECT FBppID FROM IsoformInfo");
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
  
    // Extract loc=...
    let locInfo = description.includes("loc=")
      ? description.split("loc=")[1].split(";")[0] // get until next semicolon
      : null;
  
    let locDesc = null;
    let locStart = null;
    let locEnd = null;
  
    if (locInfo) {
      // Example: "3L:complement(14094810..14097803)"
      locDesc = locInfo.split(":")[0];
  
      // Strip complement/join wrappers
      let coordsPart = locInfo.split(":")[1];
      coordsPart = coordsPart.replace("complement(", "").replace("join(", "").replace(")", "");
  
      // Now coordsPart should look like "14094810..14097803"
      if (coordsPart.includes("..")) {
        let [start, end] = coordsPart.split("..");
        locStart = parseInt(start);
        locEnd = parseInt(end);
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

async function loadCDS() {
    const genes = await getAllGenes();
    for (const { FBgnID: geneId } of genes) {
      try {
        const results = await fetchIsoformResponse(geneId);
        for (const result of results) {
          const isoform = parseIsoform(result, geneId);
          await insertIsoform(isoform);
        }
      } catch (err) {
        console.error(`Error processing gene ${geneId}:`, err.message);
      }
    }
}

async function updateUpAndDownstream() {
    const isoforms = await getAllIsoforms();
  
    console.log(`Found ${isoforms.length} isoforms, updating...`);
  
    const tasks = isoforms.map((isoform) =>
      limit(async () => {
        try {
          await updateSingleIsoform(isoform);
        } catch (err) {
          console.error(`Error processing isoform ${isoform.FBppID}:`, err.message);
        }
      })
    );
  
    await Promise.all(tasks);
  
    console.log("All isoforms processed");
  }

async function updateSingleIsoform(isoform) {
  const location = `${isoform.LocDesc}:${isoform.LocStart}..${isoform.LocEnd}`;
  const strand = isoform.strand === "-" ? "minus" : "plus";
  const sequenceUrl = `${url}/region/dmel/${location}?strand=${strand}&padding=2000`;

  const response = await fetch(sequenceUrl);
  if (!response.ok) throw new Error(`API failed for ${isoform.FBppID}`);
  const data = await response.json();

  const sequence = data.resultset.result[0].sequence;
  const upstream = sequence.substring(0, 2000);
  const downstream = sequence.substring(sequence.length - 2000);
  const trimmed = sequence.substring(2000, sequence.length - 2000);

  await db.execute(
    `UPDATE IsoformInfo
     SET UpStreamSequence=?, GeneSequence=?, DownStreamSequence=?
     WHERE FBppID=?`,
    [upstream, trimmed, downstream, isoform.FBppID]
  );

  console.log(`Updated isoform ${isoform.FBppID}`);
}

// loadCDS();
updateUpAndDownstream();

module.exports = {
    loadCDS,
    getAllGenes,
    fetchIsoformResponse,
    parseIsoform,
    insertIsoform,
    updateSingleIsoform
};