const { chromium } = require('playwright');

async function getAllIsoforms() {
    const [rows] = await db.query("SELECT * FROM IsoformInfo");
    return rows;
}

function computeStartStopCodons(fullSequence, isoformSequence) {
    if (!fullSequence || !isoformSequence) {
      console.error("Missing sequence or isoform sequence for highlighting");
      return null;
    }
  
    const startSequence = isoformSequence.slice(0, 9);
    const stopSequence = isoformSequence.slice(-10);
  
    const startIndex = fullSequence.indexOf(startSequence);
    const stopIndex = fullSequence.indexOf(stopSequence);
  
    if (startIndex === -1 || stopIndex === -1) {
      console.error("Start or Stop sequence not found in the full sequence!");
      return null;
    }
  
    return {
      startIndex,
      stopIndex
    };
}

async function searchForTargets(targetArea) {
  console.log('Searching for targets in:', targetArea);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to site...');
    await page.goto('http://targetfinder.flycrispr.neuro.brown.edu/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000, // 1 minute max
    });

    console.log('Selecting genome and filling form...');
    await page.selectOption('select[name="genomeSelect"]', 'Dmelvc9');
    await page.fill('#gDNA-form', targetArea);

    console.log('Submitting form...');
    await page.waitForSelector('button[name="routingVar"]');
    await page.click('button[name="routingVar"]');
    await page.click('button[name="routingVar"]');

    // Wait for results to load
    console.log('Waiting for results...');
    await page.waitForSelector('.result', { timeout: 120000 }); // 2 minutes

    console.log('Extracting data...');
    const results = await page.$$eval('.result', els =>
      els.map(e => e.textContent.trim())
    );

    console.log(`Found ${results.length} result entries.`);

    // Extract extra details safely
    const distals = await page.$$eval('.distal', els =>
      els.map(e => e.innerText.trim())
    );
    const proximals = await page.$$eval('.proximal', els =>
      els.map(e => e.innerText.trim())
    );
    const pams = await page.$$eval('.pam', els =>
      els.map(e => e.innerText.trim())
    );
    const strands = await page.$$eval('td:nth-of-type(2)', els =>
      els.map(e => e.innerText.trim())
    );
    const labels = await page.$$eval('.target-label', els =>
      els.map(e => e.innerText.trim())
    );

    const combined = [];
    for (let i = 0; i < results.length; i++) {
      combined.push({
        distal: distals[i] || null,
        proximal: proximals[i] || null,
        pam: pams[i] || null,
        strand: strands[i] || null,
        label: labels[i] || null,
      });
    }
    return combined;
  } catch (err) {
    console.error('Error in searchForTargets:', err);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = {
    getAllIsoforms, 
    computeStartStopCodons,
    searchForTargets
}