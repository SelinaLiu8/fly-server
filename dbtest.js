const { getIdFromSearch, getIsoFormSequence } = require('./api.js'); // Update with the correct path

async function testFunctions() {
    try {
        // Test getIdFromSearch
        const searchTerm = 'polo'; // Replace with the actual term
        const searchResult = await getIdFromSearch(searchTerm);
        console.log('getIdFromSearch result:', searchResult);

        // Test getIsoFormSequence
        const isoform = 'your_isoform'; // Replace with the actual isoform
        const isoFormResult = await getIsoFormSequence(isoform);
        console.log('getIsoFormSequence result:', isoFormResult);
    } catch (error) {
        console.error('Error during test:', error);
    }
}

testFunctions();
