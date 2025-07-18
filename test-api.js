const fetch = require('node-fetch');

// Test the search endpoint
async function testSearchForGene(geneName) {
  try {
    console.log(`Testing search for gene: ${geneName}`);
    const response = await fetch(`http://localhost:8080/api?type=search&gene=${encodeURIComponent(geneName)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Search response:', JSON.stringify(data, null, 2));
    
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
  }
}

// Test the isoform endpoint
async function testGetIsoform(isoForm) {
  try {
    console.log(`Testing get isoform: ${isoForm}`);
    const response = await fetch(`http://localhost:8080/api?type=isoform&isoform=${encodeURIComponent(isoForm)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Isoform response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error testing get isoform:', error);
  }
}

// Run the tests
async function runTests() {
  try {
    // Test with a known gene
    await testSearchForGene(process.argv[2] || 'Notch');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
