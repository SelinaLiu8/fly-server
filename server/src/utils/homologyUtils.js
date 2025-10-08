const { chromium } = require('playwright');

async function searchForPrimers(primerArea) {
  console.log('Primer sections received:', primerArea);

  if (!primerArea || !primerArea["5' Homology"]) {
    console.error('Missing required primer sections data');
    return null;
  }

  const processed = await processAllPrimers(primerArea);
  return trimPrimerResults(processed);
}

async function processAllPrimers(primerArea) {
  const url = 'https://primer3.ut.ee/';
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
  });

  const primers = {
    hom5: null,
    seq5: null,
    seq3: null,
    hom3: null,
  };

  try {
    for (const type of ["5' Homology", "5' Sequence", "3' Sequence", "3' Homology"]) {
      if (!primerArea[type] || primerArea[type].length < 20) {
        console.error(`Invalid or missing primer section for ${type}`);
        continue;
      }

      console.log(`Processing ${type}...`);
      const primerResult = await getPrimerFromWeb(context, url, primerArea[type], type);

      if (primerResult) {
        if (type === "5' Homology") primers.hom5 = primerResult;
        else if (type === "5' Sequence") primers.seq5 = primerResult;
        else if (type === "3' Sequence") primers.seq3 = primerResult;
        else if (type === "3' Homology") primers.hom3 = primerResult;
      }
    }
  } catch (err) {
    console.error('Error processing primers:', err);
  } finally {
    await browser.close();
  }

  return primers;
}

async function getPrimerFromWeb(context, url, primerSection, primerType) {
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('textarea[name="SEQUENCE_TEMPLATE"]');

    await page.fill('textarea[name="SEQUENCE_TEMPLATE"]', primerSection);

    const sideSelector =
      primerType === "3' Homology" || primerType === "3' Sequence"
        ? 'input[name="MUST_XLATE_PRIMER_PICK_LEFT_PRIMER"]'
        : 'input[name="MUST_XLATE_PRIMER_PICK_RIGHT_PRIMER"]';

    await page.click(sideSelector);
    await page.click('input[name="Pick Primers"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });

    const primersText = await extractPrimerText(page);
    const parsedPrimers = parsePrimersFromText(primersText);

    console.log(`✅ Found ${parsedPrimers.length} primer(s) for ${primerType}`);
    return parsedPrimers;
  } catch (err) {
    console.error(`❌ Failed to process ${primerType}:`, err.message);
    return null;
  } finally {
    await page.close();
  }
}

async function extractPrimerText(page) {
  return await page.$eval('pre:first-of-type', el => el.innerText);
}

function parsePrimersFromText(primersText) {
  const primerStart = [];
  let stop = 0, finalStop = 0;

  for (let i = 0; i < primersText.length; i++) {
    if (primersText.slice(i, i + 6) === 'PRIMER') primerStart.push(i);
    else if (primersText.slice(i, i + 13) === 'SEQUENCE SIZE') stop = i;
    else if (primersText.slice(i, i + 10) === 'Statistics') finalStop = i;
  }

  if (primerStart.length === 0) return [];

  const allPrimers = [];
  for (let i = 0; i < primerStart.length; i++) {
    const segment = primersText.slice(
      primerStart[i],
      primerStart[i + 1] ? primerStart[i + 1] : finalStop
    );
    const clean = segment.replace(/[\n\r]/g, '').split(' ').filter(Boolean);
    allPrimers.push(clean);
  }

  return allPrimers;
}

function trimPrimerResults(primerData) {
  const result = {};
  for (const [key, value] of Object.entries(primerData)) {
    result[key] = Array.isArray(value) ? value.slice(2) : [];
  }
  return result;
}

module.exports = {
    searchForPrimers
}