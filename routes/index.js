
var express = require('express');
var router = express.Router();
var path = require('path');
var app = express();
var nightmare = require('../nightmareTools.js');

//Public Directories
/* GET home page. */
router.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, '../public/build', 'index.html'));
})
.get('/api', async (req,res)=>{

  res.header("Access-Control-Allow-Origin", "*");
  let response = {'error':'no valid query'}
  if(req.query){console.log(req.query);}
  if(req.query.type === 'search'){
    //Get Name
    response = await nightmare.searchForGene(req.query.gene);
  } else if(req.query.type === 'moreBases') {
    //Get Gene Info with Padding
    console.log('base url: ',Buffer.from(req.query.url, 'base64').toString('ascii'));
    response = await nightmare.getMoreBases(Buffer.from(req.query.url, 'base64').toString('ascii'));
  } else if(req.query.type === 'geneInfo') {
    //Get Gene Info
    console.log('base url: ',Buffer.from(req.query.url, 'base64').toString('ascii'));
    response = await nightmare.getGeneInfo(Buffer.from(req.query.url, 'base64').toString('ascii'));
  } else if(req.query.type === 'targetSearch') {
    //Get Possible Target List
    response = await nightmare.searchForTargets(req.query.targetArea);
  } else if(req.query.type === 'targetEfficiency') {
    //Get Efficiency Score for Targets
    response = await nightmare.checkTargetEfficiency(JSON.parse(Buffer.from(req.query.targets, 'base64').toString('ascii')));
  } else if(req.query.type === 'oligos') {
    response = await nightmare.getOligos(req.query.target);
  } else if(req.query.type === 'primers') {
    console.log('primer input: ',JSON.parse(Buffer.from(req.query.primerSections, 'base64').toString('ascii')));
    response = await nightmare.getPrimers(JSON.parse(Buffer.from(req.query.primerSections, 'base64').toString('ascii')));
  }
  res.json(response);
});

module.exports = router;