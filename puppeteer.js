const local = require('./.env.js');
const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

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
  let browser;
  try {
    const targetsArray = typeof targets === 'string' ? JSON.parse(targets) : targets;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.flyrnai.org/evaluateCrispr/', { waitUntil: 'domcontentloaded' });

    // Fill in sequences and options
    await page.type('#textAreaInput', targetsArray.join('\n'));
    await page.click('#noPamSeq');

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('input[value="Display Results"]')
    ]);

    // Wait for results table to load
    await page.waitForSelector('#dataTable');

    // Scrape the table rows
    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#dataTable tbody tr'));
      const results = {};
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 9) {
          const sequence = cells[1].innerText.trim();
          const score = cells[8].innerText.trim();
          results[sequence] = score;
        }
      });
      return results;
    });

    await browser.close();
    return data;

  } catch (error) {
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
  const url = 'https://primer3.ut.ee/';

  console.log('Primer sections received:', primerSections);

  if (!primerSections || !primerSections["5' Homology"]) {
    console.error('Missing required primer sections data');
    return null;
  }

  const processed = await processPrimers(primerSections);
  return trimPrimerResults(processed);

  async function processPrimers(primerSections) {
    let primers = {};
    const browser = await puppeteer.launch({
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

    try {
      for (let i = 0; i < 4; i++) {
        const currentPrimer =
          !primers['hom5'] ? "5' Homology" :
          !primers['seq5'] ? "5' Sequence" :
          !primers['seq3'] ? "3' Sequence" :
          "3' Homology";

        const primerSection = primerSections[currentPrimer];
        const primerSide = (currentPrimer === "3' Homology" || currentPrimer === "3' Sequence")
          ? 'input[name="MUST_XLATE_PRIMER_PICK_LEFT_PRIMER"]'
          : 'input[name="MUST_XLATE_PRIMER_PICK_RIGHT_PRIMER"]';

        if (!primerSection || primerSection.length < 20) {
          console.error(`Invalid primer section for ${currentPrimer}`);
          continue;
        }

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
        await page.goto(url);
        await page.waitForSelector('textarea[name="SEQUENCE_TEMPLATE"]');
        await page.type('textarea[name="SEQUENCE_TEMPLATE"]', primerSection);
        await page.click(primerSide);
        await page.click('input[name="Pick Primers"]');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        const primersText = await page.$eval('pre:first-of-type', res => res.innerText);
        let primerStart = [], stop = 0, finalStop = 0;

        for (let i = 0; i < primersText.length; i++) {
          if (primersText.slice(i, i + 6) === 'PRIMER') {
            primerStart.push(i);
          } else if (primersText.slice(i, i + 13) === 'SEQUENCE SIZE') {
            stop = i;
          } else if (primersText.slice(i, i + 10) === 'Statistics') {
            finalStop = i;
          }
        }

        if (primerStart.length === 0) {
          console.error(`No primers found for ${currentPrimer}`);
          await page.close();
          continue;
        }

        const firstPrimer = primersText.slice(primerStart[0], stop).replace(/[\n\r]/g, '').split(' ').filter(Boolean);
        const allPrimers = [firstPrimer];

        for (let i = 1; i < primerStart.length; i++) {
          const next = primersText.slice(
            primerStart[i],
            primerStart[i + 1] ? primerStart[i + 1] : finalStop
          ).replace(/[\n\r]/g, '').split(' ').filter(Boolean);
          allPrimers.push(next);
        }

        if (currentPrimer === "5' Homology") primers['hom5'] = allPrimers;
        else if (currentPrimer === "5' Sequence") primers['seq5'] = allPrimers;
        else if (currentPrimer === "3' Sequence") primers['seq3'] = allPrimers;
        else primers['hom3'] = allPrimers;

        await page.close();
      }
    } catch (error) {
      console.error('Error processing primers:', error);
      await browser.close();
      return null;
    }

    await browser.close();
    return primers;
  }

  function trimPrimerResults(primerData) {
    const result = {};
    for (const [key, value] of Object.entries(primerData)) {
      result[key] = Array.isArray(value) ? value.slice(2) : [];
    }

    return result;
  }
}

module.exports.getPrimers = getPrimers;
