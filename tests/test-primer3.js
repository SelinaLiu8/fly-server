const {getPrimers} = require('../puppeteer'); // Adjust path accordingly

// Your long sequence here (shortened in this snippet for readability)
const sequence = `eyI1JyBIb21vbG9neSI6IlRHR0NBQUFHQ0FBQ0NBQUNUQVRHQUFBQ1RBQUFDVEFUVEdBVEFBVEFUQVRUVEFBVEdUQUFUQUFUVFRBVEdUQVRUQUFDR0FDR0FDQUFDVEFBR0FBQ1RBQUFBQ0NBQ0FUVFRUVENUQUNUVEFUQUFHR0NDVENUVFRDR0NBQUFDQUFBQUFDQUFBQUNBVFRBQUFBVENBR0FBQ0FHQ0FBQ0FBR0FHQ0NBQUFBQ0dHR0dDQUdDVFRHVEFBR0dBR1RBQVRDQ0NBR0FHQUFDIiwiNScgU2VxdWVuY2UiOiJDR1RUVEdDQUdDQUFUVENBQUFUVEFHQUFBQUdHR0dDVENUQUNBQVRBVEFBQUdUVEdBQ0NHVFRHQUNUR1RUVEFHVEFBQUNUQ0FBVFRUQVRHQUFBQ0NDVFRUVEdBQUFUVFRDQUFBQUFUR1RBQUNHVFRBR1RUVFRUR1RBR0FUVFRUQ0FBQVRBQUFUQUdDR0dUVEFBQUNBQ0FHVEdUVEdDR0NBR0FHQ0FBVEFHR0FBQUFBQVRBVFRHQ0dDVENBQVRUQ0dBQUNBR0FHVCIsIjMnIFNlcXVlbmNlIjoiVEFHQUNBQUdBQUFBR0dBQUNUR1RUR0NBQUNUVEFDQUdUQ0NBVEdBVEdHQUdDVEdDQUNBQUFDR1RBR0dBQUFBR0NBVFRBQ0dHQUdUVENHQUFUR0NDR0NUQUNUQUNBVFRUQUNDQUdBVEFBVENDQUdHR0NHVFRBQUdUQUNUVEdDQUNHQVRBQUNDR0NBVFRBVENDQVRDR0FHQVRDVEdBQUdDVEdHR0NBQVRDVENUVENDVENBQUNHQVRUVEdUVEdDQUNHVEdBQUdBVENHR0dHQVRUIn0=`;

// Mock processPrimers if you're not calling an actual API
const decodedData = Buffer.from(sequence, 'base64').toString('utf-8');
console.log('Decoded primer sections from GET:', decodedData);
primerSections = JSON.parse(decodedData);

// ✅ Test delete primers
// (async () => {
//   const deleteInput = {
//     sequence,
//     startLocation: 300,
//     stopLocation: 900
//   };

//   const deleteResult = await getPrimers(deleteInput);
//   console.log('Delete Operation Result:', deleteResult);
// })();

// ✅ Test tag primers
(async () => {
  const tagInput = {
    sequence,
    targetLocation: 600
  };

  const tagResult = await getPrimers(primerSections);
  console.log('Tag Operation Result:', tagResult);
  }
)();

