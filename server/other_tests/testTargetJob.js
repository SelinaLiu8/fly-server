const { searchForTargets } = require('../src/utils/targetHandler')

async function test() {
    const targetArea = 'ATGCCCTTTGGGAAATTTCCCGGGAAATGCCCTTTAAGGCCGGAATTCCGGAAATTTCCCGGGAAATGCCCTTT';
    const result = await searchForTargets(targetArea);
    console.log(result);
}

test();