const { getIdFromSearch } = require('./api');  // Assuming your main code is in api.js
const { getGeneticInfoFromId } = require('./api')

// Test the function with a sample search term
getIdFromSearch('FBgn0020621').then(response => {
  console.log('Test Response:', response);
}).catch(err => {
  console.error('Error during test:', err);
});
