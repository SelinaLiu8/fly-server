const { chromium } = require('playwright');

async function searchForPrimers(primerArea) {
    console.log('Primer sections received:', primerArea);

    // Validate required primer sections
    const requiredSections = ["5' Homology", "5' Sequence", "3' Sequence", "3' Homology"];
    for (const key of requiredSections) {
        if (!primerArea[key] || primerArea[key].length < 20) {
        console.error(`Missing or invalid primer section for: ${key}`);
        return null;
        }
    }

    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-gpu'],
    });

    // Store results in structured key-value pairs
    const primers = {};

    try {
        for (const type of requiredSections) {
        console.log(`Processing ${type}...`);
        const primerResult = await processPrimerType(browser, primerArea[type], type);

        // Map results to a clean key
        if (type === "5' Homology") primers.hom5 = primerResult;
        else if (type === "5' Sequence") primers.seq5 = primerResult;
        else if (type === "3' Sequence") primers.seq3 = primerResult;
        else if (type === "3' Homology") primers.hom3 = primerResult;
        }
    } catch (err) {
        console.error('Error during primer processing:', err);
    } finally {
        await browser.close();
    }

    return primers;
}

async function processPrimerType(browser, primerSequence, primerType) {
    const url = 'https://primer3.ut.ee/';
    const context = await browser.newContext({
        userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
    });
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('textarea[name="SEQUENCE_TEMPLATE"]');

        // Fill in the sequence text
        await page.fill('textarea[name="SEQUENCE_TEMPLATE"]', primerSequence);

        // Choose correct side based on type
        const sideSelector =
        primerType.includes("3'")
            ? 'input[name="MUST_XLATE_PRIMER_PICK_LEFT_PRIMER"]'
            : 'input[name="MUST_XLATE_PRIMER_PICK_RIGHT_PRIMER"]';

        await page.click(sideSelector);

        // Submit form
        await page.click('input[name="Pick Primers"]');
        console.log('form submitted')

        // Extract and parse text
        const primersText = await extractPrimerText(page);
        const parsedPrimers = parsePrimersFromText(primersText);
        console.log(primersText);

        console.log(`Found ${Object.keys(parsedPrimers).length} primers for ${primerType}`);
        return parsedPrimers;
    } catch (err) {
        console.error(`Failed to process ${primerType}:`, err.message);
        return null;
    } finally {
        await page.close();
    }
}

async function extractPrimerText(page) {
    await page.waitForSelector('pre', { timeout: 15000 }); 
    return await page.$eval('pre', el => el.innerText);
}

function parsePrimersFromText(primersText) {
  // Clean up text first
  const cleanText = primersText
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\r?\n|\r/g, "\n")
    .trim();

  const primers = {};

  // Match both primary and additional primer lines
  const primerRegex =
    /(?:(\d+)\s+)?(LEFT_PRIMER|RIGHT_PRIMER)\s+(\d+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([ACGT]+)/g;

  let match;
  let index = 1;
  while ((match = primerRegex.exec(cleanText)) !== null) {
    const id = match[1] ? parseInt(match[1]) : index++;
    const key = `${match[2]}_${id}`;

    primers[key] = {
      type: match[2],
      start: parseInt(match[3]),
      length: parseInt(match[4]),
      tm: parseFloat(match[5]),
      gcPercent: parseFloat(match[6]),
      anyTh: parseFloat(match[7]),
      threeTh: parseFloat(match[8]),
      hairpin: parseFloat(match[9]),
      sequence: match[10],
    };
  }

  // Extract SEQUENCE SIZE
  const seqSizeMatch = cleanText.match(/SEQUENCE SIZE:\s*(\d+)/);
  const sequenceSize = seqSizeMatch ? parseInt(seqSizeMatch[1]) : null;

  // Extract statistics summary
  const statsSection = cleanText.split("Statistics")[1] || "";
  const statsMatch = statsSection.match(/Right\s+([\d\s]+)/);
  const stats = statsMatch
    ? statsMatch[1].trim().split(/\s+/).map(Number)
    : [];

  return {
    primers,
  };
}

function trimPrimerResults(primers) {
  if (!Array.isArray(primers)) {
    console.error("Invalid primers input:", primers);
    return [];
  }

  return primers.map(p => ({
    PrimerSequence: p[0],
    Tm: p[1],
    GCPercent: p[2],
    AnyValue: p[3],
    ThreePrime: p[4]
  }));
}

module.exports = {
    searchForPrimers,
    parsePrimersFromText,
    trimPrimerResults,
    processPrimerType
}