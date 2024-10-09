
var express = require('express');
var router = express.Router();
var path = require('path');
var app = express();
var nightmare = require('../nightmareTools.js');
var puppet = require('../puppeteer.js');
var flyApi = require('../api.js');

router.get('/', (req, res) => {
  console.log(`Request URL: ${req.url}`);
  res.send('API is working!');
});

app.get('/test', (req, res) => {
  res.send('Test route is working!');
});

router.get('/api', async (req, res) => {
  req.socket.setTimeout(3600e3);
  console.log('query', req.query);

  // Set CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  
  let response = { 'error': 'no valid query' };
  
  console.log("request went through, here's the request: ", req);

  if (req.query) { 
    console.log(req.query.type); 
  }

  // Process various types of queries
  if (req.query.type === 'new') {
    res.json(['you did it']);
    return; // End response here
  } else if (req.query.type === 'search') {
    response = await flyApi.getIdFromSearch(req.query.gene);
    console.log('res', response);
  } else if (req.query.type === 'isoform') {
    response = await flyApi.getIsoFormSequence(req.query.isoform);
  } else if (req.query.type === 'targetSearch') {
    response = await puppet.searchForTargets(req.query.targetArea);
  } else if (req.query.type === 'targetEfficiency') {
    response = await puppet.checkTargetEfficiency(req.query.targets);
  } else if (req.query.type === 'oligos') {
    response = await puppet.getOligos(req.query.target);
  } else if (req.query.type === 'primers') {
    response = await puppet.getPrimers(JSON.parse(Buffer.from(req.query.primerSections, 'base64').toString('ascii')));
  }

  console.log('response: ', response);
  res.json(response); // Send the response as JSON
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
});

// Handle documentation requests
// router.get('/docs', (req, res) => {
//   res.sendFile(path.join(__dirname, '../', 'public/api-docs/index.html'));
// });

// Add a catch-all route for the React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/build', 'index.html'));
// });

module.exports = router;
