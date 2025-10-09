const { chromium } = require('playwright');
const { searchForPrimers, parsePrimersFromText, processPrimerType} = require('../src/utils/homologyUtils')


async function searchForPrimersTest() {
    const primerData = {
        "5' Homology": "TGGCAAAAGCAAATGAAAGCTTGAATTCAGCTGTTGGTAGGCAATTTGATGGGTTTGCAACAATTCGATTCTCATTCCAGATGACGCGCTACAAGCAGACCGAATTCACGGAGGACGACTCGAGTTCCAT",
        "5' Sequence": "CGTTTGGGACGGGTTGAGTACGACGGGCGTTGCTTGGGTGGGGTTGAGTGGGCGGTTCAGTCCAAAGGAGCTCACTTGAGAGCAGCCTTGTTCTTCAGCGGCAGGAATGCGGCCATAAAGC",
        "3' Sequence": "TAGACAAACAGGGGCGCGACCGGGAGCGGCGAGGAGGAGCTGCGGCAGGGAGCTTTAGAGGATTAATGTTACTGTACAATAGGTGAACAAATGTAAAT",
        "3' Homology": "TGACGTGATGCTGATGCTGATGCTGCTGATGCTGCGGCGGAGGAGGCGGCGCTGGGAGAGGCGGAGGCGGAGGCGGAGGCGGAGGCGGAGGCGGAGGCGGAGGCG"
    };
    const result = await searchForPrimers(primerData);
    console.log(result);
}

async function processPrimerTest() {
    const browser = await chromium.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-gpu'],
    });
    hom5Area = 'TGGCAAAAGCAAATGAAAGCTTGAATTCAGCTGTTGGTAGGCAATTTGATGGGTTTGCAACAATTCGATTCTCATTCCAGATGACGCGCTACAAGCAGACCGAATTCACGGAGGACGACTCGAGTTCCAT';
    const result = await processPrimerType(browser, hom5Area, 'hom5');
    console.log(result);
}

// searchForPrimersTest();
processPrimerTest();

