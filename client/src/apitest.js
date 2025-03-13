import * as api from './services/api';

// Test the searchForGene function
async function testSearchForGene(geneName) {
  try {
    console.log(`Testing search for gene: ${geneName}`);
    const data = await api.searchForGene(geneName);
    console.log('Search response:', data);
    
    // If isoforms are returned, test the first one
    if (data.results && data.results.isoforms) {
      const isoforms = JSON.parse(data.results.isoforms);
      if (isoforms.length > 0) {
        await testGetIsoform(isoforms[0]);
      } else {
        console.log('No isoforms found in the response');
      }
    } else {
      console.log('No isoforms property in the response');
    }
    
    return data;
  } catch (error) {
    console.error('Error testing search for gene:', error);
    throw error;
  }
}

// Test the getIsoform function
async function testGetIsoform(isoForm) {
  try {
    console.log(`Testing get isoform: ${isoForm}`);
    const data = await api.getIsoform(isoForm);
    console.log('Isoform response:', data);
    return data;
  } catch (error) {
    console.error('Error testing get isoform:', error);
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    // Test with a known gene
    await testSearchForGene('Notch');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Export the test functions so they can be called from the browser console
export { testSearchForGene, testGetIsoform, runTests };

// Automatically run tests if this file is loaded directly
if (typeof window !== 'undefined') {
  console.log('Running API tests...');
  runTests();
}
