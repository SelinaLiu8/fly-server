const { getPrimers } = require('./puppeteer'); // Adjust the path if needed

(async () => {
  const primerSections = {
    "5' Homology": "TGGCAAAGCAACCAACTATGAAACTAAACTATTGATAATATATTTAATGTAATAATTTATGTATTAACGACGACAACTAAGAACTAAAACCACATTTTTCTACTTATAAGGCCTCTTTCGCAAACAAAAACAAAACATTAAAATCAGAACAGCAACAAGAGCCAAAACGGGGCAGCTTGTAAGGAGTAATCCCAGAGAAC",
    "5' Sequence": "CGTTTGCAGCAATTCAAATTAGAAAAGGGGCTCTACAATATAAAGTTGACCGTTGACTGTTTAGTAAACTCAATTTATGAAACCCTTTTGAAATTTCAAAAATGTAACGTTAGTTTTTGTAGATTTTCAAATAAATAGCGGTTAAACACAGTGTTGCGCAGAGCAATAGGAAAAAATATTGCGCTCAATTCGAACAGAGT",
    "3' Sequence": "TAGACAAGAAAAGGAACTGTTGCAACTTAGTTGAACCAACAATTTCCTCGTTGTGCTATTGGCATATAAATATTTTCTTGGAAGGGGCTCCGCAGATTGGAGCAAAGGTACTAAACATGTGATTGTTAAATATAAATTACTAATTTTATGTTGCCAACCAATATGGATAAAAAGTTTATACAGAATATGTTTGTAAAATA",
    "3' Homology": "TGACACTTACCTCTCCGACTTACAGTCCATGATGGAGCTGCACAAACGTAGGAAAAGCATTACGGAGTTCGAATGCCGCTACTACATTTACCAGATAATCCAGGGCGTTAAGTACTTGCACGATAACCGCATTATCCATCGAGATCTGAAGCTGGGCAATCTCTTCCTCAACGATTTGTTGCACGTGAAGATCGGGGATT"
  };

  try {
    const result = await getPrimers(primerSections);
    console.log('Tag Operation Result:', result);
  } catch (error) {
    console.error('Error running test:', error);
  }
})();

