const { chromium } = require('playwright');

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
  console.log('target area:', targetArea);

  try {
    // launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
    });
    const page = await context.newPage();

    // navigate
    await page.goto('http://targetfinder.flycrispr.neuro.brown.edu/', {
      timeout: 0,
    });

    // fill form
    await page.selectOption('select[name="genomeSelect"]', 'Dmelvc9');
    await page.fill('#gDNA-form', targetArea);

    // click button
    await page.click('button[name="routingVar"]');

    // wait for results
    await page.waitForSelector('.result', { timeout: 0 });

    // scrape results
    const isoForms = await page.$$eval('.result', els =>
      els.map(e => e.textContent.trim())
    );

    const offTargets = await page.$$eval(
      '.result > span:nth-of-type(2)',
      els =>
        els.map(item =>
          !item.innerText.includes('Exact') ? item.innerText : null
        )
    );

    const distals = await page.$$eval(
      '.result tbody tr:nth-of-type(1) .distal',
      els => els.map(e => e.innerText)
    );

    const proximals = await page.$$eval(
      '.result tbody tr:nth-of-type(1) .proximal',
      els => els.map(e => e.innerText)
    );

    const pams = await page.$$eval(
      '.result tbody tr:nth-of-type(1) .pam',
      els => els.map(e => e.innerText)
    );

    const strands = await page.$$eval(
      '.result tbody tr:nth-of-type(1) td:nth-of-type(2)',
      els => els.map(e => e.innerText)
    );

    const labels = await page.$$eval('.result .target-label', els =>
      els.map(e => e.innerText)
    );

    await browser.close();

    let results = [];
    let targets = [];

    for (let i = 0; i < isoForms.length; i++) {
      const offTarget = !offTargets[i] ? null : offTargets[i].split(' ')[0];
      results.push({
        offtarget: offTarget,
        distal: distals[i],
        proximal: proximals[i],
        pam: pams[i],
        strand: strands[i],
        label: labels[i],
      });
      targets.push(proximals[i] + distals[i]);
    }

    console.log('Scraped results:', results);

    return {
      results,
      targets: encodeURIComponent(targets.join('\n')),
    };
  } catch (e) {
    console.error('Error in searchForTargets:', e);
  }
}

module.exports = { 
    computeStartStopCodons,
    searchForTargets
}