import fs from "fs/promises";
import { pool } from "./db.js";

// ========== GET GENE ==========

// Read & Parse File
async function parseSynonymsFile() {
    const raw = await fs.readFile("./fb_synonyms_January24.tsv", "utf8");
    return raw
      .split("\n")
      .slice(6) // skip header lines
      .map(line => line.split("\t"))
      .filter(cells => cells[1] === "Dmel")
      .map(cells => ({
        primary_FBid: cells[0],
        organism_abbreviation: cells[1],
        current_symbol: cells[2],
        current_fullname: cells[3],
        fullname_synonyms: cells[4],
        symbol_synonyms: cells[5],
      }));
}

// This file should contain the actual logic of the functions
async function getIdFromSearch(searchTerm) {
    console.log("It went into getidfromsearch function");

    const synonyms = await parseSynonymsFile();
    
    // Filter by the search term by name or FBid
    let result;
    if (searchTerm.includes("FBgn")) {
        result = synonyms.filter(obj => {
            return obj.primary_FBid.toLowerCase() == searchTerm.toLowerCase();
        });
    } else {
        result = synonyms.filter(obj => {
            return obj.current_symbol.toLowerCase() == searchTerm.toLowerCase();
        });
    }
    
    let response = { results: { isoforms: null } };
    if (!result.length) {
        return response;
    }

    let idQuery = "SELECT * FROM isoforms WHERE id = ?";
    let idQueryResults = await pool.execute(idQuery, [
        result[0].primary_FBid
    ]);

    console.log('in database ', idQueryResults[0]);

    if (idQueryResults[0].length != 0) {
        response = { results: { name: result[0].current_symbol, id: result[0].primary_FBid, isoforms: idQueryResults[0][0].isoforms } };
    } else {
        let geneInfo = await getGeneticInfoFromId(result[0].primary_FBid);
        if (geneInfo) {
            response = { results: { name: result[0].current_symbol, id: result[0].primary_FBid, isoforms: geneInfo } };
        }
    }

    return response;
}

async function searchForGene(gene) {
    // Puppeteer/API logic here
    return { gene, sequence: 'ATGC...', isoforms: ['iso1','iso2'] };
}