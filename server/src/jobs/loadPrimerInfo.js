const fs = require('fs')
const db = require('../db/db')
const { getAllIsoforms, computeStartStopCodons } = require('../utils/utils')
const { searchForPrimers } = require('../utils/homologyUtils')

async function savePrimer(FBppID, terminal, primerType, results) {

}

async function primerForSingleIsoform(isoform) {
    const terminalID = terminal === 'n' ? 1 : 2;
    for (let r of results) {
        const primerSequence = r[0]

        await db.query(
            `INSERT INTO PrimerInfo
                ()`
        );
    }
}

async function loadPrimerInfo(startFrom = 0) {
    const isoforms = await getAllIsoforms();
    const counter = startFrom;
    const total = isoforms.length;
    const concurrent = 5;
    const chunkSize = 500;

    for (let i = startFrom; i < total; i += chunkSize) {
        const chunk = isoforms.slice(i, i + chunkSize);

        for(let j = 0; j < chunk.length; j+= concurrent) {
            const batch = chunk.slice(j, j + concurrent);
            await Promise.all(batch.map(async (isoforms) => {
                try {
                    await primerForSingleIsoform(isoforms);
                    counter++;
                } catch(err) {
                    console.error(`Error processing isoform ${isoform.FBppID}:`, err.message);
                    counter++;
                } 
            }))
        }
    }
}

loadPrimerInfo();

module.exports = {
    savePrimer,
    primerForSingleIsoform,
    loadPrimerInfo
}