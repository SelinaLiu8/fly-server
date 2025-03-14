
var express = require('express');
var router = express.Router();
var path = require('path');
var app = express();
var nightmare = require('../nightmareTools.js');
var puppet = require('../puppeteer.js');
var flyApi = require('../api.js');

// router.get('/', (req, res) => {
//   console.log(`Request URL: ${req.url}`);
//   res.send('API is working!');
// });

// Add middleware to parse JSON bodies
router.use(express.json());

// Handle CORS preflight requests
router.options('/api', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// Handle both GET and POST requests to /api
router.all('/api', async (req, res) => {
  req.socket.setTimeout(3600e3);
  
  // Set CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  
  let response = { 'error': 'no valid query' };
  let queryType, queryParams;
  
  // Determine if this is a GET or POST request and extract parameters accordingly
  if (req.method === 'GET') {
    console.log('GET query', req.query);
    queryType = req.query.type;
    queryParams = req.query;
  } else if (req.method === 'POST') {
    console.log('POST body', req.body);
    queryType = req.body.type;
    queryParams = req.body;
  } else {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  console.log("Request type:", queryType);
  
  try {
    // Process various types of queries
    if (queryType === 'new') {
      res.json([queryParams]);
      console.log('Request Params:', queryParams);
      return; // End response here
    } else if (queryType === 'search') {
      response = await flyApi.getIdFromSearch(req.query.gene);
      console.log('res', response);
    } else if (queryType === 'isoform') {
      response = await flyApi.getIsoFormSequence(req.query.isoform);
      console.log('res', response);
    } else if (queryType === 'targetSearch') {
      response = await puppet.searchForTargets(req.query.targetArea);
    } else if (queryType === 'targetEfficiency') {
      response = await puppet.checkTargetEfficiency(req.query.targets);
    } else if (queryType === 'oligos') {
      response = await puppet.getOligos(req.query.target);
    } else if (queryType === 'primers') {
      // Handle primers request - could be GET or POST
      let primerSections;
      
      if (req.method === 'GET') {
        try {
          // Decode base64 string from client (encoded with btoa)
          const decodedData = Buffer.from(req.query.primerSections, 'base64').toString('utf-8');
          console.log('Decoded primer sections from GET:', decodedData);
          primerSections = JSON.parse(decodedData);
        } catch (error) {
          console.error('Error decoding primer sections from GET:', error);
          res.status(400).json({ error: 'Failed to decode primer sections' });
          return;
        }
      } else { // POST
        // For POST, the data is already parsed as JSON
        primerSections = queryParams.primerSections;
        console.log('Primer sections from POST:', primerSections);
      }
      
      if (!primerSections) {
        res.status(400).json({ error: 'Missing primer sections data' });
        return;
      }
      
      response = await puppet.getPrimers(primerSections);
    } else {
      res.status(400).json({ error: 'Invalid query type' });
      return;
    }
    
    console.log('response: ', response);
    res.json(response); // Send the response as JSON
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
