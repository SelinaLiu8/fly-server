const { checkTargetEfficiency } = require('../puppeteer'); // adjust if your path is different

// Your encoded target string
const rawEncodedTargets = `CTCTCCTTTCTTCTTTACTA%0ACAAGATGGCCGCGAAGCCCG%0AGCTCTTATCCTCGGGCTTCG%0AGGATAAGAGCACGGATATTC%0ACAGTCCGTAGTAAAGAAGAA%0AAAGAAGAAAGGAGAGCAAGA%0AGAAGCCCGAGGATAAGAGCA%0AATATCCGTGCTCTTATCCTC`;

// Step 1: Decode the input
const decoded = decodeURIComponent(rawEncodedTargets);

// Step 2: Convert to array of sequences
const targetArray = decoded
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean);

// Optional: log targetArray for verification
console.log("📦 Targets to test:", targetArray);

// Step 3: Call the function with JSON string input
(async () => {
  try {
    console.log("🔬 Running checkTargetEfficiency...");
    const result = await checkTargetEfficiency(JSON.stringify(targetArray));
    console.log("✅ Efficiency Results:\n", result);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
})();