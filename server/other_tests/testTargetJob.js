const { searchForTargets } = require('../src/utils/targetHandler')
const { getAllIsoforms } = require('../src/jobs/loadTargetInfo')

async function searchForTargetTest() {
    const targetArea = 'ACGTTGGTAGGCAATTTGATGGGTTTGCAACAATTCGATTCTCATTCCAGATGACGCGCTACAAGCAGACCGAATTCACGGAGGACGACTCGAGTTCCAT';
    const result = await searchForTargets(targetArea);
    console.log(result);
}

async function getAllIsoformsTest() {
    try {
      const isoforms = await getAllIsoforms();
      console.log('First 10 isoforms:', isoforms.slice(0, 10));
    } catch (err) {
      console.error('Error running getAllIsoformsTest:', err);
    }
}

searchForTargetTest();
// getAllIsoformsTest();