const local = require('./.env.js');
const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');

async function searchForGene(gene,isoFormSearch) {
  console.log(gene);
  console.log(isoFormSearch);
  try{
    const pool = await mysql.createPool({
      host: local.dbhost,
      port:local.dbport,
      user: local.dbuser,
      password: local.dbpassword,
      database: local.database,
      waitForConnections: true,
      connectionLimit: 100,
      queueLimit: 0
    });
    let testQuery,testQueryResults;
    testQuery = "SELECT * FROM gene_info WHERE gene_info.name LIKE ? ";
    testQueryResults = await pool.execute(testQuery,[
      gene
    ]);
    let today = new Date();
    if(testQueryResults[0].length>0){
      let lastScraped = testQueryResults[0][0].time;
      console.log(testQueryResults[0][0]);
      console.log(lastScraped); 
      console.log(' '+(today.getTime() - (7*86400000)))
      if(lastScraped>(today.getTime() - (7*86400000))){
        return testQueryResults[0][0];
      }
    }
   
    let browser = await puppeteer.launch({headless:true,args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]});
    
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    await page.goto('https://flybase.org/');
    console.log(gene);
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    console.log(data);
    await page.waitForFunction('document.querySelector("body")');
    await page.type('#GeneSearch',gene);
    await Promise.all([page.$eval('#j2g_search_form',form=>form.submit()),page.waitForNavigation()]);
    let select = await page.select('#fasta select','gene_extended');
    //console.log(select);
    await page.$eval('#fasta button',button=>button.click());
    await page.waitForSelector('.fastaSeq');
    let geneSequence = await page.$eval('.fastaSeq',res=>res.textContent);
    await page.select('#seqtype--2','CDS');
    await page.evaluate(()=>{
    [...document.querySelectorAll('form button')].find(element => element.textContent === 'View Sequence').click();
    });
    await page.waitForSelector('.fastaSeq');
    let selectedText = null;
    let isoFormNames = null;
    let isoFormInfo = {};
    try{
      let selected = await page.$eval("#seqSelector", res => res.value);
      selectedText = await page.$eval("option[value='"+selected+"']", res => res.textContent);
      //console.log(selectedText);
    
      let isoForms = await page.$$eval('#seqSelector option',elements=> elements.map(item=>item.value));
      isoFormNames = await page.$$eval('#seqSelector option',elements=> elements.map(item=>item.textContent));
      
      console.log('iso options',isoForms);
      for(let i=0;i<isoForms.length;i++){
        await page.select('#seqSelector',isoForms[i]);
        let isoFormName = isoFormNames[i];
        let isoFormGene = await page.$eval('.fastaSeq',res=>res.textContent);
        isoFormInfo[isoFormNames[i]] = isoFormGene;
      }
    } catch(e){
      console.log('no isoforms');
    }

    let isoFormSequence = await page.$eval('.fastaSeq',res=>res.textContent);
    let geneID = await page.$eval('input[name="ids"]', res => res.value);
    //console.log(geneSymbol);
    let url = await page.url();
    let info = {
      'res':true,
      'url':url,
      'isoForm':selectedText,
      'isoForms':JSON.stringify(isoFormNames),
      'sequence':geneSequence.replace(/\s/g,''),
      'isoFormSequence':isoFormSequence.replace(/\s/g,''),
      'geneId':geneID,
      'name':gene
    }
    browser.close();
    let insertQuery = "insert into gene_info (name,isoForm,isoFormSequence,isoForms,url,sequence,time,geneId) VALUES (?,?,?,?,?,?,?,?)";
    let isoKeys = Object.keys(isoFormInfo);
    for(let i=0;i<isoKeys.length;i++){
      await pool.execute(insertQuery,[
        gene,
        isoKeys[i],
        isoFormInfo[isoKeys[i]].replace(/\s/g,''),
        JSON.stringify(isoFormNames),
        url,
        geneSequence.replace(/\s/g,''),
        today.getTime(),
        geneID
      ]); 
    }

    return info;
    
  } catch(e){
    console.log(e);
    return 'error';
  }
}
module.exports.searchForGene = searchForGene;

async function getIsoForm(isoForm) {
  console.log(isoForm);
  try{
    const pool = await mysql.createPool({
      host: local.dbhost,
      port:local.dbport,
      user: local.dbuser,
      password: local.dbpassword,
      database: local.database,
      waitForConnections: true,
      connectionLimit: 100,
      queueLimit: 0
    });
    let testQuery,testQueryResults;
    
    testQuery = "SELECT * FROM gene_info WHERE gene_info.isoForm LIKE ? ";
    testQueryResults = await pool.execute(testQuery,[
      isoForm
    ]);
    console.log(testQueryResults[0][0]);
    return testQueryResults[0][0];
    
  } catch(e){
    console.log(e);
  }
}
module.exports.getIsoForm = getIsoForm;


async function searchForTargets(targetArea) {
   console.log('target area: ',targetArea)
    try {
      let browser = await puppeteer.launch({headless:true,args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ]});
      
      let page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
      await page.setDefaultTimeout(0); 
      await page.goto('http://targetfinder.flycrispr.neuro.brown.edu/');
      
      await page.select('select[name="genomeSelect"]', 'Dmelvc9');
      await page.type('#gDNA-form',targetArea);
      await page.click('button[name="routingVar"]');
      await page.waitForSelector('button[name="routingVar"]');
      await page.click('button[name="routingVar"]');
      await page.waitForSelector('.result',{timout:0});

      let isoForms = await page.$$eval('.result',elements=> elements.map(item=>item.textContent));
      
      let offTargets = await page.$$eval('.result > span:nth-of-type(2)',elements=> elements.map(item=>{
        if(!item.innerText.includes('Exact')){
          return item.innerText;
        }}));
      console.log('offtargets',offTargets);
      let distals = await page.$$eval('.result tbody tr:nth-of-type(1) .distal',elements=> elements.map(item=>item.innerText));
      let proximals = await page.$$eval('.result tbody tr:nth-of-type(1) .proximal',elements=> elements.map(item=>item.innerText));
      let pams = await page.$$eval('.result tbody tr:nth-of-type(1) .pam',elements=> elements.map(item=>item.innerText));
      let strands = await page.$$eval('.result tbody tr:nth-of-type(1) td:nth-of-type(2)',elements=> elements.map(item=>item.innerText));
      let labels = await page.$$eval('.result .target-label',elements=> elements.map(item=>item.innerText));
      browser.close();
      let results = [];
      let targets = [];
      for(let i=0;i< isoForms.length;i++){
        if(offTargets[i]==null){
          offTargets.splice(i,1);
          console.log(offTargets);
        }
        console.log(offTargets[i]);
        let offTarget = !offTargets[i]?null:offTargets[i].split(' ')[0];
        results.push({
          'offtarget':offTarget,
          'distal':distals[i],
          'proximal':proximals[i],
          'pam':pams[i],
          'strand':strands[i],
          'label':labels[i]
        });
        targets.push(proximals[i]+distals[i]);
      }
      console.log(results);
      return {
        'results':results,
        'targets':encodeURIComponent(targets.join('\n'))
      }
  }catch(e){
    console.log(e);
  }
}
module.exports.searchForTargets = searchForTargets;

async function checkTargetEfficiency(targets) {
  console.log('targets',targets);
  try {
    let browser = await puppeteer.launch({headless:true,args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]});
    
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    await page.goto('http://www.flyrnai.org/evaluateCrispr/');
    await page.type('#textAreaInput',targets);
    await page.click('input[value="Display Results"]');
    await page.waitForSelector('#dataTable');
    let targetList = await page.$$eval('#dataTable tr td:nth-of-type(2)',elements=> elements.map(item=>item.innerText));
    let scores = await page.$$eval('#dataTable tr td:nth-of-type(9)',elements=> elements.map(item=>item.innerText));
    let results = {};
    browser.close();
    for(let i=0;i<targetList.length;i++){
      results[targetList[i]] = scores[i];
    }
    console.log(results);
    return results;
  } catch(error) {
    return error;
  }
}
module.exports.checkTargetEfficiency = checkTargetEfficiency;

async function getOligos(target) {
  console.log(target);
  try {
    let browser = await puppeteer.launch({headless:true,args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]});
    
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    await page.goto('http://targetfinder.flycrispr.neuro.brown.edu/');
    await page.select('select[name="genomeSelect"]', 'Dmelvc9');
    await page.type('#gDNA-form',target);
    await page.click('button[name="routingVar"]');
    await page.waitForSelector('button[name="routingVar"]');
    await page.click('button[name="routingVar"]');
    await page.waitForSelector('.target-checkbox');
    await page.click('.target-checkbox');
    await page.click('button[name="routingVar"]');
    await page.waitForSelector('.oligo-order');
    let oligos = await page.$eval('.oligo-order',res=>res.innerText);
    let senseText = oligos.split('\n')[0].split('Sense oligo: ')[1];
    let antisenseText = oligos.split('\n')[1].split('Antisense oligo: ')[1];
    browser.close();
    return {
      'sense':senseText,
      'antisense':antisenseText
    };
  } catch(error) {
   return error;
  }
}
module.exports.getOligos = getOligos;

async function getPrimers(primerSections) {
  let primers = {};
  const url = 'https://primer3.ut.ee/'
  // const url = 'https://bioinfo.ut.ee/primer3-0.4.0/';
  console.log('Primer sections received:', primerSections);
  
  // Check if we have the required data
  if (!primerSections || !primerSections.sequence) {
    console.error('Missing required primer sections data');
    return null;
  }
  
  // For delete operation, we need to create separate primer sections for N and C terminals
  if (primerSections.startLocation !== undefined && primerSections.stopLocation !== undefined) {
    console.log('Processing delete primers with start:', primerSections.startLocation, 'stop:', primerSections.stopLocation);
    
    // Create primer sections for N and C terminals
    const sequence = primerSections.sequence;
    const startLoc = primerSections.startLocation;
    const stopLoc = primerSections.stopLocation;
    
    // Extract sequences for homology and sequencing primers
    // These values might need adjustment based on your specific requirements
    const nTerminal5Homology = sequence.substring(Math.max(0, startLoc - 1000), startLoc);
    const nTerminal3Homology = sequence.substring(Math.max(0, startLoc - 500), startLoc);
    const nTerminal5Sequencing = sequence.substring(Math.max(0, startLoc - 1500), startLoc - 500);
    const nTerminal3Sequencing = sequence.substring(Math.max(0, startLoc - 2000), startLoc - 1000);
    
    const cTerminal5Homology = sequence.substring(stopLoc, Math.min(sequence.length, stopLoc + 500));
    const cTerminal3Homology = sequence.substring(stopLoc, Math.min(sequence.length, stopLoc + 1000));
    const cTerminal5Sequencing = sequence.substring(Math.min(sequence.length, stopLoc + 500), Math.min(sequence.length, stopLoc + 1500));
    const cTerminal3Sequencing = sequence.substring(Math.min(sequence.length, stopLoc + 1000), Math.min(sequence.length, stopLoc + 2000));
    
    // Process N-terminal primers
    const nPrimers = await processPrimers({
      "5' Homology": nTerminal5Homology,
      "5' Sequence": nTerminal5Sequencing,
      "3' Sequence": nTerminal3Sequencing,
      "3' Homology": nTerminal3Homology
    });
    
    // Process C-terminal primers
    const cPrimers = await processPrimers({
      "5' Homology": cTerminal5Homology,
      "5' Sequence": cTerminal5Sequencing,
      "3' Sequence": cTerminal3Sequencing,
      "3' Homology": cTerminal3Homology
    });
    
    // Combine results with terminal suffix
    primers = {
      hom5_N: nPrimers.hom5 || [],
      seq5_N: nPrimers.seq5 || [],
      seq3_N: nPrimers.seq3 || [],
      hom3_N: nPrimers.hom3 || [],
      hom5_C: cPrimers.hom5 || [],
      seq5_C: cPrimers.seq5 || [],
      seq3_C: cPrimers.seq3 || [],
      hom3_C: cPrimers.hom3 || []
    };
    
    return primers;
  } else {
    // For tag operation, we use the targetLocation
    console.log('Processing tag primers with targetLocation:', primerSections.targetLocation);
    
    // Extract sequences for homology and sequencing primers
    // These values might need adjustment based on your specific requirements
    const sequence = primerSections.sequence;
    const targetLoc = primerSections.targetLocation;
    
    const homology5 = sequence.substring(Math.max(0, targetLoc - 1000), targetLoc);
    const homology3 = sequence.substring(targetLoc, Math.min(sequence.length, targetLoc + 1000));
    const sequencing5 = sequence.substring(Math.max(0, targetLoc - 2000), targetLoc - 1000);
    const sequencing3 = sequence.substring(Math.min(sequence.length, targetLoc + 1000), Math.min(sequence.length, targetLoc + 2000));
    
    return processPrimers({
      "5' Homology": homology5,
      "5' Sequence": sequencing5,
      "3' Sequence": sequencing3,
      "3' Homology": homology3
    });
  }
  
  // Helper function to process primers using Primer3
  async function processPrimers(primerSections) {
    let primers = {};
    let browser = await puppeteer.launch({headless:true,args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]});
    
    try {
      for(let i=0;i<4;i++){
        let currentPrimer = !primers['hom5']?"5' Homology":!primers['seq5']?"5' Sequence":!primers['seq3']?"3' Sequence":"3' Homology";
        let primerSection = primerSections[currentPrimer];
        let primerSide = currentPrimer==="3' Homology"?'input[name="MUST_XLATE_PRIMER_PICK_LEFT_PRIMER"]':currentPrimer==="3' Sequence"?'input[name="MUST_XLATE_PRIMER_PICK_LEFT_PRIMER"]':'input[name="MUST_XLATE_PRIMER_PICK_RIGHT_PRIMER"]';
        console.log('Processing primer section:', currentPrimer, 'length:', primerSection ? primerSection.length : 0);
        
        if (!primerSection || primerSection.length < 20) {
          console.error(`Invalid primer section for ${currentPrimer}: ${primerSection}`);
          continue; // Skip this section if data is invalid
        }
        
        let page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
        
        console.log("Going to Primer3...");
        await page.goto(url);
        
        console.log("Waiting for textarea...");
        await page.waitForSelector('textarea[name="SEQUENCE_TEMPLATE"]')

        console.log("Typing sequence...");
        await page.type('textarea[name="SEQUENCE_TEMPLATE"]', primerSection);
        
        console.log("Clicking primer side...");
        await page.click(primerSide);
        
        console.log("Clicking submit...");
        await page.click('input[name="Pick Primers"]')
        
        console.log("Waiting for navigation...");
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        // await page.waitForSelector('a[href="/primer3-0.4.0/primer3_www_results_help.html#PRIMER_OLIGO_SEQ"]');

        console.log("Waiting for results <pre> tag...");
        let primersText = await page.$eval('pre:first-of-type',res=>res.innerText);
        
        console.log("primers Text:", primersText)
        let primerStart = [];
        let stop = 0;
        let finalStop = 0;
        for(let i=0;i<primersText.length;i++) {
          if(primersText.slice(i,i+6)==='PRIMER'){
            primerStart.push(i);
          } else if(primersText.slice(i,i+13)==='SEQUENCE SIZE') {
            stop = i;
          } else if(primersText.slice(i,i+10)==='Statistics') {
            finalStop = i;
          }
        }

        if (primerStart.length === 0) {
          console.error(`No primers found for ${currentPrimer}`);
          continue; // Skip if no primers found
        }

        const firstPrimer = primersText.slice(primerStart[0],stop).replace(/[\n\r]/g,'').split(' ').filter((el)=>{return el != ''});
        let allPrimers = [firstPrimer];
        for(let i=1;i<primerStart.length;i++){
          const primer = primersText.slice(primerStart[i],!primerStart[i+1]?finalStop:primerStart[i+1]).replace(/[\n\r]/g,'').split(' ').filter((el)=>{return el != ''});
          allPrimers.push(primer);
        }
        
        if(currentPrimer==="5' Homology"){
          primers['hom5'] = allPrimers;
        } else if(currentPrimer==="5' Sequence") {
          primers['seq5'] = allPrimers;
        } else if(currentPrimer==="3' Sequence") {
          primers['seq3'] = allPrimers;
        } else {
          primers['hom3'] = allPrimers; 
        }
        
        await page.close();
      }
    } catch(error) {
      console.error('Error processing primers:', error);
      browser.close();
      return null;
    }
    
    browser.close();
    return primers;
  }
}
module.exports.getPrimers = getPrimers;