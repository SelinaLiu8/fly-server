const { searchForPrimers } = require('../src/utils/homologyUtils')

async function searchForPrimersTest() {
    const primerData = {
        "5' Homology": "ATGCGTACGTTGATCGTACGCTTAGGCTTAGCGTAGCTTAGGCTAGCTTACG",
        "5' Sequence": "GCTAGCATGCTAGCTTAGCTAGCATGCTAGCTAGCTTAGCGTAGCTAGCTAG",
        "3' Sequence": "TTGCGATCGATCGTAGCTTAGCTTAGCTAGCTGATCGTAGCTAGCTAGCTAA",
        "3' Homology": "CGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCATCGATCGATCGAT"
    };
    const result = await searchForPrimers(primerData);
    console.log(result);
}

searchForPrimersTest();

