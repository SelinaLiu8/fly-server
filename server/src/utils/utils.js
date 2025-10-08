async function getAllIsoforms() {
    const [rows] = await db.query("SELECT * FROM IsoformInfo");
    return rows;
}

function computeStartStopCodons(fullSequence, isoformSequence) {
    if (!fullSequence || !isoformSequence) {
      console.error("Missing sequence or isoform sequence for highlighting");
      return null;
    }
  
    const startSequence = isoformSequence.slice(0, 9);
    const stopSequence = isoformSequence.slice(-10);
  
    const startIndex = fullSequence.indexOf(startSequence);
    const stopIndex = fullSequence.indexOf(stopSequence);
  
    if (startIndex === -1 || stopIndex === -1) {
      console.error("Start or Stop sequence not found in the full sequence!");
      return null;
    }
  
    return {
      startIndex,
      stopIndex
    };
}

module.exports = {
    getAllIsoforms,
    computeStartStopCodons
}