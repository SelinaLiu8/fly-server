const fs = require('fs');
const db = require('../db/db');

async function loadTSV() {
    const data = fs.readFileSync('./fb_synonyms_January24.tsv', 'utf8');
    const lines = data.split('\n');
    let inserted = 0;
  
    for (let i = 0; i < lines.length; i++) {
      if (i <= 5) continue; // skip header lines
  
      const cells = lines[i].split('\t');
      const primary_FBid = cells[0];
      const current_symbol = cells[2];
  
        if (primary_FBid && primary_FBid.startsWith('FBgn')) {
            try {
                console.log(`Inserting: FBid=${primary_FBid}, Symbol=${current_symbol}`);
                await db.query(
                    `INSERT INTO GeneInfo (FBgnID, GeneName)
                    VALUES (?, ?)`,
                    [primary_FBid, current_symbol]
                );
                inserted++;
            } catch (err) {
                console.error(`Failed to insert ${primary_FBid}: ${err.message}`);
            }
        }
    }
  
    console.log(`Done. Inserted ${inserted} rows into GeneInfo.`);
    process.exit();
  }
  
  loadTSV();