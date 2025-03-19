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
  console.log('targets', targets);
  let browser;
  
  try {
    // Parse the targets to get an array
    const targetsArray = JSON.parse(targets);
    console.log('Fetching efficiency scores for', targetsArray.length, 'targets');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    // Create a new page
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
    
    // Add page error logging
    page.on('error', err => {
      console.error('Page error:', err);
    });
    
    page.on('console', msg => {
      console.log('Page console:', msg.text());
    });
    
    // Navigate to the efficiency predictor page
    console.log('Navigating to evaluateCrispr site...');
    await page.goto('https://www.flyrnai.org/evaluateCrispr/', { timeout: 60000 });
    
    // Check if the page loaded correctly
    const pageContent = await page.content();
    if (!pageContent.includes('textAreaInput')) {
      console.error('Target efficiency page did not load correctly');
      if (browser) await browser.close();
      
      // Return an error
      return { error: 'Failed to load efficiency prediction page' };
    }
    
    // Enter the targets in the text area
    console.log('Page loaded, entering targets...');
    await page.type('#textAreaInput', targetsArray.join('\n'));
    
    // Make sure the "PAM is excluded from input sequence" radio button is selected
    await page.click('#noPamSeq');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'before_submit.png' });
    console.log('Screenshot saved to before_submit.png');
    
    // Submit the form
    console.log('Submitting form...');
    await Promise.all([
      page.click('input[value="Display Results"]'),
      page.waitForNavigation({ timeout: 60000 })
    ]);
    
    // Take a screenshot after submission
    await page.screenshot({ path: 'after_submit.png' });
    console.log('Screenshot saved to after_submit.png');
    
    // Get the page content to analyze
    const resultPageContent = await page.content();
    console.log('Result page loaded, extracting data...');
    
    // Save the HTML content for debugging
    const htmlContent = await page.content();
    require('fs').writeFileSync('results_page.html', htmlContent);
    console.log('Saved HTML content to results_page.html');
    
    // Extract the table data
    const tableData = await page.evaluate(() => {
      // Log the HTML structure to help debug
      console.log('Page HTML:', document.body.innerHTML);
      
      // Find all tables on the page
      const tables = document.querySelectorAll('table');
      console.log('Found', tables.length, 'tables on the page');
      
      if (tables.length === 0) return null;
      
      // Find the results table - it should have a header row with "Sequence" and "Score"
      let resultsTable = null;
      
      for (const table of tables) {
        console.log('Table rows:', table.rows.length);
        if (table.rows.length > 1) {
          // Check if this table has the expected headers
          const headerRow = table.rows[0];
          const headerText = headerRow.textContent.toLowerCase();
          console.log('Table header text:', headerText);
          
          if (headerText.includes('sequence') || headerText.includes('score')) {
            resultsTable = table;
            break;
          }
        }
      }
      
      if (!resultsTable) {
        console.log('No results table found with expected headers');
        
        // If we couldn't find a table with the expected headers, just use the first table with multiple rows
        for (const table of tables) {
          if (table.rows.length > 1) {
            resultsTable = table;
            break;
          }
        }
      }
      
      if (!resultsTable) {
        console.log('No results table found at all');
        return null;
      }
      
      console.log('Using table with', resultsTable.rows.length, 'rows');
      
      // Extract data from the table
      const data = [];
      
      // The table structure is known:
      // Column 1 (index 1): Input Sequence
      // Column 8 (index 8): Score
      const sequenceCol = 1; // Input Sequence column
      const scoreCol = 8;    // Score column
      
      console.log('Using fixed columns:', sequenceCol, 'for sequence and', scoreCol, 'for score');
      
      // Extract the data from each row
      for (let i = 1; i < resultsTable.rows.length; i++) { // Skip header row
        const row = resultsTable.rows[i];
        
        if (row.cells.length > Math.max(sequenceCol, scoreCol)) {
          const sequence = row.cells[sequenceCol].textContent.trim();
          const score = row.cells[scoreCol].textContent.trim();
          
          console.log('Row', i, 'sequence:', sequence, 'score:', score);
          
          data.push({
            sequence: sequence,
            score: score
          });
        }
      }
      
      return data;
    });
    
    // Process the extracted data
    let results = {};
    
    if (tableData && tableData.length > 0) {
      console.log('Found', tableData.length, 'results in the table');
      
      // Create a mapping of sequence to score
      for (const item of tableData) {
        results[item.sequence] = item.score;
      }
    } else {
      console.error('No results found in the table');
      
      // Return an error
      if (browser) await browser.close();
      return { error: 'No results found in the efficiency prediction table' };
    }
    
    console.log('Efficiency results:', results);
    if (browser) await browser.close();
    return results;
  } catch (error) {
    console.error('Error in checkTargetEfficiency:', error);
    if (browser) await browser.close();
    return { error: 'Failed to process target efficiency: ' + error.message };
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
  const url = 'https://bioinfo.ut.ee/primer3-0.4.0/';
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
        let primerSide = currentPrimer==="3' Homology"?'input[name="MUST_XLATE_PICK_LEFT"]':currentPrimer==="3' Sequence"?'input[name="MUST_XLATE_PICK_LEFT"]':'input[name="MUST_XLATE_PICK_RIGHT"]';
        console.log('Processing primer section:', currentPrimer, 'length:', primerSection ? primerSection.length : 0);
        
        if (!primerSection || primerSection.length < 20) {
          console.error(`Invalid primer section for ${currentPrimer}: ${primerSection}`);
          continue; // Skip this section if data is invalid
        }
        
        let page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
        await page.goto(url);
        
        await page.waitForSelector('textarea[name="SEQUENCE"]')
        await page.type('textarea[name="SEQUENCE"]', primerSection);
        await page.click(primerSide);
        await page.click('input[name="Pick Primers"]')
        await page.waitForSelector('a[href="/primer3-0.4.0/primer3_www_results_help.html#PRIMER_OLIGO_SEQ"]');
        let primersText = await page.$eval('pre:first-of-type',res=>res.innerText);
        
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
