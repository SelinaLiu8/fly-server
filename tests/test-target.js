// testSearchForTargets.js

const { searchForTargets } = require('../puppeteer'); // adjust path if needed

// Your test input
const inputSequence = 'CCAAAGTGAGGTAATAAACACGGCGAATTAACGAGAAACCCGAGTGAATAATGTCCAAACTGGTGAAGAGAATCCGCAGCATGATCAATCCAAGCAGCCA';

(async () => {
  try {
    console.log('🔬 Running searchForTargets with input:\n', inputSequence, '\n');
    const { results, targets } = await searchForTargets(inputSequence);
    console.log('✅ Parsed Results Array:\n', results);
    console.log('\n✅ Encoded Targets String:\n', targets);
  } catch (err) {
    console.error('❌ searchForTargets failed:', err);
  }
})();
