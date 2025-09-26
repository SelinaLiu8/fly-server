const db = require('../db/db')

async function getGene(input) {
    // If it looks like an FBgnID, search by that. Otherwise assume it's a gene name.
    const isFBgn = /^FBgn\d+$/.test(input);
  
    const query = isFBgn
      ? "SELECT * FROM GeneInfo WHERE FBgnID = ?"
      : "SELECT * FROM GeneInfo WHERE GeneName = ?";
  
    const [rows] = await db.query(query, [input]);
  
    if (!rows.length) return null;
  
    const gene = rows[0];
    // attach isoforms
    // TODO: Finish the isoform func
    // gene.isoforms = await isoformService.getIsoformsByGene(gene.FBgnID);
  
    // return both, regardless of input type
    return {
      FBgnID: gene.FBgnID,
      GeneName: gene.GeneName,
    //   isoforms: gene.isoforms,
    };
}

module.exports = {
    getGene
};